import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('returns statusCode CREATED merged with the service result', async () => {
      mockAuthService.register.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
      });

      const result = await controller.register({
        email: 'user@test.com',
        password: 'pass123',
      });

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        id: 1,
        email: 'user@test.com',
      });
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'pass123',
      });
    });
  });

  describe('login', () => {
    it('returns statusCode OK merged with the access token', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'signed.jwt.token',
      });

      const result = await controller.login({
        email: 'user@test.com',
        password: 'pass123',
      });

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        access_token: 'signed.jwt.token',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'pass123',
      });
    });
  });
});
