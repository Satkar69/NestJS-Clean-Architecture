import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/domain/abstracts/data-services.abstract';
import { IBcryptService } from '../../ports/out/bcrypt.abstract';
import { UserFactoryUseCaseService } from './user-factory.service';
import { RegisterUserDto } from '../../dto/request/user.dto';
import { IUserService } from '../../ports/in/user-service.abstract';
import { EntityAlreadyExistsException } from 'src/shared/exceptions';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private dataServices: IDataServices,
    private userFactory: UserFactoryUseCaseService,
    private bcryptService: IBcryptService,
  ) {}

  async checkExistingUserByEmail(email: string) {
    const existingUser = await this.dataServices.user.getOneOrNull({
      email,
    });
    if (existingUser) {
      throw new EntityAlreadyExistsException('User', 'email', email);
    }
    return true;
  }

  async registerUser(dto: RegisterUserDto) {
    await this.checkExistingUserByEmail(dto.email);
    const hashedPassword = await this.bcryptService.hash(dto.password);
    const user = this.userFactory.registerUser({
      ...dto,
      password: hashedPassword,
    });
    return this.dataServices.user.create(user);
  }
}
