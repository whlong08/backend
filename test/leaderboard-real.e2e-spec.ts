import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Leaderboard Real (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testUser = {
    email: 'leaderboard_test@example.com',
    username: 'leaderboard_testuser',
    password: 'test1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/leaderboard/personal (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard/personal')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('username', testUser.username);
    expect(res.body).toHaveProperty('points');
  });

  it('/leaderboard/global (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard/global')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('username');
    expect(res.body[0]).toHaveProperty('points');
  });
});
