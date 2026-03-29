import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../ports/out/data-services/data-services.abstract';
import { IBcryptService } from '../../ports/out/services/bcrypt.abstract';
import { UserUseCaseFactory } from './user-use-case-factory';
import {
  LoginUserDto,
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/user.dto';
import { IUserUseCaseService } from '../../ports/in/user-use-case-service.abstract';
import { Response } from 'express';
import { AppException } from '@/src/shared/exceptions';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';
import { UserUseCaseHelper } from './user-use-case.helper';
import { UserClsStore } from '@/src/shared/interface/cls-store/user-cls.interface';

@Injectable()
export class UserUseCaseService implements IUserUseCaseService {
  constructor(
    private dataServices: IDataServices,
    private userFactory: UserUseCaseFactory,
    private bcryptService: IBcryptService,
    private userUseCaseHelper: UserUseCaseHelper,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const existingUser = await this.userUseCaseHelper.checkExistingUserByEmail(
      dto.email,
    );
    if (existingUser.exists) {
      throw new AppException(
        StatusCodeEnum.CONFLICT,
        'User with this email already exists',
      );
    }
    const hashedPassword = await this.bcryptService.hash(dto.password);
    const user = this.userFactory.registerUser({
      ...dto,
      password: hashedPassword,
    });
    return this.dataServices.user.create(user);
  }

  async loginUser(dto: LoginUserDto, res: Response) {
    const existingUser = await this.userUseCaseHelper.checkExistingUserByEmail(
      dto.email,
    );

    if (!existingUser.exists || !existingUser.user) {
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        `user with email "${dto.email}" does not exists.`,
      );
    }
    const isPasswordValid = await this.userUseCaseHelper.checkPasswordMatch(
      dto.password,
      existingUser.user.password ?? '',
    );

    if (!isPasswordValid) {
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        'Invalid credentials provided',
      );
    }
    const tokens = await this.userUseCaseHelper.generateAccessAndRefreshTokens(
      existingUser.user.id,
      existingUser.user.userRole,
    );

    await this.userUseCaseHelper.setTokensInResponseCookies(
      tokens.accessToken,
      tokens.refreshToken,
      res,
    );
  }

  async loginGoogleUser(userEmail: string, res: Response) {
    const existingUser =
      await this.userUseCaseHelper.checkExistingUserByEmail(userEmail);
    if (!existingUser.exists || !existingUser.user) {
      throw new AppException(
        StatusCodeEnum.NOT_FOUND,
        `user with email "${userEmail}" does not exists.`,
      );
    }
    const tokens = await this.userUseCaseHelper.generateAccessAndRefreshTokens(
      existingUser.user.id,
      existingUser.user.userRole,
    );

    await this.userUseCaseHelper.setTokensInResponseCookies(
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
    const existingUser = await this.userUseCaseHelper.checkExistingUserByEmail(
      dto.email,
    );
    if (!existingUser.exists) {
      const newUser = this.userFactory.registerOauthUser(dto);
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

  async logoutUser(res: Response) {
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
