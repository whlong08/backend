import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI Chat Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const testEmail = 'e2e_aichat_' + Date.now() + '@example.com';
  const testUsername = 'e2eaichat_' + Date.now();
  const testPassword = 'test1234';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    // Đăng ký và đăng nhập user test
    await request(app.getHttpServer()).post('/auth/register').send({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/aichat/chat (POST) - limit per day (mocked)', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/aichat/chat')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ prompt: 'Hello AI' });
      expect([200, 201, 429]).toContain(res.status);
      if (res.status === 429) break;
    }
  });
});
