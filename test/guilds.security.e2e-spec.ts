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

describe('GuildsController (e2e, security)', () => {
  let app: INestApplication;
  let accessToken: string;
  let guildId: string;

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

  it('Cấm tạo guild nếu không có token', async () => {
    await request(app.getHttpServer())
      .post('/guilds')
      .send({ name: 'Secured Guild ' + Date.now() })
      .expect(401);
  });

  it('Tạo guild hợp lệ khi có token', async () => {
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Secured Guild ' + Date.now() })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    guildId = res.body.id;
  });

  it('Cấm update guild nếu không phải owner', async () => {
    // Đăng ký user khác
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'otherguilduser@example.com', username: 'otherguilduser', password: 'test1234' })
      .catch(() => {});
    const otherToken = await loginAndGetToken(app, 'otherguilduser@example.com', 'test1234');
    await request(app.getHttpServer())
      .patch(`/guilds/${guildId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hacked' })
      .expect(403);
  });

  it('Cấm xóa guild nếu không phải owner', async () => {
    const otherToken = await loginAndGetToken(app, 'otherguilduser@example.com', 'test1234');
    await request(app.getHttpServer())
      .delete(`/guilds/${guildId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });
});
