import { UserModel } from 'src/core/domain/model/user.model';
import { RegisterUserDto } from '../../dto/request/user.dto';

export abstract class IUserService {
  abstract registerUser(dto: RegisterUserDto): Promise<UserModel>;
}
