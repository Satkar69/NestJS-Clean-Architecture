import { Injectable } from '@nestjs/common';
import { IBcryptService } from '../../ports/out/services/bcrypt.abstract';
import { IJwtService } from '../../ports/out/services/jwt.abstract';
import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';
import { Response } from 'express';

@Injectable()
export class AuthUseCaseHelper {
  constructor(
    private bcryptService: IBcryptService,
    private jwtService: IJwtService,
  ) {}

  async checkPasswordMatch(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await this.bcryptService.compare(plainPassword, hashedPassword);
  }

  async generateAccessAndRefreshTokens(sub: string, role: UserRoleEnum) {
    const tokenPayload = {
      sub: sub,
      role: role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.createAccessToken(tokenPayload),
      this.jwtService.createRefreshToken(tokenPayload),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  setTokensInResponseCookies(
    accessToken: string,
    refreshToken: string,
    res: Response,
  ) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.jwtService.accessTokenExpiresIn * 1000,
      sameSite: 'strict',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.jwtService.refreshTokenExpiresIn * 1000,
      sameSite: 'strict',
    });
  }
}
