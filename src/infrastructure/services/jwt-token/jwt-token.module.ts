import { Module } from '@nestjs/common';
import { IJwtService } from 'src/core/abstracts/jwt.abstract';
import { JwtTokenService } from './jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({})],
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
