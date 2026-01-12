import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtPayload,
  IJwtService,
  IRefreshTokenPayload,
  IResetPasswordTokenPayload,
} from 'src/core/abstracts/jwt.abstract';

@Injectable()
export class JwtTokenService implements IJwtService {
  private _accessTokenSecret: string;
  private _accessTokenExpiresIn: number;
  private _refreshTokenSecret: string;
  private _refreshTokenExpiresIn: number;

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this._accessTokenSecret =
      this.configService.get<string>('JWT_SECRET') || '';
    this._accessTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
      10,
    );
    this._refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || '';
    this._refreshTokenExpiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '604800',
      10,
    );
  }

  async checkToken(token: string) {
    const decode = await this.jwtService.verifyAsync(token);
    return decode;
  }

  async createAccessToken(payload: IJwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this._accessTokenSecret,
      expiresIn: this._accessTokenExpiresIn,
    });
  }

  async createRefreshToken(payload: IRefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this._refreshTokenSecret,
      expiresIn: this._refreshTokenExpiresIn,
    });
  }

  async createResetPasswordToken(
    payload: IResetPasswordTokenPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this._refreshTokenSecret,
      expiresIn: this._refreshTokenExpiresIn,
    });
  }
}
