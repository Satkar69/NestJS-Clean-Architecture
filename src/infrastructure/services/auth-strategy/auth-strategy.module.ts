import { Module } from '@nestjs/common';
import { IJwtService } from 'src/core/application/ports/out/jwt.abstract';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserFactoryService } from 'src/core/application/use-cases/user-use-cases/user-factory.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || '',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ConfigService,
    {
      provide: IJwtService,
      useClass: JwtTokenService,
    },
    UserFactoryService,
  ],
  exports: [IJwtService],
})
export class AuthStrategyModule {}
