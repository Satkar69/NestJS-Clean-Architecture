import { UserRoleEnum } from '../../../domain/enums/user.enum';

export interface IJwtPayload {
  sub: string;
  role: UserRoleEnum;
  iat: number;
  exp: number;
}

export interface IRefreshTokenPayload {
  sub: string;
}

export interface IResetPasswordTokenPayload {
  sub: string;
  email: string;
}

export abstract class IJwtService {
  abstract checkToken<T>(token: string): Promise<T>;
  abstract createAccessToken(payload: IJwtPayload): Promise<string>;
  abstract createRefreshToken(payload: IRefreshTokenPayload): Promise<string>;
  abstract createResetPasswordToken(
    payload: IResetPasswordTokenPayload,
  ): Promise<string>;
}
