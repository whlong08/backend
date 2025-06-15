import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('ChatModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/chat/send (POST) guild', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/send')
      .send({
        type: 'GUILD',
        guildId: 'test-guild',
        senderId: 'user1',
        content: 'Hello guild!',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('GUILD');
  });

  it('/chat/send (POST) friend', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/send')
      .send({
        type: 'FRIEND',
        friendId: 'friend-123',
        senderId: 'user2',
        content: 'Hello friend!',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('FRIEND');
  });

  it('/chat/guild (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat/guild')
      .query({ guildId: 'test-guild' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/chat/friend (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat/friend')
      .query({ friendId: 'friend-123' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
