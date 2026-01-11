import { IPaginationData } from 'src/shared/interface/response/pagination-data.interface';
import { RelationType } from 'src/shared/type/relation-type';

export type keyValueObj = {
  [key: string]: any;
};

export type OtherMethodOptions = {
  withDeleted?: boolean;
};

export abstract class IGenericRepository<T> {
  abstract getAll(
    condition?: keyValueObj | any[],
    relations?: RelationType,
    order?: keyValueObj,
    select?: keyValueObj,
    methodOptions?: OtherMethodOptions,
    manager?: unknown,
  ): Promise<T[]>;

  abstract getAllWithPagination(
    condition?: keyValueObj | any[],
    relations?: RelationType,
    order?: keyValueObj,
    select?: keyValueObj,
    methodOptions?: OtherMethodOptions,
    manager?: unknown,
  ): Promise<IPaginationData>;

  abstract getOne(
    condition: keyValueObj | any[],
    relations?: RelationType,
    select?: keyValueObj,
    methodOptions?: OtherMethodOptions,
    manager?: unknown,
  ): Promise<T>;

  abstract create(item: T, manager?: unknown): Promise<T>;

  abstract update(
    condition: keyValueObj | any[],
    item: T,
    manager?: unknown,
  ): Promise<T>;

  abstract findOrCreate(
    condition: keyValueObj | any[],
    item: T,
    relations?: RelationType,
    methodOptions?: OtherMethodOptions,
    manager?: unknown,
  ): Promise<T>;

  abstract createOrUpdate(
    condition: keyValueObj | any[],
    item: T,
    relations?: RelationType,
    manager?: unknown,
  ): Promise<T>;

  abstract softDelete(
    condition: keyValueObj | any[],
    relations?: RelationType,
    manager?: unknown,
  ): Promise<void>;

  abstract hardDelete(
    condition: keyValueObj | any[],
    relations?: RelationType,
    manager?: unknown,
  ): Promise<void>;
}
