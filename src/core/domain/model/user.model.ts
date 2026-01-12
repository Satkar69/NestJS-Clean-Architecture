import { UserRoleEnum } from '../enums/user.enum';
import { BaseModel } from './base/base.model';

export class UserModel extends BaseModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  userRole: UserRoleEnum = UserRoleEnum.USER;
  isActive: boolean = true;
}
