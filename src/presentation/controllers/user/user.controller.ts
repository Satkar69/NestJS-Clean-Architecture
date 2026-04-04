import { Controller, Get } from '@nestjs/common';
import { IClsStore } from '@/src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from '@/src/shared/interface/cls-store/app-cls-store.interface';
import { UserClsStore } from '@/src/shared/interface/cls-store/user-cls.interface';
import { CoreApiResponse } from '../../api/core/core-api.response';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class UserController {
  constructor(private cls: IClsStore<AppClsStore>) {}

  @ApiOperation({ summary: 'Get current logged in user' })
  @Get('/me')
  async me() {
    return CoreApiResponse.success(this.cls.get<UserClsStore>('user'));
  }
}
