import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

// Thêm mock OpenAI
//jest.mock('openai');

jest.setTimeout(20000);

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

  it('Gửi chat hợp lệ khi có token (Gemini API)', async () => {
    const res = await request(app.getHttpServer())
      .post('/aichat/chat')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ prompt: 'Explain AI' })
      .expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.role).toBe('assistant');
    expect(res.body.content).toBeDefined();
  });
});
