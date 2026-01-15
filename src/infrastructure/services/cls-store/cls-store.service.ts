import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IClsStore } from 'src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';

@Injectable()
export class ClsStoreService implements IClsStore<AppClsStore> {
  constructor(private readonly cls: ClsService<AppClsStore>) {}

  get<K extends keyof AppClsStore>(key: K): AppClsStore[K] | undefined {
    return this.cls.get(key);
  }
  set<K extends keyof AppClsStore>(key: K, value: AppClsStore[K]): void {
    this.cls.set(key, value);
  }
}
