import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  LoginUserDto,
  RegisterUserDto,
} from '@/src/core/application/dto/request/auth.dto';
import { CoreApiResponse } from '@/src/presentation/api/core/core-api.response';
import { GoogleOauthGuard } from '@/src/presentation/guards/google-Oauth.guard';
import type { Request, Response } from 'express';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';
import { AuthUseCaseService } from '@/src/core/application/use-cases/auth/auth-use-case.service';
import { CoreApiResponseDto } from '@/src/core/application/dto/response/core/core-api-response.dto';
import { RegisterUserResponseDto } from '@/src/core/application/dto/response/auth.dto';
@Controller()
export class AuthController {
  constructor(private authService: AuthUseCaseService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: StatusCodeEnum.CREATED,
    type: CoreApiResponseDto(
      RegisterUserResponseDto,
      StatusCodeEnum.CREATED,
      'user registered successfully',
    ),
  })
  @Post('/register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return CoreApiResponse.success(
      await this.authService.registerUser(dto),
      StatusCodeEnum.CREATED,
      'user registered successfully',
    );
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    type: CoreApiResponseDto(
      null,
      StatusCodeEnum.OK,
      'user logged in successfully',
    ),
  })
  @Post('/login')
  async loginUser(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return CoreApiResponse.success(
      await this.authService.loginUser(dto, res),
      StatusCodeEnum.OK,
      'user logged in successfully',
    );
  }

  @ApiOperation({ summary: ' Google OAuth login' })
  @UseGuards(GoogleOauthGuard)
  @Get('google/login')
  googleLogin() {}

  @ApiOperation({ summary: ' Google OAuth callback' })
  @Get('/google/login/callback')
  @UseGuards(GoogleOauthGuard)
  async googleLoginCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.loginGoogleUser(req.user!.email, res);
    return res.send(`
    <html>
      <body>
        <p>Login successful!</p>
      </body>
    </html>
  `);
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: StatusCodeEnum.OK,
    type: CoreApiResponseDto(
      null,
      StatusCodeEnum.OK,
      'user logged out successfully',
    ),
  })
  @Post('/logout')
  logoutUser(@Res({ passthrough: true }) res: Response) {
    return CoreApiResponse.success(
      this.authService.logoutUser(res),
      StatusCodeEnum.OK,
      'user logged out successfully',
    );
  }
}
