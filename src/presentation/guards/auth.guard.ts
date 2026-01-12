import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IClsStore } from 'src/core/application/ports/out/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';
import { IJwtService } from 'src/core/application/ports/out/jwt.abstract';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { AuthorizationException } from 'src/shared/exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: IJwtService,
    private cls: IClsStore<AppClsStore>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { url: requestUrl } = request;

    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || requestUrl.startsWith('/api/v1/user/register')
        ? true
        : false;
    if (isPublic) {
      this.cls.set('isPublic', true);
      return true;
    }
    return true;
  }
}
