import { Injectable } from '@nestjs/common';
import { UserModel } from '@/src/core/domain/model/user.model';
import {
  RegisterOauthUserDto,
  RegisterUserDto,
} from '../../dto/request/user.dto';

@Injectable()
export class UserUseCaseFactory {
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
  registerOauthUser(dto: RegisterOauthUserDto) {
    const user = new UserModel();
    user.isOauthUser = true;
    if (dto.oauthProvider) user.oauthProvider = dto.oauthProvider;
    if (dto.oauthProviderId) user.oauthProviderId = dto.oauthProviderId;
    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.email) user.email = dto.email;
    return user;
  }
}
