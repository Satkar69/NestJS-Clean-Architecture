import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGoogleStrategy } from '@/src/core/application/ports/out/services/google-strategy.abstract';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { RegisterOauthUserDto } from '@/src/core/application/dto/request/auth.dto';
import { AuthUseCaseService } from '@/src/core/application/use-cases/auth/auth-use-case.service';

@Injectable()
export class GoogleStrategyService
  extends PassportStrategy(Strategy, 'google')
  implements IGoogleStrategy
{
  constructor(
    configService: ConfigService,
    private authService: AuthUseCaseService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;

    const user: RegisterOauthUserDto = {
      oauthProvider: 'google',
      oauthProviderId: id,
      firstName: name!.givenName,
      lastName: name!.familyName,
      email: emails![0].value,
    };

    const userData = await this.authService.validateOauthUser(user);
    done(null, userData);
  }
}
