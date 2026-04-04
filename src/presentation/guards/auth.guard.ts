import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IClsStore } from '@/src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from '@/src/shared/interface/cls-store/app-cls-store.interface';
import {
  IJwtPayload,
  IJwtService,
} from '@/src/core/application/ports/out/services/jwt.abstract';
import { IS_PUBLIC_KEY } from '@/src/shared/decorators/public.decorator';
import { Request, Response } from 'express';
import { AppException } from '@/src/shared/exceptions';
import { IS_PROTECTED_KEY } from '@/src/shared/decorators/protected.decorator';
import { TokenType } from '@/src/shared/type/token-type';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: IJwtService,
    private cls: IClsStore<AppClsStore>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse<Response>();
    const { url: requestUrl } = request;

    const isPublic = this.isPublicRoute(context, requestUrl);
    this.cls.set('isPublic', isPublic);

    if (isPublic) {
      return true;
    }
    const isProtected = this.isProtectedRoute(context, requestUrl);
    this.cls.set('isProtected', isProtected);

    await this.authenticateUser(request, response);
    return true;
  }

  private isPublicRoute(context: ExecutionContext, url: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || url.startsWith('/api/v1/auth')
      ? true
      : false;
  }

  private isProtectedRoute(context: ExecutionContext, url: string): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(IS_PROTECTED_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || url.startsWith('/api/v1')
    );
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
      const payload = await this.verifyToken(accessToken, 'access');
      if (payload) {
        this.cls.set('tokenPayload', payload);
        return;
      }

      await this.refreshAccessToken(response, refreshToken);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'TokenExpiredError' ||
          error.name === 'JsonWebTokenError')
      ) {
        await this.refreshAccessToken(response, refreshToken);
      } else {
        throw new AppException(
          StatusCodeEnum.UNAUTHORIZED,
          'Session has expired or is invalid, Please Login',
          undefined,
          { service: 'AuthGuard', operation: 'authenticateUser' },
        );
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
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        'Session has expired, Please Login',
      );
    }

    const refreshPayload = await this.verifyToken(refreshToken, 'refresh');

    if (!refreshPayload) {
      throw new AppException(
        StatusCodeEnum.UNAUTHORIZED,
        'Session has expired, Please Login',
      );
    }

    const newAccessToken = await this.jwtService.createAccessToken({
      sub: refreshPayload.sub,
      role: refreshPayload.role,
    });

    response.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.jwtService.accessTokenExpiresIn * 1000,
      sameSite: 'none',
    });

    const newPayload = await this.verifyToken(newAccessToken, 'access');
    this.cls.set('tokenPayload', newPayload);
  }

  private async verifyToken(
    token: string,
    tokenType: TokenType,
  ): Promise<IJwtPayload | null> {
    try {
      const decoded = await this.jwtService.checkToken(token.trim(), tokenType);
      return decoded;
    } catch (error) {
      console.log('Token verification failed:', error);
      return null;
    }
  }

  private extractAccessToken(request: Request): string | undefined {
    return (
      request.cookies?.access_token || this.extractTokenFromHeader(request)
    );
  }

  private extractRefreshToken(request: Request): string | undefined {
    return request.cookies?.refresh_token;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}
