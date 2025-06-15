import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('User Profile (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testUser = {
    email: 'profile_test@example.com',
    username: 'profile_testuser',
    password: 'test1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Đăng ký và đăng nhập lấy token
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user/profile (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('username', testUser.username);
  });

  it('/user/profile (PATCH)', async () => {
    const res = await request(app.getHttpServer())
      .patch('/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ avatarUrl: 'http://example.com/avatar.png', bio: 'Hello', subject: 'Math' })
      .expect(200);
    expect(res.body).toHaveProperty('avatarUrl', 'http://example.com/avatar.png');
    expect(res.body).toHaveProperty('bio', 'Hello');
    expect(res.body).toHaveProperty('subject', 'Math');
  });
});
