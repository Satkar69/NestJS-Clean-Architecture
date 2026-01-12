import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserRoleEnum } from 'src/core/domain/enums/user.enum';

export class RegisterUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'William',
    description: 'Middle name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password for the user account',
  })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'Role of the user',
  })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  userRole?: UserRoleEnum;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is active',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email address of the user',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact number of the user',
  })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password for the user account',
  })
  @IsOptional()
  @IsString()
  password: string;
}

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
