import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { testDbConfig } from './test-db.config';
import * as request from 'supertest';

export class TestHelper {
  private app: INestApplication;
  private moduleRef: TestingModule;

  async setupTestApp(moduleToTest: any): Promise<INestApplication> {
    this.moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(testDbConfig),
        moduleToTest,
      ],
    }).compile();

    this.app = this.moduleRef.createNestApplication();
    await this.app.init();
    return this.app;
  }

  async closeTestApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
    if (this.moduleRef) {
      await this.moduleRef.close();
    }
  }

  getApp(): INestApplication {
    return this.app;
  }

  getModuleRef(): TestingModule {
    return this.moduleRef;
  }

  async createTestUser(userDto: any = {}): Promise<any> {
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      ...userDto,
    };

    const response = await request(this.app.getHttpServer())
      .post('/auth/register')
      .send(defaultUser)
      .expect(201);

    return response.body;
  }

  async loginTestUser(
    email = 'test@example.com',
    password = 'password123',
  ): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return response.body.accessToken;
  }

  async createAuthenticatedRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    token?: string,
  ): Promise<request.Test> {
    if (!token) {
      token = await this.loginTestUser();
    }

    return request(this.app.getHttpServer())
      [method](url)
      .set('Authorization', `Bearer ${token}`);
  }

  generateRandomEmail(): string {
    return `test${Date.now()}@example.com`;
  }

  generateRandomUsername(): string {
    return `user${Date.now()}`;
  }
}

// Mock data generators
export const MockData = {
  user: (overrides = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    bio: 'Test user bio',
    ...overrides,
  }),

  quest: (overrides = {}) => ({
    title: 'Test Quest',
    description: 'A test quest description',
    type: 'daily',
    difficulty: 'easy',
    category: 'study',
    reward_points: 100,
    reward_experience: 50,
    requirements: {},
    ...overrides,
  }),

  guild: (overrides = {}) => ({
    name: 'Test Guild',
    description: 'A test guild description',
    is_public: true,
    max_members: 50,
    ...overrides,
  }),

  chatMessage: (overrides = {}) => ({
    content: 'Test message content',
    ...overrides,
  }),

  notification: (overrides = {}) => ({
    type: 'friend_request',
    title: 'Test Notification',
    message: 'Test notification message',
    data: {},
    ...overrides,
  }),
};

// Security test utilities
export const SecurityTestUtils = {
  sqlInjectionPayloads: [
    "'; DROP TABLE users; --",
    "' OR 1=1 --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "admin'/*",
  ],

  xssPayloads: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '"><script>alert("XSS")</script>',
  ],

  invalidTokens: [
    'invalid.jwt.token',
    'Bearer invalid',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
    '',
    null,
    undefined,
  ],

  testSqlInjection: async (
    helper: TestHelper,
    endpoint: string,
    param: string,
  ) => {
    const results = [];
    for (const payload of SecurityTestUtils.sqlInjectionPayloads) {
      try {
        const response = await request(helper.getApp().getHttpServer())
          .post(endpoint)
          .send({ [param]: payload });

        results.push({
          payload,
          statusCode: response.status,
          vulnerable: response.status === 200 && response.body.length > 0,
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          vulnerable: false,
        });
      }
    }
    return results;
  },

  testXSS: async (helper: TestHelper, endpoint: string, param: string) => {
    const results = [];
    for (const payload of SecurityTestUtils.xssPayloads) {
      try {
        const response = await request(helper.getApp().getHttpServer())
          .post(endpoint)
          .send({ [param]: payload });

        results.push({
          payload,
          statusCode: response.status,
          reflected: response.text.includes(payload),
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          reflected: false,
        });
      }
    }
    return results;
  },
};
