import { ClsStore } from 'nestjs-cls';
import { UserClsStore } from './user-cls.interface';
import { IPaginationOptions } from '../response/pagination-options.interface';
import { IJwtPayload } from 'src/core/application/ports/out/services/jwt.abstract';

export interface AppClsStore extends ClsStore {
  user?: UserClsStore;
  paginationOptions?: IPaginationOptions;
  isPublic?: boolean;
  isProtected?: boolean;
  tokenPayload?: IJwtPayload;
}
