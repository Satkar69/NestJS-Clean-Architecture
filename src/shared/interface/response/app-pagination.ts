import { IPaginationResponse } from './pagination-response.interface';

export class AppPagination<PaginationModel> {
  public statusCode: number;
  public message: string;
  public data: PaginationModel[];
  public meta: any;

  constructor(paginationResponse: IPaginationResponse<PaginationModel>) {
    this.statusCode = paginationResponse.statusCode ?? 200;
    this.message = paginationResponse.message ?? 'Success';
    this.data = paginationResponse.data;

    const page = +(paginationResponse.page ?? 1);
    const limit = +(paginationResponse.limit ?? 10);
    const totalPages = Math.ceil(paginationResponse.totalPages / limit);

    this.meta = {
      limit: limit,
      pageTotal: paginationResponse.data.length,
      totalPages: totalPages,
      page: page,
      next: page < totalPages ? page + 1 : null,
      previous: page > 1 && page <= totalPages ? page - 1 : null,
    };
  }
}
