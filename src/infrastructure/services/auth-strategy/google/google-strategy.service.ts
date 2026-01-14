import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGoogleStrategy } from 'src/core/application/ports/out/google-strategy.abstract';
import { UserFactoryService } from 'src/core/application/use-cases/user-use-cases/user-factory.service';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GoogleStrategyService
  extends PassportStrategy(Strategy, 'google')
  implements IGoogleStrategy
{
  constructor(
    private configService: ConfigService,
    private userFactory: UserFactoryService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;

    const user = this.userFactory.registerOAuthUser({
      oauthProvider: 'google',
      oauthProviderId: id,
      firstName: name.givenName,
      lastName: name.familyName,
      email: emails[0].value,
    });

    done(null, user);
  }
}
