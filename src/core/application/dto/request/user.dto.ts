import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
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
    required: true,
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
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email address of the user',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password for the user account',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'Role of the user',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  userRole?: UserRoleEnum;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is active',
    required: false,
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
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password for the user account',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterOauthUserDto {
  @IsNotEmpty()
  @IsString()
  oauthProvider: string;

  @IsNotEmpty()
  @IsString()
  oauthProviderId: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
