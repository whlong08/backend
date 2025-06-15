import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

const TEST_USER_EMAIL = 'guildtestuser@example.com';
const TEST_USER_PASSWORD = 'test1234';

async function loginAndGetToken(app: INestApplication, email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD) {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return res.body.accessToken;
}

describe('AiChatController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    accessToken = await loginAndGetToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Cấm truy cập nếu không có token', async () => {
    await request(app.getHttpServer())
      .post('/aichat/chat')
      .send({ messages: [{ role: 'user', content: 'Hello' }] })
      .expect(401);
  });

  it('Gửi chat hợp lệ khi có token (mock)', async () => {
    // Chỉ test mock, không gọi thật Gemini
    const res = await request(app.getHttpServer())
      .post('/aichat/chat')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ messages: [{ role: 'user', content: 'Explain AI' }] })
      .expect(200);
    // Có thể kiểm tra response structure tuỳ config Gemini
    expect(res.body).toBeDefined();
  });
});
