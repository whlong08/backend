import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('GuildsController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const guildData = {
    name: 'Test Guild',
    description: 'Guild for e2e testing',
    avatarUrl: 'http://example.com/avatar.png',
    ownerId: null,
    totalPoints: 0,
    memberCount: 0,
    maxMembers: 50,
    isPublic: true,
  };

  it('/guilds (POST) - create', async () => {
    const res = await request(app.getHttpServer())
      .post('/guilds')
      .send(guildData)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(guildData.name);
    createdId = res.body.id;
  });

  it('/guilds (GET) - findAll', async () => {
    const res = await request(app.getHttpServer())
      .get('/guilds')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/guilds/:id (GET) - findOne', async () => {
    const res = await request(app.getHttpServer())
      .get(`/guilds/${createdId}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('/guilds/:id (PATCH) - update', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/guilds/${createdId}`)
      .send({ name: 'Updated Guild' })
      .expect(200);
    expect(res.body.name).toBe('Updated Guild');
  });

  it('/guilds/:id (DELETE) - remove', async () => {
    await request(app.getHttpServer())
      .delete(`/guilds/${createdId}`)
      .expect(200);
  });
});
