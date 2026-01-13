import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/application/ports/out/data-services.abstract';
import { IBcryptService } from '../../ports/out/bcrypt.abstract';
import { IJwtService } from '../../ports/out/jwt.abstract';
import { UserFactoryUseCaseService } from './user-factory.service';
import { LoginUserDto, RegisterUserDto } from '../../dto/request/user.dto';
import { IUserService } from '../../ports/in/user-service.abstract';
import {
  EntityAlreadyExistsException,
  InvalidCredentialsException,
} from 'src/shared/exceptions';
import { UserModel } from 'src/core/domain/model/user.model';
import { UserRoleEnum } from 'src/core/domain/enums/user.enum';
import { Response } from 'express';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private dataServices: IDataServices,
    private userFactory: UserFactoryUseCaseService,
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
    return this.bcryptService.compare(plainPassword, hashedPassword);
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

  async loginUser(dto: LoginUserDto, response: Response) {
    const existingUser = await this.checkExistingUserByEmail(dto.email);
    if (!existingUser.exists) {
      throw new InvalidCredentialsException(
        `user with email "${dto.email}" does not exists.`,
      );
    }
    const isPasswordValid = await this.checkPasswordMatch(
      dto.password,
      existingUser.user?.password ?? '',
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException('Invalid Password Provided');
    }
    const tokenPayload = {
      sub: existingUser.user?.id ?? '',
      role: existingUser.user?.userRole as UserRoleEnum,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.createAccessToken(tokenPayload),
      this.jwtService.createRefreshToken(tokenPayload),
    ]);
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return {
      accessToken,
      refreshToken,
    };
  }
}
