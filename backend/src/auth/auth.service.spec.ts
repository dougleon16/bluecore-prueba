import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password is incorrect', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: hash,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns an access_token on valid credentials', async () => {
      const hash = await bcrypt.hash('secret123', 10);
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: hash,
      });

      const result = await service.login({
        email: 'user@test.com',
        password: 'secret123',
      });

      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'user@test.com',
      });
    });
  });

  describe('register', () => {
    it('throws ConflictException when email is already taken', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(
        service.register({ email: 'taken@test.com', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a new user and returns id and email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 2,
        email: 'new@test.com',
        password: 'hashed',
      });
      mockUserRepository.save.mockResolvedValue({
        id: 2,
        email: 'new@test.com',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'secret123',
      });

      expect(result).toEqual({ id: 2, email: 'new@test.com' });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
