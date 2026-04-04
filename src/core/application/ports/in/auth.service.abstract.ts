import { UserModel } from '@/src/core/domain/model/user.model';
import {
  LoginUserDto,
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/auth.dto';
import { Response } from 'express';
import { UserClsStore } from '@/src/shared/interface/cls-store/user-cls.interface';

export abstract class IAuthService {
  abstract registerUser(dto: RegisterUserDto): Promise<UserModel>;
  abstract loginUser(dto: LoginUserDto, res: Response): Promise<void>;
  abstract loginGoogleUser(userEmail: string, res: Response): Promise<void>;
  abstract validateOauthUser(dto: RegisterOauthUserDto): Promise<UserClsStore>;
  abstract logoutUser(res: Response): void;
}
