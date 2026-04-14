import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function CoreApiResponseDto<TData>(
  DataDto: Type<TData> | null,
  statusCode: number,
  message: string,
  isArray = false,
) {
  class CoreApiResponseClass {
    @ApiProperty({ example: statusCode })
    statusCode: number;

    @ApiProperty({ example: message })
    message: string;

    @ApiProperty({ type: DataDto ?? Object, isArray })
    data: TData | TData[];

    @ApiProperty({ example: '2026-04-11T14:26:47.078Z' })
    timestamp: string;
  }
  return CoreApiResponseClass;
}
