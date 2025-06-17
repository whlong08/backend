import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

function uniqueStr() {
  return Date.now() + '_' + Math.floor(Math.random() * 1000000);
}

describe('Notification Module (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let notificationId: string;
  const uniq = uniqueStr();
  const testEmail = `e2e_notify_${uniq}@example.com`;
  const testUsername = `e2enotify_${uniq}`;
  const testPassword = 'test1234';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
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
    // Xóa notification test nếu đã tạo
    if (notificationId) {
      await request(app.getHttpServer())
        .delete(`/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  it('/notifications (POST) - create notification', async () => {
    const res = await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'system',
        title: 'E2E Test',
        message: 'Test message',
        data: {},
      });
    expect([201, 200]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    notificationId = res.body.id;
  });

  it('/notifications (GET) - get all notifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/notifications/:id/read (PATCH) - mark as read', async () => {
    if (!notificationId) return;
    const res = await request(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 201]).toContain(res.status);
  });
});
