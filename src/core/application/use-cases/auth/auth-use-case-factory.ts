import { Injectable } from '@nestjs/common';
import { UserModel } from '@/src/core/domain/model/user.model';
import {
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/user.dto';

@Injectable()
export class AuthUseCaseFactory {
  registerUser(dto: RegisterUserDto) {
    const user = new UserModel();
    user.firstName = dto.firstName;
    if (dto.middleName) user.middleName = dto.middleName;
    user.lastName = dto.lastName;
    user.email = dto.email;
    user.password = dto.password;
    if (dto.userRole) user.userRole = dto.userRole;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    return user;
  }
  registerOauthUser(dto: RegisterOauthUserDto) {
    const user = new UserModel();
    user.isOauthUser = true;
    user.oauthProvider = dto.oauthProvider;
    user.oauthProviderId = dto.oauthProviderId;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.email = dto.email;
    return user;
  }
}
