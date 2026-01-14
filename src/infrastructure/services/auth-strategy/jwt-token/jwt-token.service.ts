import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtPayload,
  IJwtService,
  IResetPasswordTokenPayload,
} from 'src/core/application/ports/out/jwt.abstract';
import { InvalidTokenException } from 'src/shared/exceptions';
import { TokenType } from 'src/shared/type/token-type';

@Injectable()
export class JwtTokenService implements IJwtService {
  public accessTokenSecret: string;
  public accessTokenExpiresIn: number;
  public refreshTokenSecret: string;
  public refreshTokenExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret =
      this.configService.getOrThrow<string>('JWT_SECRET');
    this.accessTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
      10,
    );
    this.refreshTokenSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '604800',
      10,
    );
  }

  async checkToken(token: string, tokenType: TokenType) {
    let secret: string;
    switch (tokenType) {
      case 'access':
        secret = this.accessTokenSecret;
        break;
      case 'refresh':
        secret = this.refreshTokenSecret;
        break;
      case 'reset-password':
        secret = this.refreshTokenSecret;
        break;
      default:
        throw new InvalidTokenException(tokenType, 'Invalid token type');
    }
    const decode = await this.jwtService.verifyAsync(token, { secret });
    return decode;
  }

  async createAccessToken(payload: IJwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async createRefreshToken(payload: IJwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  async createResetPasswordToken(
    payload: IResetPasswordTokenPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }
}
