import { BaseEntity } from './base';
import { Entity, Column } from 'typeorm';
import { UserRoleEnum } from 'src/core/domain/enums/user.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'email', length: 150, unique: true })
  email: string;

  @Column({ name: 'is_oauth_user', nullable: true })
  isOauthUser: boolean;

  @Column({ name: 'oauth_provider', length: 100, nullable: true })
  oauthProvider?: string;

  @Column({ name: 'oauth_provider_id', length: 100, nullable: true })
  oauthProviderId?: string;

  @Column({ name: 'password', length: 255, nullable: true })
  password?: string;

  @Column({
    name: 'user_role',
    type: 'enum',
    enum: UserRoleEnum,
  })
  userRole: UserRoleEnum;

  @Column({ name: 'is_active' })
  isActive: boolean;
}
