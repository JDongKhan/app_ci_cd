import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppsModule } from "./apps/apps.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { RequirementsModule } from "./requirements/requirements.module";
import { RolesModule } from "./roles/roles.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"]
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AppsModule,
    RequirementsModule,
    TasksModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
