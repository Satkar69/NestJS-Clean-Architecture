export interface IPaginationData {
  data: Array<any>;
  warnings?: any;
  totalPages: number;
  page: number;
  limit: number;
  previous?: string;
  next?: string;
}
