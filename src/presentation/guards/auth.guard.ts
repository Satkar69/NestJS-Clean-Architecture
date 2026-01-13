import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IClsStore } from 'src/core/application/ports/out/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';
import { IJwtService } from 'src/core/application/ports/out/jwt.abstract';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { Request, Response } from 'express';
import { SessionExpiredException } from 'src/shared/exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: IJwtService,
    private cls: IClsStore<AppClsStore>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const { url: requestUrl } = request;

    const isPublic = this.isPublicRoute(context, requestUrl);
    this.cls.set('isPublic', isPublic);

    if (isPublic) {
      return true;
    }
    await this.authenticateUser(request, response);
    return true;
  }

  private isPublicRoute(context: ExecutionContext, url: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ||
      url.startsWith('/api/v1/user/register') ||
      url.startsWith('/api/v1/user/login') ||
      url.startsWith('/api/v1/user/logout')
      ? true
      : false;
  }

  private async authenticateUser(
    request: Request,
    response: Response,
  ): Promise<void> {
    const accessToken = this.extractAccessToken(request);
    const refreshToken = this.extractRefreshToken(request);

    if (!accessToken || accessToken === 'null' || accessToken === 'undefined') {
      await this.refreshAccessToken(response, refreshToken);
      return;
    }

    try {
      const payload = await this.verifyToken(accessToken);

      if (payload) {
        this.cls.set('tokenPayload', payload);
        return;
      }

      await this.refreshAccessToken(response, refreshToken);
    } catch (error) {
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError'
      ) {
        await this.refreshAccessToken(response, refreshToken);
      } else {
        throw new SessionExpiredException();
      }
    }
  }

  private async refreshAccessToken(
    response: Response,
    refreshToken: string | undefined,
  ): Promise<void> {
    if (
      !refreshToken ||
      refreshToken === 'null' ||
      refreshToken === 'undefined'
    ) {
      throw new SessionExpiredException();
    }

    try {
      const refreshPayload = await this.verifyToken(refreshToken);

      if (!refreshPayload) {
        throw new SessionExpiredException();
      }

      const newAccessToken = await this.jwtService.createRefreshToken({
        sub: refreshPayload.sub,
        role: refreshPayload.role,
      });

      response.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      const newPayload = await this.verifyToken(newAccessToken);
      this.cls.set('tokenPayload', newPayload);
    } catch (error) {
      throw new SessionExpiredException();
    }
  }

  private async verifyToken(token: string): Promise<any | null> {
    try {
      const decoded = await this.jwtService.checkToken(token.trim());
      return decoded;
    } catch (error) {
      return null;
    }
  }

  private extractAccessToken(request: Request): string | undefined {
    return request.cookies?.accessToken || this.extractTokenFromHeader(request);
  }

  private extractRefreshToken(request: Request): string | undefined {
    return request.cookies?.refreshToken;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
