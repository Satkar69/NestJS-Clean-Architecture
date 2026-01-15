import { TokenType } from 'src/shared/type/token-type';
import { UserRoleEnum } from '../../../../domain/enums/user.enum';

export interface IJwtPayload {
  sub: string;
  role: UserRoleEnum;
  iat?: number;
  exp?: number;
}

export interface IResetPasswordTokenPayload {
  sub: string;
  email: string;
}

export abstract class IJwtService {
  readonly accessTokenSecret: string;
  readonly accessTokenExpiresIn: number;
  readonly refreshTokenSecret: string;
  readonly refreshTokenExpiresIn: number;

  abstract checkToken<T>(token: string, tokenType: TokenType): Promise<T>;
  abstract createAccessToken(payload: IJwtPayload): Promise<string>;
  abstract createRefreshToken(payload: IJwtPayload): Promise<string>;
  abstract createResetPasswordToken(
    payload: IResetPasswordTokenPayload,
    S,
  ): Promise<string>;
}
