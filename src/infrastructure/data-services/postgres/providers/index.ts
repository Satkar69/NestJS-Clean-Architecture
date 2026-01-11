import InjectableString from 'src/shared/constants/injectable-string';
import { DataSource } from 'typeorm';
import { pgDatabaseProvider } from './pgDatabase.provider';
import { UserEntity } from '../entities/user.entity';

const providers = [
  ...pgDatabaseProvider,
  {
    provide: UserEntity.REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserEntity),
    inject: [InjectableString.APP_DATA_SOURCE],
  },
];
export default providers;
