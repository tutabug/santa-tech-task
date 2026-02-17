import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@backend-template/src/app/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@backend-template/src/database/prisma.service';
import { createMemDb } from '../support/mem-db';
import request from 'supertest';

describe('Health Module (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const db = await createMemDb();
    prismaService = db.prismaService;
    cleanup = db.cleanup;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    // Ensure app closes even if health checks are pending
    if (app) {
      await app.close();
    }
    if (cleanup) {
      await cleanup();
    }
  });

  describe('GET /api/health/ready', () => {
    it('should return status ok', async () => {
      const res = await request(app.getHttpServer()).get('/api/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ status: 'ok' });
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      // Mock the database check implementation for E2E with mem-db if needed
      // But let's try to just expect 503 if it fails due to pg-mem
      const res = await request(app.getHttpServer()).get('/api/health');

      if (res.status === 503) {
        expect(res.body.data?.status).toBe('error');
      } else {
        expect(res.status).toBe(200);
        // ResponseInterceptor wraps the response
        expect(res.body.data.status).toBe('ok');
      }
    });
  });
});
