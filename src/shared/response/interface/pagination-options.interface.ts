export interface IPaginationOptions<
  TFilters = string | number | boolean | any[],
> {
  page?: number;
  limit?: number;
  filters?: Partial<TFilters>;
  searchString?: string;
}
