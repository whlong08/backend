import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { NotificationType } from '../src/entities/notification.entity';

const TEST_USER_EMAIL = 'guildtestuser@example.com';
const TEST_USER_PASSWORD = 'test1234';

async function loginAndGetToken(app: INestApplication, email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD) {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  return res.body.accessToken;
}

describe('NotificationController (e2e)', () => {
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
      .get('/notifications')
      .expect(401);
  });

  it('Tạo, lấy, đánh dấu đã đọc, xóa notification', async () => {
    // Tạo notification
    const createRes = await request(app.getHttpServer())
      .post('/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: NotificationType.SYSTEM, title: 'Test', message: 'Test notification', data: { foo: 'bar' } })
      .expect(201);
    expect(createRes.body).toHaveProperty('id');
    const notificationId = createRes.body.id;

    // Lấy danh sách
    const listRes = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body[0].message).toBe('Test notification');

    // Đánh dấu đã đọc
    await request(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Xóa notification
    await request(app.getHttpServer())
      .delete(`/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
