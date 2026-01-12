import { ClsStore } from 'nestjs-cls';
import { UserClsStore } from './user-cls.interface';
import { IPaginationOptions } from '../response/pagination-options.interface';

export interface AppClsStore extends ClsStore {
  user?: UserClsStore;
  paginationOptions?: IPaginationOptions;
  isPublic?: boolean;
}
