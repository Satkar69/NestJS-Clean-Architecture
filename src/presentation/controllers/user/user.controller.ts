import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/core/application/dto/request/user.dto';
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
}
