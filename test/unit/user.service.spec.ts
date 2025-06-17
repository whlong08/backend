import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../../src/modules/user/user.service';
import { User } from '../../src/entities/user.entity';
import { Friendship } from '../../src/entities/friendship.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
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

  describe('sendFriendRequest', () => {
    it('should create a new friend request', async () => {
      const mockFriendship = {
        id: '1',
        requesterId: '1',
        addresseeId: '2',
        status: 'PENDING',
      };

      mockFriendshipRepository.findOne.mockResolvedValue(null);
      mockFriendshipRepository.create.mockReturnValue(mockFriendship);
      mockFriendshipRepository.save.mockResolvedValue(mockFriendship);

      const result = await service.sendFriendRequest('1', '2');

      expect(mockFriendshipRepository.findOne).toHaveBeenCalledWith({
        where: [
          { requesterId: '1', addresseeId: '2' },
          { requesterId: '2', addresseeId: '1' },
        ],
      });
      expect(mockFriendshipRepository.create).toHaveBeenCalled();
      expect(mockFriendshipRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFriendship);
    });

    it('should return existing friendship if already exists', async () => {
      const existingFriendship = {
        id: '1',
        requesterId: '1',
        addresseeId: '2',
        status: 'ACCEPTED',
      };

      mockFriendshipRepository.findOne.mockResolvedValue(existingFriendship);

      const result = await service.sendFriendRequest('1', '2');

      expect((result as any).message).toBe(
        'Friend request already exists or already friends',
      );
      expect((result as any).status).toBe('ACCEPTED');
    });
  });

  describe('acceptFriend', () => {
    it('should accept a pending friend request', async () => {
      const pendingFriendship = {
        id: '1',
        requesterId: '2',
        addresseeId: '1',
        status: 'PENDING',
      };

      const acceptedFriendship = {
        ...pendingFriendship,
        status: 'ACCEPTED',
      };

      mockFriendshipRepository.findOne.mockResolvedValue(pendingFriendship);
      mockFriendshipRepository.save.mockResolvedValue(acceptedFriendship);

      const result = await service.acceptFriend('1', '2');

      expect(mockFriendshipRepository.findOne).toHaveBeenCalledWith({
        where: { requesterId: '2', addresseeId: '1', status: 'PENDING' },
      });
      expect(mockFriendshipRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('ACCEPTED');
    });

    it('should throw error if no pending friend request found', async () => {
      mockFriendshipRepository.findOne.mockResolvedValue(null);

      await expect(service.acceptFriend('1', '2')).rejects.toThrow(
        'No pending friend request',
      );
    });
  });
});
