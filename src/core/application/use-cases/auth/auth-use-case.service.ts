import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../ports/out/data-services/data-services.abstract';
import { IBcryptService } from '../../ports/out/services/bcrypt.abstract';
import { AuthUseCaseFactory } from './auth-use-case-factory';
import {
  LoginUserDto,
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/auth.dto';
import { IAuthService } from '../../ports/in/auth.service.abstract';
import { Response } from 'express';
import { AppException } from '@/src/shared/exceptions';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';
import { AuthUseCaseHelper } from './auth-use-case.helper';
import { UserUseCaseHelper } from '../user/user-use-case.helper';
import { UserClsStore } from '@/src/shared/interface/cls-store/user-cls.interface';
import { UserModel } from '@/src/core/domain/model/user.model';

@Injectable()
export class AuthUseCaseService implements IAuthService {
  constructor(
    private dataServices: IDataServices,
    private authFactory: AuthUseCaseFactory,
    private bcryptService: IBcryptService,
    private userHelper: UserUseCaseHelper,
    private authHelper: AuthUseCaseHelper,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<UserModel> {
    const existingUser = await this.userHelper.checkExistingUserByEmail(
      dto.email,
    );
    if (existingUser.exists) {
      throw new AppException(
        StatusCodeEnum.CONFLICT,
        `User with email '${dto.email}' already exists`,
      );
    }
    const hashedPassword = await this.bcryptService.hash(dto.password);
    const user = this.authFactory.registerUser({
      ...dto,
      password: hashedPassword,
    });
    return await this.dataServices.user.create(user);
  }

  async loginUser(dto: LoginUserDto, res: Response) {
    const existingUser = await this.userHelper.checkExistingUserByEmail(
      dto.email,
    );

    if (!existingUser.exists || !existingUser.user) {
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        `user with email '${dto.email}' does not exists.`,
      );
    }
    const isPasswordValid = await this.authHelper.checkPasswordMatch(
      dto.password,
      existingUser.user.password ?? '',
    );

    if (!isPasswordValid) {
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        'Invalid credentials provided',
      );
    }
    const tokens = await this.authHelper.generateAccessAndRefreshTokens(
      existingUser.user.id,
      existingUser.user.userRole,
    );

    this.authHelper.setTokensInResponseCookies(
      tokens.accessToken,
      tokens.refreshToken,
      res,
    );
  }

  async loginGoogleUser(userEmail: string, res: Response) {
    const existingUser =
      await this.userHelper.checkExistingUserByEmail(userEmail);
    if (!existingUser.exists || !existingUser.user) {
      throw new AppException(
        StatusCodeEnum.NOT_FOUND,
        `user with email '${userEmail}' does not exists.`,
      );
    }
    const tokens = await this.authHelper.generateAccessAndRefreshTokens(
      existingUser.user.id,
      existingUser.user.userRole,
    );

    this.authHelper.setTokensInResponseCookies(
      tokens.accessToken,
      tokens.refreshToken,
      res,
    );
  }

  async validateOauthUser(dto: RegisterOauthUserDto): Promise<UserClsStore> {
    if (!dto) {
      throw new AppException(
        StatusCodeEnum.BAD_REQUEST,
        'Invalid User Data, Unauthenticated',
      );
    }
    const existingUser = await this.userHelper.checkExistingUserByEmail(
      dto.email,
    );
    if (!existingUser.exists) {
      const newUser = this.authFactory.registerOauthUser(dto);
      return await this.dataServices.user.create(newUser);
    }
    return {
      id: existingUser.user!.id,
      firstName: existingUser.user!.firstName,
      middleName: existingUser.user!.middleName
        ? existingUser.user!.middleName
        : undefined,
      lastName: existingUser.user!.lastName,
      email: existingUser.user!.email,
      userRole: existingUser.user!.userRole,
    };
  }

  logoutUser(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return;
  }
}
