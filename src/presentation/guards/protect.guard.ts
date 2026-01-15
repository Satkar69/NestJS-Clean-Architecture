import { CanActivate, Injectable } from '@nestjs/common';
import { IClsStore } from 'src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';
import { IPgDataServices } from 'src/core/application/ports/out/data-services/postgres/pg-data-services.abstract';
import { UnauthorizedException } from 'src/shared/exceptions';
import { IJwtPayload } from 'src/core/application/ports/out/services/jwt.abstract';

@Injectable()
export class ProtectGuard implements CanActivate {
  constructor(
    private cls: IClsStore<AppClsStore>,
    private dataServices: IPgDataServices,
  ) {}

  async canActivate(): Promise<boolean> {
    const isPublic = this.cls.get<boolean>('isPublic');
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
