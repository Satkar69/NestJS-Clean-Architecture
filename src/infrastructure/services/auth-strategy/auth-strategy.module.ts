import { Module } from '@nestjs/common';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { GoogleStrategyModule } from './google/google-strategy.module';

@Module({
  imports: [JwtTokenModule, GoogleStrategyModule],
  exports: [JwtTokenModule, GoogleStrategyModule],
})
export class AuthStrategyModule {}
