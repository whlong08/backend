import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

function uniqueStr() {
  return Date.now() + '_' + Math.floor(Math.random() * 1000000);
}

describe('User Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  const uniq = uniqueStr();
  const testEmail = `e2e_user_${uniq}@example.com`;
  const testUsername = `e2euser_${uniq}`;
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
    userId = loginRes.body.user?.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user/profile (GET) - get profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
  });

  it('/user/profile (PATCH) - update profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'E2E test bio' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('bio', 'E2E test bio');
  });
});
