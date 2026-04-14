import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function CoreApiResponseDto<TData>(
  DataDto: Type<TData> | null,
  statusCode: number,
  message: string,
  isArray = false,
) {
  const messageSlug = message
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  const className = `CoreApiResponse_${DataDto?.name ?? 'Empty'}_${statusCode}_${messageSlug}`;

  class CoreApiResponseClass {
    @ApiProperty({ example: statusCode })
    statusCode: number;

    @ApiProperty({ example: message })
    message: string;

    @ApiProperty({ example: '2026-04-11T14:26:47.078Z' })
    timestamp: string;
  }

  if (DataDto) {
    ApiProperty({ type: DataDto, isArray })(
      CoreApiResponseClass.prototype,
      'data',
    );
  }

  Object.defineProperty(CoreApiResponseClass, 'name', { value: className });

  return CoreApiResponseClass;
}
