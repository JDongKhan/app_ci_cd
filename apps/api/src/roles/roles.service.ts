import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EDITABLE_ROLE_LEVELS, isValidRoleLevel } from "../common/constants";
import { DEFAULT_PERMISSIONS } from "./default-permissions";
import { PermissionItemDto } from "./dto/permissions.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPermissions() {
    const rows = await this.prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { level: "asc" }, { permissionKey: "asc" }]
    });

    const grouped = new Map<string, string[]>();
    for (const row of rows) {
      const key = `${row.role}/${row.level}`;
      const list = grouped.get(key) ?? [];
      list.push(row.permissionKey);
      grouped.set(key, list);
    }

    return {
      items: EDITABLE_ROLE_LEVELS.map(({ role, level }) => ({
        role,
        level,
        permissions: grouped.get(`${role}/${level}`) ?? []
      }))
    };
  }

  async updatePermissions(items: PermissionItemDto[]) {
    const normalized = this.normalizeItems(items);
    await this.replaceAll(normalized);
    return this.getPermissions();
  }

  async resetPermissions() {
    const items = Object.entries(DEFAULT_PERMISSIONS).map(([key, permissions]) => {
      const [role, level] = key.split("/");
      return { role, level, permissions };
    });

    await this.replaceAll(items);
    return this.getPermissions();
  }

  private async replaceAll(items: PermissionItemDto[]) {
    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany();

      for (const item of items) {
        for (const permissionKey of item.permissions) {
          await tx.rolePermission.create({
            data: {
              role: item.role,
              level: item.level,
              permissionKey
            }
          });
        }
      }
    });
  }

  private normalizeItems(items: PermissionItemDto[]): PermissionItemDto[] {
    const seen = new Set<string>();
    const normalized: PermissionItemDto[] = [];

    for (const item of items) {
      if (!isValidRoleLevel(item.role, item.level)) {
        throw new BadRequestException(`非法的角色级别：${item.role}/${item.level}`);
      }

      const key = `${item.role}/${item.level}`;
      if (seen.has(key)) {
        throw new BadRequestException(`角色级别重复：${key}`);
      }
      seen.add(key);

      const permissions = Array.from(
        new Set(
          item.permissions
            .map((permission) => permission.trim())
            .filter((permission) => permission.length > 0)
        )
      );

      for (const permission of permissions) {
        if (!/^[a-z][a-z0-9_]*$/.test(permission)) {
          throw new BadRequestException(`非法的权限 key：${permission}`);
        }
      }

      normalized.push({
        role: item.role,
        level: item.level,
        permissions
      });
    }

    return normalized;
  }
}
