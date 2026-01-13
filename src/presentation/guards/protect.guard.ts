import { CanActivate, Injectable } from '@nestjs/common';
import { IClsStore } from 'src/core/application/ports/out/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';
import { IDataServices } from 'src/core/application/ports/out/data-services.abstract';
import { UnauthorizedException } from 'src/shared/exceptions';
import { IJwtPayload } from 'src/core/application/ports/out/jwt.abstract';

@Injectable()
export class ProtectGuard implements CanActivate {
  constructor(
    private cls: IClsStore<AppClsStore>,
    private dataServices: IDataServices,
  ) {}

  async canActivate(): Promise<boolean> {
    const isPublic = this.cls.get<boolean>('isPublic');
    console.log('Authorizing protected route...');
    if (isPublic) {
      return true;
    }
    const isProtected = this.cls.get<boolean>('isProtected');
    if (isProtected) {
      await this.authorizeUser();
    }

    return true;
  }

  private async authorizeUser(): Promise<void> {
    const payload = this.cls.get<IJwtPayload>('tokenPayload');
    console.log('Payload in ProtectGuard:', payload);
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.getUserFromPayload(payload.sub);
    this.cls.set('user', {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName ? user.middleName : undefined,
      lastName: user.lastName,
      email: user.email,
      userRole: user.userRole,
    });
  }

  private async getUserFromPayload(userId: string) {
    const user = await this.dataServices.user.getOneOrNull({ id: userId });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
