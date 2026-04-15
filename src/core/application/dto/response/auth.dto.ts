import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponseDto {
  @ApiProperty({
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    example: 'William | null | undefined',
  })
  middleName?: string;

  @ApiProperty({
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    example: false,
  })
  isOauthUser: boolean;

  @ApiProperty({
    example: 'GOOGLE | null | undefined',
  })
  oauthProvider?: string;

  @ApiProperty({
    example: 'aoi3240813h10394 | null | undefined',
  })
  oauthProviderId?: string;

  @ApiProperty({
    example: 'USER',
    enum: [Object.values(UserRoleEnum)],
  })
  userRole: string;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;
}
