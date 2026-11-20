import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BRANCH_STAGES, BranchStage } from "../common/constants";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAppDto, UpdateAppDto } from "./dto/app.dto";

type AppRecord = {
  id: string;
  name: string;
  platform: string;
  code: string;
  repo: string;
  defaultBranch: string;
  buildScript: string;
  artifactType: string;
  artifactPattern: string | null;
  branchesJson: string;
  machine: string;
  stack: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AppBranches = Record<BranchStage, string>;

const DEFAULT_BRANCHES: AppBranches = {
  qa: "qa",
  uat: "uat",
  release: "release",
  master: "master"
};

@Injectable()
export class AppsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const apps = await this.prisma.app.findMany({
      orderBy: [{ platform: "asc" }, { createdAt: "asc" }]
    });

    return apps.map((app) => this.sanitize(app));
  }

  async create(dto: CreateAppDto) {
    try {
      const app = await this.prisma.app.create({
        data: this.buildData(dto)
      });
      return this.sanitize(app);
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateAppDto) {
    const exists = await this.prisma.app.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("应用不存在");
    }

    try {
      const app = await this.prisma.app.update({
        where: { id },
        data: this.buildData(dto)
      });
      return this.sanitize(app);
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  private buildData(dto: CreateAppDto) {
    return {
      name: dto.name.trim(),
      platform: dto.platform,
      code: dto.code.trim(),
      repo: dto.repo.trim(),
      defaultBranch: dto.defaultBranch?.trim() || "main",
      buildScript: dto.buildScript?.trim() || "./build_app",
      artifactType: dto.artifactType,
      artifactPattern: dto.artifactPattern?.trim() || null,
      branchesJson: JSON.stringify(this.normalizeBranches(dto.branches)),
      machine: dto.machine?.trim() || "builder-01",
      stack: dto.stack?.trim() || null
    };
  }

  private normalizeBranches(branches?: Record<string, string>): AppBranches {
    const result = { ...DEFAULT_BRANCHES };

    if (!branches) return result;

    for (const stage of BRANCH_STAGES) {
      const value = branches[stage];
      if (typeof value === "string" && value.trim()) {
        result[stage] = value.trim();
      }
    }

    return result;
  }

  private handleUniqueError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("同名同平台的应用已存在");
    }
  }

  private sanitize(app: AppRecord) {
    return {
      id: app.id,
      name: app.name,
      platform: app.platform,
      code: app.code,
      repo: app.repo,
      defaultBranch: app.defaultBranch,
      buildScript: app.buildScript,
      artifactType: app.artifactType,
      artifactPattern: app.artifactPattern,
      branches: this.parseBranches(app.branchesJson),
      machine: app.machine,
      stack: app.stack,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    };
  }

  private parseBranches(value: string): AppBranches {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      const result = { ...DEFAULT_BRANCHES };
      for (const stage of BRANCH_STAGES) {
        if (typeof parsed[stage] === "string" && parsed[stage]) {
          result[stage] = parsed[stage] as string;
        }
      }
      return result;
    } catch {
      return { ...DEFAULT_BRANCHES };
    }
  }
}
