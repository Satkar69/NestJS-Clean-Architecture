import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGoogleStrategy } from 'src/core/application/ports/out/google-strategy.abstract';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { RegisterOauthUserDto } from 'src/core/application/dto/request/user.dto';
import { UserService } from 'src/core/application/use-cases/user-use-cases/user.service';

@Injectable()
export class GoogleStrategyService
  extends PassportStrategy(Strategy, 'google')
  implements IGoogleStrategy
{
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret:
        configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL:
        configService.getOrThrow<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails } = profile;

    const user: RegisterOauthUserDto = {
      oauthProvider: 'google',
      oauthProviderId: id,
      firstName: name.givenName,
      lastName: name.familyName,
      email: emails[0].value,
    };

    const userData = await this.userService.validateOauthUser(user);

    done(null, userData);
  }
}
