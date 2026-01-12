import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { IClsStore } from 'src/core/application/ports/out/cls-store.abstract';
import { IPaginationOptions } from 'src/shared/interface/response/pagination-options.interface';
import { ClsStoreService } from './cls-store.service';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      guard: {
        mount: true,
        setup: (cls, context) => {
          const request = context.switchToHttp().getRequest();
          cls.set('paginationOptions', request.query as IPaginationOptions);
        },
      },
    }),
  ],
  providers: [
    {
      provide: IClsStore,
      useClass: ClsStoreService,
    },
  ],
  exports: [ClsModule, IClsStore],
})
export class ClsStoreModule {}
