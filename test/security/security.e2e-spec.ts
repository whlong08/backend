import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestHelper, SecurityTestUtils } from '../test-helpers';
import { testDbConfig } from '../test-db.config';

describe('Security Tests (e2e)', () => {
  let app: INestApplication;
  let helper: TestHelper;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(testDbConfig),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    helper = new TestHelper();
    await helper.setupTestApp(AppModule);
  });

  afterEach(async () => {
    await helper.closeTestApp();
    await app.close();
  });

  describe('Authentication Security', () => {
    it('should reject requests with invalid JWT tokens', async () => {
      for (const invalidToken of SecurityTestUtils.invalidTokens) {
        const response = await request(app.getHttpServer())
          .get('/user/profile')
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401);

        expect(response.body.message).toContain('Unauthorized');
      }
    });

    it('should prevent brute force attacks on login', async () => {
      const loginAttempts = [];

      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword',
          });

        loginAttempts.push(response.status);
      }

      // All attempts should fail with 401
      loginAttempts.forEach((status) => {
        expect(status).toBe(401);
      });
    });

    it('should validate password strength requirements', async () => {
      const weakPasswords = ['123', 'password', 'abc', '111111', 'qwerty'];

      for (const weakPassword of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'test@example.com',
            password: weakPassword,
          });

        expect(response.status).toBe(400);
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login endpoint', async () => {
      const results = await SecurityTestUtils.testSqlInjection(
        helper,
        '/auth/login',
        'email',
      );

      results.forEach((result) => {
        expect(result.vulnerable).toBe(false);
        expect(result.statusCode).not.toBe(200);
      });
    });

    it('should prevent SQL injection in search endpoints', async () => {
      const token = await helper.loginTestUser();

      for (const payload of SecurityTestUtils.sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .get(`/quests?search=${encodeURIComponent(payload)}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).not.toBe(500);
        expect(response.body).not.toContain('ERROR');
      }
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user input in profile updates', async () => {
      const token = await helper.loginTestUser();

      for (const xssPayload of SecurityTestUtils.xssPayloads) {
        const response = await request(app.getHttpServer())
          .patch('/user/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            bio: xssPayload,
          });

        // Should not reflect the script tags
        if (response.status === 200) {
          expect(response.body.bio).not.toContain('<script>');
          expect(response.body.bio).not.toContain('javascript:');
        }
      }
    });

    it('should sanitize quest titles and descriptions', async () => {
      const token = await helper.loginTestUser();

      for (const xssPayload of SecurityTestUtils.xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/quests')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: xssPayload,
            description: xssPayload,
            type: 'daily',
            difficulty: 'easy',
            category: 'study',
            reward_points: 100,
            reward_experience: 50,
          });

        if (response.status === 201) {
          expect(response.body.title).not.toContain('<script>');
          expect(response.body.description).not.toContain('<script>');
        }
      }
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized access to protected routes', async () => {
      const protectedRoutes = [
        { method: 'get', path: '/user/profile' },
        { method: 'patch', path: '/user/profile' },
        { method: 'get', path: '/quests' },
        { method: 'post', path: '/quests' },
        { method: 'get', path: '/guilds' },
        { method: 'post', path: '/guilds' },
        { method: 'get', path: '/notifications' },
        { method: 'post', path: '/aichat/chat' },
      ];

      for (const route of protectedRoutes) {
        const response = await (request(app.getHttpServer()) as any)[
          route.method
        ](route.path);

        expect(response.status).toBe(401);
      }
    });

    it('should prevent users from accessing other users data', async () => {
      // Create two users
      const user1 = await helper.createTestUser({
        email: helper.generateRandomEmail(),
        username: helper.generateRandomUsername(),
      });
      const user2 = await helper.createTestUser({
        email: helper.generateRandomEmail(),
        username: helper.generateRandomUsername(),
      });

      const token1 = await helper.loginTestUser(user1.user.email);
      const token2 = await helper.loginTestUser(user2.user.email);

      // User1 tries to access User2's data
      const response = await request(app.getHttpServer())
        .get(`/user/${user2.user.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403);

      expect(response.body.message).toContain('Forbidden');
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting on authentication endpoints', async () => {
      const requests = [];

      // Make multiple rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app.getHttpServer()).post('/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      // Should have some rate limited responses
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com',
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: email,
            password: 'validpassword123',
          });

        expect(response.status).toBe(400);
      }
    });

    it('should validate required fields', async () => {
      const invalidPayloads = [
        {}, // Empty payload
        { username: 'test' }, // Missing email and password
        { email: 'test@example.com' }, // Missing username and password
        { password: 'password123' }, // Missing username and email
      ];

      for (const payload of invalidPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(payload);

        expect(response.status).toBe(400);
      }
    });
  });

  describe('CORS and Headers', () => {
    it('should set proper security headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/login')
        .expect(405); // Method not allowed for GET on login

      // Check for security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });
});
