export interface IPaginationResponse<PaginationModel> {
  statusCode?: number;
  message?: string;
  data: PaginationModel[];
  warnings?: any;
  totalPages: number;
  next?: string;
  previous?: string;
  page?: number;
  limit?: number;
}
