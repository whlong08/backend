import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GuildRole } from '../src/entities/guild.entity';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const TEST_USER_EMAIL = 'guildtestuser@example.com';
const TEST_USER_PASSWORD = 'test1234';

async function loginAndGetToken(app: INestApplication) {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
  return res.body.accessToken;
}

describe('GuildMembersController (e2e, security)', () => {
  let app: INestApplication;
  let guildId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    accessToken = await loginAndGetToken(app);
    // Tạo guild mới, gán user test là owner với tên random
    const uniqueGuildName = 'Guild for security test ' + Date.now();
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: uniqueGuildName, ownerId: TEST_USER_ID })
      .expect(201);
    guildId = res.body.id;
    // Thêm user test làm owner vào guild_members
    await request(app.getHttpServer())
      .post(`/guilds/${guildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: TEST_USER_ID, role: GuildRole.OWNER })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Cấm truy cập nếu không có token', async () => {
    await request(app.getHttpServer())
      .get(`/guilds/${guildId}/members`)
      .expect(401);
  });

  it('Cấm truy cập nếu không phải thành viên', async () => {
    // Tạo guild mới, user test không phải thành viên, tên random
    const uniqueGuildName = 'Guild for forbidden test ' + Date.now();
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: uniqueGuildName })
      .expect(201);
    const newGuildId = res.body.id;
    // Xóa user test khỏi guild_members nếu có
    await request(app.getHttpServer())
      .delete(`/guilds/${newGuildId}/members/${TEST_USER_ID}`)
      .set('Authorization', `Bearer ${accessToken}`);
    // Kiểm tra truy cập
    await request(app.getHttpServer())
      .get(`/guilds/${newGuildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('Chỉ owner/admin được thêm thành viên', async () => {
    // Xóa user test khỏi guild, sau đó thử thêm lại (không còn quyền)
    await request(app.getHttpServer())
      .delete(`/guilds/${guildId}/members/${TEST_USER_ID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/guilds/${guildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: TEST_USER_ID, role: GuildRole.MEMBER })
      .expect(403);
  });
});
