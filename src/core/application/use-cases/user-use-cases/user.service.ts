import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/application/ports/out/data-services.abstract';
import { IBcryptService } from '../../ports/out/bcrypt.abstract';
import { IJwtService } from '../../ports/out/jwt.abstract';
import { UserFactoryService } from './user-factory.service';
import {
  LoginUserDto,
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/user.dto';
import { IUserService } from '../../ports/in/user-service.abstract';
import {
  BadRequestException,
  EntityAlreadyExistsException,
  InvalidCredentialsException,
} from 'src/shared/exceptions';
import { UserModel } from 'src/core/domain/model/user.model';
import { Response } from 'express';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private dataServices: IDataServices,
    private userFactory: UserFactoryService,
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

  async registerUser(dto: RegisterUserDto) {
    const existingUser = await this.checkExistingUserByEmail(dto.email);
    if (existingUser.exists) {
      throw new EntityAlreadyExistsException('User', 'email', dto.email);
    }
    const hashedPassword = await this.bcryptService.hash(dto.password);
    const user = this.userFactory.registerUser({
      ...dto,
      password: hashedPassword,
    });
    return this.dataServices.user.create(user);
  }

  async loginUser(dto: LoginUserDto, res: Response) {
    const existingUser = await this.checkExistingUserByEmail(dto.email);

    if (!existingUser.exists || !existingUser.user) {
      throw new InvalidCredentialsException(
        `user with email "${dto.email}" does not exists.`,
      );
    }
    const isPasswordValid = await this.checkPasswordMatch(
      dto.password,
      existingUser.user.password ?? '',
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException('Invalid Password Provided');
    }
    const tokenPayload = {
      sub: existingUser.user.id,
      role: existingUser.user.userRole,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.createAccessToken(tokenPayload),
      this.jwtService.createRefreshToken(tokenPayload),
    ]);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async loginGoogleUser(userEmail: string, res: Response) {
    const existingUser = await this.checkExistingUserByEmail(userEmail);
    if (!existingUser.exists || !existingUser.user) {
      throw new InvalidCredentialsException(
        `user with email "${userEmail}" does not exists.`,
      );
    }

    const tokenPayload = {
      sub: existingUser.user.id,
      role: existingUser.user.userRole,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.createAccessToken(tokenPayload),
      this.jwtService.createRefreshToken(tokenPayload),
    ]);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateOauthUser(dto: RegisterOauthUserDto) {
    if (!dto) {
      throw new BadRequestException('Invalid User Data, Unauthenticated');
    }
    const existingUser = await this.checkExistingUserByEmail(dto.email);
    if (!existingUser.exists) {
      const newUser = this.userFactory.registerOauthUser(dto);
      return await this.dataServices.user.create(newUser);
    }
    return existingUser.user;
  }

  async logoutUser(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return;
  }
}
