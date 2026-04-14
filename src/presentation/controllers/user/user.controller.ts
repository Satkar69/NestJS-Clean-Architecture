import { Controller, Get } from '@nestjs/common';
import { IClsStore } from '@/src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from '@/src/shared/interface/cls-store/app-cls-store.interface';
import { UserClsStore } from '@/src/shared/interface/cls-store/user-cls.interface';
import { CoreApiResponse } from '../../api/core/core-api.response';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';
import { CoreApiResponseDto } from '@/src/core/application/dto/response/core/core-api-response.dto';
import { UserResponseDto } from '@/src/core/application/dto/response/user.dto';

@Controller()
export class UserController {
  constructor(private cls: IClsStore<AppClsStore>) {}

  @ApiOperation({ summary: 'Get current logged in user' })
  @ApiResponse({
    status: StatusCodeEnum.CREATED,
    type: CoreApiResponseDto(
      UserResponseDto,
      StatusCodeEnum.OK,
      'user registered successfully',
    ),
  })
  @Get('/me')
  me() {
    return CoreApiResponse.success(
      this.cls.get<UserClsStore>('user'),
      StatusCodeEnum.OK,
      'Logged in user retrieved successfully',
    );
  }
}
