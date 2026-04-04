import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../ports/out/data-services/data-services.abstract';
import { UserModel } from '@/src/core/domain/model/user.model';
@Injectable()
export class UserUseCaseHelper {
  constructor(private dataServices: IDataServices) {}

  async checkExistingUserByEmail(email: string) {
    let response: {
      exists: boolean;
      user?: UserModel | null;
    } = {
      exists: false,
    };
    const existingUser = await this.dataServices.user.getOneOrNull({
      email,
    });
    if (existingUser) {
      response = {
        exists: true,
        user: existingUser,
      };
    }
    return response;
  }
}
