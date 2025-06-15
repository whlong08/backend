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

describe('LeaderboardController (e2e, security)', () => {
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

  it('Ai cũng xem được bảng xếp hạng global', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard/global')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Cấm xem bảng cá nhân nếu không có token', async () => {
    await request(app.getHttpServer())
      .get('/leaderboard/personal')
      .expect(401);
  });

  it('Chỉ user đăng nhập xem được bảng cá nhân', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard/personal')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('points');
  });
});
