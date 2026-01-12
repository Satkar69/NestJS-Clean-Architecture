import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/domain/abstracts/data-services.abstract';
import { IBcryptService } from '../../ports/out/bcrypt.abstract';
import { UserFactoryUseCaseService } from './user-factory.service';
import { RegisterUserDto } from '../../dto/request/user.dto';
import { IUserService } from '../../ports/in/user-service.abstract';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private dataServices: IDataServices,
    private userFactory: UserFactoryUseCaseService,
    private bcryptService: IBcryptService,
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const user = this.userFactory.registerUser(dto);
    user.password = await this.bcryptService.hash(user.password);
    return this.dataServices.user.create(user);
  }
}
