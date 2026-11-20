import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

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

bootstrap();
