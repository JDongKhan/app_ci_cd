import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuditInterceptor } from "./audit.interceptor";
import { LogsController } from "./logs.controller";
import { LogsService } from "./logs.service";

@Module({
  controllers: [LogsController],
  providers: [
    LogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    }
  ],
  exports: [LogsService]
})
export class LogsModule {}
