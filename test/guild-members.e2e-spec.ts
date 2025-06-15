import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GuildRole } from '../src/entities/guild.entity';

// Lưu ý: cần có userId hợp lệ trong DB để test add member
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

describe('GuildMembersController (e2e)', () => {
  let app: INestApplication;
  let guildId: string;
  let memberId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Tạo guild mới để test
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .send({ name: 'Guild for member test' })
      .expect(201);
    guildId = res.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/guilds/:guildId/members (POST) - add member', async () => {
    // Bạn cần tạo user có TEST_USER_ID trong DB trước khi chạy test này!
    const res = await request(app.getHttpServer())
      .post(`/guilds/${guildId}/members`)
      .send({ userId: TEST_USER_ID, role: GuildRole.MEMBER })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.userId).toBe(TEST_USER_ID);
    memberId = res.body.id;
  });

  it('/guilds/:guildId/members (GET) - list members', async () => {
    const res = await request(app.getHttpServer())
      .get(`/guilds/${guildId}/members`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/guilds/:guildId/members/:userId/role (PATCH) - update role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/guilds/${guildId}/members/${TEST_USER_ID}/role`)
      .send({ role: GuildRole.ADMIN })
      .expect(200);
    expect(res.body.role).toBe(GuildRole.ADMIN);
  });

  it('/guilds/:guildId/members/:userId (DELETE) - remove member', async () => {
    await request(app.getHttpServer())
      .delete(`/guilds/${guildId}/members/${TEST_USER_ID}`)
      .expect(200);
  });
});
