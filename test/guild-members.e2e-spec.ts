import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GuildRole } from '../src/entities/guild.entity';

describe('GuildMembersController (e2e)', () => {
  let app: INestApplication;
  let guildId: string;
  let memberId: string;
  let accessToken: string;
  let testUserId: string;
  const random = Math.floor(Math.random() * 1000000);
  const testUser = {
    email: `guild_member_e2e_${random}@example.com`,
    username: `guild_member_e2e_user_${random}`,
    password: 'test1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Đăng ký và đăng nhập user test
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    testUserId = regRes.body.id;
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: testUser.username, password: testUser.password })
      .expect(201);
    accessToken = loginRes.body.accessToken;

    // Tạo guild mới, gán user test là owner
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Guild for member test ${random}` })
      .expect(201);
    guildId = res.body.id;
    // Thêm user test làm owner vào guild_members (nếu chưa có)
    await request(app.getHttpServer())
      .post(`/guilds/${guildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: testUserId, role: GuildRole.OWNER })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/guilds/:guildId/members (POST) - add member', async () => {
    // Thêm lại chính user test với role MEMBER (để test logic, thực tế đã là owner)
    const res = await request(app.getHttpServer())
      .post(`/guilds/${guildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: testUserId, role: GuildRole.MEMBER })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(testUserId);
    memberId = res.body.id;
  });

  it('/guilds/:guildId/members (GET) - list members', async () => {
    const res = await request(app.getHttpServer())
      .get(`/guilds/${guildId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/guilds/:guildId/members/:userId/role (PATCH) - update role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/guilds/${guildId}/members/${testUserId}/role`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: GuildRole.ADMIN })
      .expect(200);
    expect(res.body.role).toBe(GuildRole.ADMIN);
  });

  it('/guilds/:guildId/members/:userId (DELETE) - remove member', async () => {
    await request(app.getHttpServer())
      .delete(`/guilds/${guildId}/members/${testUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
