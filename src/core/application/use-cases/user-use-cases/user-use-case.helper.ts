import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../ports/out/data-services/data-services.abstract';
import { IBcryptService } from '../../ports/out/services/bcrypt.abstract';
import { IJwtService } from '../../ports/out/services/jwt.abstract';
import { AppException } from '@/src/shared/exceptions';
import { StatusCodeEnum } from '@/src/shared/enums/http-codes.enum';
import { Response } from 'express';
import { UserModel } from '@/src/core/domain/model/user.model';
import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';
import { RegisterOauthUserDto } from '../../dto/request/user.dto';

@Injectable()
export class UserUseCaseHelper {
  constructor(
    private dataServices: IDataServices,
    private bcryptService: IBcryptService,
    private jwtService: IJwtService,
  ) {}

  async checkExistingUserByEmail(email: string) {
    let response: {
      exists: boolean;
      user?: UserModel | null;
    } = {
      exists: false,
    };
    const existingUser = await this.dataServices.user.getOneOrNull({
      email,
    });
    if (existingUser) {
      response = {
        exists: true,
        user: existingUser,
      };
    }
    return response;
  }

  async checkPasswordMatch(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await this.bcryptService.compare(plainPassword, hashedPassword);
  }

  async generateAccessAndRefreshTokens(
    sub: string,
    role: UserRoleEnum,
    res: Response,
  ) {
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
}
