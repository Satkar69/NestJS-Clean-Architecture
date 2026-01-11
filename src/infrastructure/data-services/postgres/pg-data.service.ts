import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import InjectableString from 'src/shared/constants/injectable-string';
import { IGenericRepository } from 'src/core/abstracts/generic-repository.abstract';
import { IDataServices } from 'src/core/domain/abstracts/data-services/data-services.abstract';
import { UserModel } from 'src/core/domain/model/user.model';
import { UserEntity } from './entities/user.entity';

// @Injectable()
// export class PgDataService implements IDataServices, OnApplicationBootstrap {
//   user: pg;
// }
