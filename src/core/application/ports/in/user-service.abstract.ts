import { UserModel } from '@/src/core/domain/model/user.model';
import { LoginUserDto, RegisterUserDto } from '../../dto/request/user.dto';
import { Response } from 'express';

export abstract class IUserService {
  abstract registerUser(dto: RegisterUserDto): Promise<UserModel>;
  abstract loginUser(dto: LoginUserDto, res: Response): Promise<any>;
  abstract logoutUser(res: any): Promise<any>;
}
