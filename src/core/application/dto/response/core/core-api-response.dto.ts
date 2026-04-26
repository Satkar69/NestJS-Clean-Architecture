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

export function CoreApiPaginationResponseDto<TData>(
  DataDto: Type<TData>,
  statusCode: number,
  message: string,
) {
  const messageSlug = message
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  const className = `CoreApiPaginationResponse_${DataDto.name}_${statusCode}_${messageSlug}`;

  class PaginationMetaClass {
    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 5 })
    pageTotal: number;

    @ApiProperty({ example: 10 })
    totalPages: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 2, nullable: true })
    next: number | null;

    @ApiProperty({ example: null, nullable: true })
    previous: number | null;
  }

  class CoreApiPaginationResponseClass {
    @ApiProperty({ example: statusCode })
    statusCode: number;

    @ApiProperty({ example: message })
    message: string;

    @ApiProperty({ type: DataDto, isArray: true })
    data: TData[];

    @ApiProperty({ type: PaginationMetaClass })
    meta: PaginationMetaClass;
  }

  Object.defineProperty(PaginationMetaClass, 'name', {
    value: `${className}_Meta`,
  });

  Object.defineProperty(CoreApiPaginationResponseClass, 'name', {
    value: className,
  });

  return CoreApiPaginationResponseClass;
}
