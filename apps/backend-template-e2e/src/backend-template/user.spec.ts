import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@backend-template/src/app/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@backend-template/src/database/prisma.service';
import { createMemDb } from '../support/mem-db';
import request from 'supertest';

describe('User & Auth (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let cleanup: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let agent: any;

  beforeAll(async () => {
    jest.setTimeout(30000);
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

    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (cleanup) {
      await cleanup();
    }
  });

  const uniqueId = Date.now();
  const testUser = {
    email: `e2e-test-${uniqueId}@example.com`,
    name: 'E2E Test User',
    password: 'Password123!',
  };

  describe('Auth Flow', () => {
    it('should register a new user', async () => {
      const res = await agent.post('/api/auth/sign-up').send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should login with the created user', async () => {
      const loginAgent = request.agent(app.getHttpServer());

      const res = await loginAgent.post('/api/auth/sign-in').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.header['set-cookie']).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('User Endpoints (Protected)', () => {
    it('should get current user profile', async () => {
      const res = await agent.get('/api/users/me');

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data.name).toBe(testUser.name);
    });

    it('should list all users', async () => {
      const res = await agent.get('/api/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const found = res.body.data.find((u: any) => u.email === testUser.email);
      expect(found).toBeDefined();
    });

    it('should get user by ID', async () => {
      const profileRes = await agent.get('/api/users/me');
      const userId = profileRes.body.data.id;

      const res = await agent.get(`/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userId);
    });

    it('should fail to access protected route without session', async () => {
      const res = await request(app.getHttpServer()).get('/api/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const res = await agent.post('/api/auth/sign-out');
      expect(res.status).toBe(200);

      const check = await agent.get('/api/users/me');
      expect(check.status).toBe(401);
    });
  });
});
