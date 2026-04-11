import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';

export interface UserClsStore {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  userRole: UserRoleEnum;
}
