import { BaseEntity } from './base';
import { Entity, Column } from 'typeorm';
import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ name: 'is_oauth_user', type: 'boolean', nullable: true })
  isOauthUser: boolean;

  @Column({
    name: 'oauth_provider',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  oauthProvider?: string;

  @Column({
    name: 'oauth_provider_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  oauthProviderId?: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({
    name: 'user_role',
    type: 'varchar',
    length: 100,
  })
  userRole: UserRoleEnum;

  @Column({ name: 'is_active', type: 'boolean' })
  isActive: boolean;
}
