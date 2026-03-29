import { Module } from '@nestjs/common';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { PassportStrategyModule } from './passport/passport-strategy.module';

@Module({
  imports: [JwtTokenModule, PassportStrategyModule],
  exports: [JwtTokenModule, PassportStrategyModule],
})
export class AuthModule {}
