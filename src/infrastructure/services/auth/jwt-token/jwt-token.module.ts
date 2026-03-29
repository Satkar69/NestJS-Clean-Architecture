import { Module } from '@nestjs/common';
import { IJwtService } from '@/src/core/application/ports/out/services/jwt.abstract';
import { JwtTokenService } from './jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [JwtModule.register({})],
  providers: [
    {
      provide: IJwtService,
      useClass: JwtTokenService,
    },
  ],
  exports: [IJwtService],
})
export class JwtTokenModule {}
