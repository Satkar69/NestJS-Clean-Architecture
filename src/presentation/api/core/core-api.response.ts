import { IPaginationOptions } from 'src/shared/interface/response/pagination-options.interface';
import { AppPagination } from 'src/shared/interface/response/app-pagination';
import { AppResponse } from 'src/shared/interface/response/app-response';
import { IPaginationData } from 'src/shared/interface/response/pagination-data.interface';

export class CoreApiResponse {
  static success<TData>(
    data: TData,
    statusCode: number = 200,
    message: string = 'success',
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
