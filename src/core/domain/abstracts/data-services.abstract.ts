import { IGenericRepository } from '../../application/ports/out/generic-repository.abstract';
import { UserModel } from '../model/user.model';

export abstract class IDataServices {
  abstract user: IGenericRepository<UserModel>;
  abstract handleTransaction<T>(
    operation: (manager: unknown) => Promise<T>,
  ): Promise<T>;
}
