import { IGenericRepositoryPort } from '../../../application/ports/out/generic-repository.port';
import { UserModel } from '../../model/user.model';

export abstract class IDataServices {
  abstract user: IGenericRepositoryPort<UserModel>;

  abstract handleTransaction<T>(
    operation: (manager: unknown) => Promise<T>,
  ): Promise<T>;
}
