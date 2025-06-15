import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { QuestType, QuestDifficulty, QuestCategory } from '../src/entities/quest.entity';

const TEST_USER_EMAIL = 'guildtestuser@example.com';
const TEST_USER_PASSWORD = 'test1234';

async function loginAndGetToken(app: INestApplication) {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
  return res.body.accessToken;
}

describe('QuestsController (e2e, security)', () => {
  let app: INestApplication;
  let accessToken: string;
  let questId: string;

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

  const questData = {
    title: 'Secured Quest ' + Date.now(),
    description: 'Quest for security test',
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

  it('Cấm tạo quest nếu không có token', async () => {
    await request(app.getHttpServer())
      .post('/quests')
      .send(questData)
      .expect(401);
  });

  it('Tạo quest hợp lệ khi có token', async () => {
    const res = await request(app.getHttpServer())
      .post('/quests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(questData)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    questId = res.body.id;
  });

  it('Cấm update quest nếu không phải creator', async () => {
    // Đăng ký user khác
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'otheruser@example.com', username: 'otheruser', password: 'test1234' })
      .catch(() => {});
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'otheruser@example.com', password: 'test1234' });
    const otherToken = loginRes.body.accessToken;
    await request(app.getHttpServer())
      .patch(`/quests/${questId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked' })
      .expect(403);
  });

  it('Cấm xóa quest nếu không phải creator', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'otheruser@example.com', password: 'test1234' });
    const otherToken = loginRes.body.accessToken;
    await request(app.getHttpServer())
      .delete(`/quests/${questId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });
});
