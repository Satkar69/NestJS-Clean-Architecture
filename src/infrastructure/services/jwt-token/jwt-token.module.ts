import { Module } from '@nestjs/common';
import { IJwtService } from 'src/core/application/ports/out/jwt.abstract';
import { JwtTokenService } from './jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  ],
  exports: [IJwtService],
})
export class JwtTokenModule {}
