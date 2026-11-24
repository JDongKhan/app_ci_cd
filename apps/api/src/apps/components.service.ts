import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { AuthUser } from "../common/auth-user.interface";
import { GitService } from "../common/git.service";
import { workspaceRoot } from "../common/storage";
import { PrismaService } from "../prisma/prisma.service";
import { AddComponentsDto, UpdateComponentVersionDto } from "./dto/component.dto";

const COMPONENT_APP_SELECT = {
  id: true,
  name: true,
  code: true,
  repo: true,
  platform: true,
  isComponent: true
} as const;

@Injectable()
export class ComponentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gitService: GitService
  ) {}

  async list(appId: string) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException("应用不存在");
    }

    return this.listRows(appId);
  }

  async byCode(appCode: string) {
    const code = appCode?.trim();
    if (!code) {
      throw new BadRequestException("缺少 appCode");
    }

    const app = await this.prisma.app.findFirst({
      where: { code, isComponent: false },
      orderBy: { createdAt: "asc" }
    });

    if (!app) {
      throw new NotFoundException("应用不存在");
    }

    const rows = await this.prisma.appComponent.findMany({
      where: { appId: app.id },
      include: { componentApp: { select: COMPONENT_APP_SELECT } },
      orderBy: { createdAt: "asc" }
    });

    return {
      appId: app.id,
      appCode: app.code,
      appName: app.name,
      components: rows.map((row) => ({
        name: row.componentApp.name,
        code: row.componentApp.code,
        repo: row.componentApp.repo,
        version: row.version ?? "—"
      }))
    };
  }

  async add(appId: string, dto: AddComponentsDto, user: AuthUser) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException("应用不存在");
    }
    if (app.isComponent) {
      throw new BadRequestException("组件应用不能再添加组件");
    }

    const ids = Array.from(
      new Set(dto.componentAppIds.map((id) => id.trim()).filter(Boolean))
    );

    const componentApps = await this.prisma.app.findMany({
      where: { id: { in: ids } }
    });

    if (componentApps.length !== ids.length) {
      throw new BadRequestException("存在不存在的组件应用");
    }
    if (componentApps.some((item) => !item.isComponent)) {
      throw new BadRequestException("所选应用不是组件应用");
    }

    const existing = await this.prisma.appComponent.findMany({
      where: { appId, componentAppId: { in: ids } },
      select: { componentAppId: true }
    });
    const existingIds = new Set(existing.map((row) => row.componentAppId));
    const toAdd = componentApps.filter((item) => !existingIds.has(item.id));

    if (toAdd.length === 0) {
      throw new BadRequestException("所选组件都已添加");
    }

    for (const item of toAdd) {
      const version = await this.readVersion(
        item.id,
        item.repo,
        item.defaultBranch
      );
      await this.prisma.appComponent.create({
        data: {
          appId,
          componentAppId: item.id,
          version: version ?? "—",
          createdBy: user.id
        }
      });
    }

    return this.listRows(appId);
  }

  async remove(appId: string, componentAppId: string) {
    const row = await this.prisma.appComponent.findUnique({
      where: { appId_componentAppId: { appId, componentAppId } }
    });

    if (!row) {
      throw new NotFoundException("组件不存在");
    }

    await this.prisma.appComponent.delete({ where: { id: row.id } });
    return this.listRows(appId);
  }

  async updateVersion(dto: UpdateComponentVersionDto) {
    const appCode = dto.appCode.trim();
    const componentCode = dto.componentCode.trim();
    const version = dto.version.trim();

    const app = await this.prisma.app.findFirst({
      where: { code: appCode, isComponent: false },
      orderBy: { createdAt: "asc" }
    });
    if (!app) {
      throw new NotFoundException("应用不存在");
    }

    const componentApp = await this.prisma.app.findFirst({
      where: { code: componentCode, isComponent: true }
    });
    if (!componentApp) {
      throw new NotFoundException("组件应用不存在");
    }

    const row = await this.prisma.appComponent.findUnique({
      where: {
        appId_componentAppId: {
          appId: app.id,
          componentAppId: componentApp.id
        }
      }
    });
    if (!row) {
      throw new NotFoundException("该应用未关联此组件");
    }

    const updated = await this.prisma.appComponent.update({
      where: { id: row.id },
      data: { version }
    });

    return {
      appCode: app.code,
      componentCode: componentApp.code,
      componentName: componentApp.name,
      version: updated.version
    };
  }

  private async listRows(appId: string) {
    const rows = await this.prisma.appComponent.findMany({
      where: { appId },
      include: { componentApp: { select: COMPONENT_APP_SELECT } },
      orderBy: { createdAt: "asc" }
    });

    return rows.map((row) => ({
      id: row.id,
      version: row.version,
      createdAt: row.createdAt,
      component: row.componentApp
    }));
  }

  private async readVersion(
    appId: string,
    repo: string,
    defaultBranch: string
  ): Promise<string | null> {
    try {
      await this.gitService.ensureWorkspace(appId, repo, defaultBranch);
      const dir = path.join(workspaceRoot(), appId);

      const pubspec = await fs
        .readFile(path.join(dir, "pubspec.yaml"), "utf8")
        .catch(() => null);
      if (pubspec) {
        const match = pubspec.match(/^version:\s*([^\s#]+)/m);
        if (match) return match[1].split("+")[0];
      }

      const pkgRaw = await fs
        .readFile(path.join(dir, "package.json"), "utf8")
        .catch(() => null);
      if (pkgRaw) {
        const pkg = JSON.parse(pkgRaw) as { version?: string };
        if (typeof pkg.version === "string" && pkg.version) {
          return pkg.version;
        }
      }
    } catch {
      return null;
    }

    return null;
  }
}
