import { UserRoleEnum } from '../enums/user.enum';

export class UserModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contact: string;
  password: string;
  userRole: UserRoleEnum;
  isActive: boolean;
}
