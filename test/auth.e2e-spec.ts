import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

function uniqueStr() {
  return Date.now() + '_' + Math.floor(Math.random() * 1000000);
}

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  const uniq = uniqueStr();
  const testEmail = `e2e_auth_${uniq}@example.com`;
  const testUsername = `e2euser_${uniq}`;
  const testPassword = 'test1234';
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - register new user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    });
    expect([201, 200]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
  });

  it('/auth/login (POST) - login with registered user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('/auth/refresh (POST) - refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken });
    console.log('Refresh token response:', res.status, res.body);
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('accessToken');
  });
});
