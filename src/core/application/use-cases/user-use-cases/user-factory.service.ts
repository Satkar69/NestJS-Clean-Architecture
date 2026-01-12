import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/core/domain/model/user.model';
import { RegisterUserDto } from '../../dto/request/user.dto';

@Injectable()
export class UserFactoryUseCaseService {
  registerUser(dto: RegisterUserDto) {
    const user = new UserModel();
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.middleName) user.middleName = dto.middleName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = dto.password;
    if (dto.userRole) user.userRole = dto.userRole;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    return user;
  }
}
