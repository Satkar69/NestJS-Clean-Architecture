export interface IPaginationOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, string | number | boolean | any[]>;
  searchString?: string;
}
