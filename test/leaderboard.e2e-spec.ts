import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Leaderboard Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  const testEmail = 'e2e_leader_' + Date.now() + '@example.com';
  const testUsername = 'e2eleader_' + Date.now();
  const testPassword = 'test1234';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

  it('/leaderboard/global (GET) - get global leaderboard', async () => {
    const res = await request(app.getHttpServer()).get(
      '/leaderboard/global?limit=10',
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/leaderboard/personal (GET) - get personal leaderboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard/personal')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('points');
  });
});
