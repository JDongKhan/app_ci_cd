import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { config as loadEnv } from "dotenv";
import * as path from "node:path";
import { AppModule } from "./app.module";
import { ensureDatabaseInitialized } from "./database/database-init";

// 与 ConfigModule 的加载顺序保持一致：仓库根目录 .env，其次当前目录 .env
function loadEnvironmentFiles(): void {
  for (const file of [
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), ".env")
  ]) {
    loadEnv({ path: file });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(",").map((item) => item.trim()) : true,
    credentials: true
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ShipFlow API")
    .setDescription("代码合并与打包平台 API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();

  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, swaggerConfig));
  app.enableShutdownHooks();

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`ShipFlow API listening on http://localhost:${port}/api`);
}

async function main() {
  loadEnvironmentFiles();
  // 必须在 Nest 初始化之前完成建库与初始化数据，避免模块初始化并发查询空库
  await ensureDatabaseInitialized();
  await bootstrap();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
