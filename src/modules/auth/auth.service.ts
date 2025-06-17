import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('REDIS_CLIENT')
    private redisClient: {
      setex: (key: string, ttl: number, value: string) => Promise<void>;
      get: (key: string) => Promise<string | null>;
    },
  ) {}

  async register(email: string, username: string, password: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Password is required and must be at least 6 characters',
      );
    }
    const existing = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existing)
      throw new ConflictException('Email or username already exists');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.usersRepository.create({ email, username, passwordHash });
    await this.usersRepository.save(user);
    return this.sanitizeUser(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    await this.redisClient.setex(
      `refresh_token:${userId}`,
      7 * 24 * 60 * 60,
      refreshToken,
    );
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async refreshToken(refreshToken: string) {
    try {
      // Giải mã refreshToken
      const payload = (await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })) as { sub: string };
      const userId = payload.sub;
      // Lấy refreshToken từ Redis
      const storedToken = await this.redisClient.get(`refresh_token:${userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      // Cấp accessToken mới
      const accessToken = await this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
