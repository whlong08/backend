import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../../src/modules/user/user.service';
import { User } from '../../src/entities/user.entity';
import { Friendship } from '../../src/entities/friendship.entity';

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userRepository: Repository<User>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let friendshipRepository: Repository<Friendship>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    bio: 'Test bio',
    total_points: 100,
    level: 1,
    experience: 50,
    subject: 'Computer Science',
    created_at: new Date(),
    updated_at: new Date(),
    last_active: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
  };

  const mockFriendshipRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Friendship),
          useValue: mockFriendshipRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    friendshipRepository = module.get<Repository<Friendship>>(
      getRepositoryToken(Friendship),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return a user profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getProfile('999');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = {
        bio: 'Updated bio',
        subject: 'Mathematics',
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.updateProfile('1', updateDto);

      expect(mockUserRepository.update).toHaveBeenCalledWith('1', updateDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result.bio).toBe(updateDto.bio);
      expect(result.subject).toBe(updateDto.subject);
    });

    it('should throw error if user not found after update', async () => {
      const updateDto = { bio: 'Updated bio' };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('999', updateDto)).rejects.toThrow(
        'User not found',
      );
    });
  });

  // TODO: Add friend request functionality tests when implemented
  describe('placeholder', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
