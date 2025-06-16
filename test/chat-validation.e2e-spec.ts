import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Chat Validation (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testUser = {
    email: 'chatval_test@example.com',
    username: 'chatval_testuser',
    password: 'test1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    await request(app.getHttpServer()).post('/auth/register').send(testUser);
    const res = await request(app.getHttpServer()).post('/auth/login').send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/chat/send (POST) - reject invalid type', async () => {
    await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'INVALID', senderId: 'u', content: 'msg' })
      .expect(400);
  });

  it('/chat/send (POST) - reject missing content', async () => {
    await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'GUILD', guildId: 'g', senderId: 'u' })
      .expect(400);
  });

  it('/chat/send (POST) - accept valid', async () => {
    const res = await request(app.getHttpServer())
      .post('/chat/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'GUILD', guildId: 'g', senderId: 'u', content: 'msg' })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe('GUILD');
  });
});
