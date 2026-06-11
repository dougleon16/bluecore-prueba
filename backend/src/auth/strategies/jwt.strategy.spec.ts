import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(mockConfigService);
  });

  describe('validate', () => {
    it('maps JWT payload to a user object with id and email', () => {
      const payload = { sub: 42, email: 'user@test.com' };

      const result = strategy.validate(payload);

      expect(result).toEqual({ id: 42, email: 'user@test.com' });
    });

    it('correctly maps different sub values to id', () => {
      const result = strategy.validate({ sub: 99, email: 'admin@test.com' });

      expect(result).toEqual({ id: 99, email: 'admin@test.com' });
    });
  });
});
