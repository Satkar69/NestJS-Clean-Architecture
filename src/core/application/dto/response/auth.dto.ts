import { UserRoleEnum } from '@/src/core/domain/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponseDto {
  @ApiProperty({
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    example: 'William',
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
    example: 'USER',
    enum: [Object.values(UserRoleEnum)],
  })
  userRole: string;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;
}
