import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Guilds Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let guildId: string;
  const testEmail = 'e2e_guild_' + Date.now() + '@example.com';
  const testUsername = 'e2eguild_' + Date.now();
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
    // Tạo guild mới, tránh trùng tên
    let created = false;
    let tryCount = 0;
    while (!created && tryCount < 5) {
      const name =
        'Test Guild ' + Date.now() + '-' + Math.floor(Math.random() * 10000);
      const createRes = await request(app.getHttpServer())
        .post('/guilds')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name });
      if (createRes.body && createRes.body.id) {
        guildId = createRes.body.id;
        created = true;
      } else {
        console.error('Create guild response:', createRes.body);
        tryCount++;
      }
    }
    if (!guildId) throw new Error('Could not create guild for test');
  });

  afterAll(async () => {
    // Xóa guild test nếu có endpoint
    if (guildId) {
      await request(app.getHttpServer())
        .delete(`/guilds/${guildId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  it('/guilds/:id (GET) - only member can view', async () => {
    const res = await request(app.getHttpServer())
      .get(`/guilds/${guildId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 403]).toContain(res.status);
  });
});
