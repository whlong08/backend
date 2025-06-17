import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import {
  QuestType,
  QuestDifficulty,
  QuestCategory,
} from '../src/entities/quest.entity';

describe('QuestsController (e2e)', () => {
  let app: INestApplication;
  let createdId: string;
  let accessToken: string;
  const random = Math.floor(Math.random() * 1000000);
  const testUser = {
    email: `quest_e2e_${random}@example.com`,
    username: `quest_e2e_user_${random}`,
    password: 'test1234',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Đăng ký và đăng nhập user test
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: testUser.username, password: testUser.password })
      .expect(201);
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const questData = {
    title: `Test Quest ${random}`,
    description: 'Quest for e2e testing',
    type: QuestType.DAILY,
    difficulty: QuestDifficulty.EASY,
    category: QuestCategory.STUDY,
    rewardPoints: 10,
    rewardExperience: 5,
    rewardBadges: ['badge1'],
    requirements: {},
    isPublic: true,
    isActive: true,
  };

  it('/quests (POST) - create', async () => {
    const res = await request(app.getHttpServer())
      .post('/quests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(questData)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(questData.title);
    createdId = res.body.id;
  });

  it('/quests (GET) - findAll', async () => {
    const res = await request(app.getHttpServer())
      .get('/quests')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/quests/:id (GET) - findOne', async () => {
    const res = await request(app.getHttpServer())
      .get(`/quests/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', createdId);
  });

  it('/quests/:id (PATCH) - update', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/quests/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Quest' })
      .expect(200);
    expect(res.body.title).toBe('Updated Quest');
  });

  it('/quests/:id (DELETE) - remove', async () => {
    await request(app.getHttpServer())
      .delete(`/quests/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
