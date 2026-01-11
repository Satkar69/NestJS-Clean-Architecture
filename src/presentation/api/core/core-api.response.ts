import { IPaginationOptions } from 'src/shared/response/interface/pagination-options.interface';
import { AppPagination } from 'src/shared/response/app-pagination';
import { AppResponse } from 'src/shared/response/app-response';
import { IPaginationData } from 'src/shared/response/interface/pagination-data.interface';

export class CoreApiResponse {
  static success<TData>(
    statusCode: number = 200,
    message: string = 'success',
    data: TData,
  ) {
    return new AppResponse({
      statusCode,
      message,
      data,
    });
  }

  static pagination(
    paginationData: IPaginationData,
    query: IPaginationOptions,
    statusCode: number = 200,
    message: string = 'success',
  ) {
    return new AppPagination({
      ...paginationData,
      ...query,
      statusCode,
      message: message,
    });
  }
}
