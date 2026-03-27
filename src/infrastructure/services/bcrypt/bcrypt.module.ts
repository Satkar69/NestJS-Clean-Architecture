import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { IBcryptService } from '@/src/core/application/ports/out/services/bcrypt.abstract';

@Module({
  providers: [
    {
      provide: IBcryptService,
      useClass: BcryptService,
    },
  ],
  exports: [IBcryptService],
})
export class BcryptServiceModule {}
