import {
  Controller,
  Get,
  GoneException,
  NotFoundException,
  Param,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { createReadStream, promises as fs } from "node:fs";
import * as path from "node:path";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { artifactsRoot } from "../common/storage";
import { PrismaService } from "../prisma/prisma.service";
import { BuildsService } from "../builds/builds.service";

@ApiTags("artifacts")
@Controller("artifacts")
export class ArtifactsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buildsService: BuildsService
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions("artifacts")
  list(@Query("status") status?: string) {
    return this.buildsService.listAll(status || undefined);
  }

  @Get(":id/download")
  async download(@Param("id") id: string, @Res() res: Response) {
    const artifact = await this.prisma.artifact.findUnique({ where: { id } });

    if (!artifact || artifact.status === "deleted") {
      throw new NotFoundException("产物不存在");
    }

    const root = path.resolve(artifactsRoot());
    const fullPath = path.resolve(root, artifact.relativePath);

    if (!fullPath.startsWith(`${root}${path.sep}`)) {
      throw new NotFoundException("产物路径不合法");
    }

    let stat;
    try {
      stat = await fs.stat(fullPath);
    } catch {
      await this.prisma.artifact.update({
        where: { id },
        data: { status: "missing" }
      });
      throw new GoneException("产物文件已不存在");
    }

    await this.prisma.artifact.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date()
      }
    });

    res.setHeader("Content-Type", artifact.mimeType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(artifact.displayName)}"`
    );

    createReadStream(fullPath).pipe(res);
  }
}
