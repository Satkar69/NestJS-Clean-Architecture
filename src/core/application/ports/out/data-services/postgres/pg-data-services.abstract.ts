import { IPgGenericRepository } from './pg-generic-repository.abstract';
import { UserModel } from '../../../../../domain/model/user.model';

export abstract class IPgDataServices {
  abstract user: IPgGenericRepository<UserModel>;
  abstract handleTransaction<T>(
    operation: (manager: unknown) => Promise<T>,
  ): Promise<T>;
}
