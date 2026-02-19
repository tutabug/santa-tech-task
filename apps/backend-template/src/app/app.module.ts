import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from '../modules/auth/auth.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { DatabaseModule } from '../database/database.module';
import { PrismaService } from '../database/prisma.service';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { HealthModule } from '../health/health.module';
import { LoggerModule } from 'nestjs-pino';
import { Module } from '@nestjs/common';
import { OrganizationModule } from '../modules/organization/organization.module';
import { PaginationModule } from '../common/pagination';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { SongModule } from '../modules/song/song.module';
import { UserModule } from '../modules/user/user.module';
import appConfig from '../config/app.config';
import { randomUUID } from 'crypto';
import { validate } from '../config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
      cache: true,
      expandVariables: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('app.logLevel', 'info'),
          redact: ['req.headers.authorization', 'req.headers.cookie'],
          autoLogging: {
            ignore: (req) =>
              req.url === '/health' || req.url === '/favicon.ico',
          },
          genReqId: (req) => req.headers['x-correlation-id'] || randomUUID(),
        },
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: import('express').Request) =>
          (req.headers['x-correlation-id'] as string) ?? randomUUID(),
      },
      plugins: [
        new ClsPluginTransactional({
          // DatabaseModule is global, so PrismaService is already available
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
    DatabaseModule,
    PaginationModule,
    AuthModule,
    UserModule,
    OrganizationModule,
    SongModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
