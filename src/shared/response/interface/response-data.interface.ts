export interface IResponseData {
  data: Array<any>;
  warnings?: any;
  total: number;
  page: number;
  limit: number;
  previous?: string;
  next?: string;
}
