import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  LoginUserDto,
  RegisterUserDto,
} from 'src/core/application/dto/request/user.dto';
import { UserService } from 'src/core/application/use-cases/user-use-cases/user.service';
import { CoreApiResponse } from 'src/presentation/api/core/core-api.response';
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('/register')
  async registerUser(@Body() dto: RegisterUserDto) {
    return CoreApiResponse.success(
      await this.userService.registerUser(dto),
      201,
      'user registered successfully',
    );
  }

  @ApiOperation({ summary: 'Login a user' })
  @Post('/login')
  async loginUser(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: any,
  ) {
    return CoreApiResponse.success(
      await this.userService.loginUser(dto, res),
      200,
      'user logged in successfully',
    );
  }

  @ApiOperation({ summary: 'Logout a user' })
  @Post('/logout')
  async logoutUser(@Res({ passthrough: true }) res: any) {
    return CoreApiResponse.success(
      await this.userService.logoutUser(res),
      200,
      'user logged out successfully',
    );
  }
}
