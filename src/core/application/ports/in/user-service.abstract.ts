import { UserModel } from '@/src/core/domain/model/user.model';
import {
  LoginUserDto,
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/user.dto';
import { Response } from 'express';

export abstract class IUserUseCaseService {
  abstract registerUser(dto: RegisterUserDto): Promise<UserModel>;
  abstract loginUser(dto: LoginUserDto, res: Response): Promise<any>;
  abstract loginGoogleUser(userEmail: string, res: Response): Promise<any>;
  abstract validateOauthUser(dto: RegisterOauthUserDto): Promise<UserModel>;
  abstract logoutUser(res: Response): Promise<any>;
}
