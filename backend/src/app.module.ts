import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CreditRequestsModule } from './credit-requests/credit-requests.module';
import { User } from './users/user.entity';
import { CreditRequest } from './credit-requests/entities/credit-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [User, CreditRequest],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        keepConnectionAlive: true,
        connectTimeout: 10_000,
        extra: {
          connectionLimit: 10,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10_000,
        },
      }),
    }),
    AuthModule,
    CreditRequestsModule,
  ],
})
export class AppModule {}
