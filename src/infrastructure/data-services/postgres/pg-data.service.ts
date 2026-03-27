import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import InjectableString from '@/src/shared/constants/injectable-string';
import { IDataServices } from '@/src/core/application/ports/out/data-services/data-services.abstract';
import { UserEntity } from './entities/user.entity';
import { PgGenericRepository } from './pg-generic-repository';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { IClsStore } from '@/src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from '@/src/shared/interface/cls-store/app-cls-store.interface';
import { IGenericRepository } from '@/src/core/application/ports/out/data-services/generic-repository.abstract';
import { UserModel } from '@/src/core/domain/model/user.model';
import { AppException } from '@/src/shared/exceptions';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';

@Injectable()
export class PgDataService implements IDataServices, OnApplicationBootstrap {
  user: IGenericRepository<UserModel>;

  constructor(
    private readonly cls: IClsStore<AppClsStore>,

    @Inject(InjectableString.APP_DATA_SOURCE)
    private dataSource: DataSource,

    @Inject(UserEntity.REPOSITORY)
    private userRepository: Repository<UserEntity>,
  ) {}

  onApplicationBootstrap() {
    this.user = new PgGenericRepository(this.cls, this.userRepository);
  }

  async handleTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new AppException(
        StatusCodeEnum.INTERNAL_SERVER_ERROR,
        `Transaction failed: ${errorMessage}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
