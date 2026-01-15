import { IClsStore } from 'src/core/application/ports/out/services/cls-store.abstract';
import { AppClsStore } from 'src/shared/interface/cls-store/app-cls-store.interface';
import { IPaginationOptions } from 'src/shared/interface/response/pagination-options.interface';
import { IPaginationData } from 'src/shared/interface/response/pagination-data.interface';
import {
  IPgGenericRepository,
  OtherMethodOptions,
} from 'src/core/application/ports/out/data-services/postgres/pg-generic-repository.abstract';
import { Repository, EntityManager, ObjectLiteral } from 'typeorm';
import { NotFoundException } from 'src/shared/exceptions';
export class PgGenericRepository<
  T extends ObjectLiteral,
> implements IPgGenericRepository<T> {
  protected _cls: IClsStore<AppClsStore>;
  protected _repository: Repository<T>;

  constructor(cls: IClsStore<AppClsStore>, repository: Repository<T>) {
    this._cls = cls;
    this._repository = repository;
  }

  protected getRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(this._repository.target)
      : this._repository;
  }

  async getAll(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    order?: NonNullable<unknown>,
    select?: NonNullable<unknown>,
    options?: OtherMethodOptions,
    manager?: EntityManager,
  ): Promise<T[]> {
    const repository = this.getRepository(manager);
    return repository.find({
      where: condition,
      relations: { ...relations },
      order: order ? { ...order } : ({ id: 'DESC' } as any),
      select: select,
      ...options,
    });
  }

  async getAllWithPagination(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    order?: NonNullable<unknown>,
    select?: NonNullable<unknown>,
    options?: OtherMethodOptions,
    manager?: EntityManager,
  ): Promise<IPaginationData> {
    let { page, limit } =
      this._cls.get<IPaginationOptions>('paginationOptions') || {};
    if (!page) page = 1;
    if (!limit) limit = 10;
    const repository = this.getRepository(manager);
    const [data, totalPages] = await repository.findAndCount({
      where: Array.isArray(condition) ? [...condition] : condition,
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit || 10,
      relations: { ...relations },
      order: order ? { ...order } : ({ id: 'DESC' } as any),
      select: select,
      ...options,
    });
    return {
      data: data as [],
      totalPages,
      page: page || 1,
      limit: limit || 10,
      previous: page > 1 ? `${Number(page) - 1}` : undefined,
      next: page < totalPages ? `${Number(page) + 1}` : undefined,
    };
  }

  async getOne(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    select?: NonNullable<unknown>,
    options?: OtherMethodOptions,
    manager?: EntityManager,
  ): Promise<T> {
    const repository = this.getRepository(manager);
    const item = await repository.findOne({
      where: condition,
      relations: { ...relations },
      select: select,
      ...options,
    });
    if (!item) {
      const entityName = this._repository.metadata.name;
      throw new NotFoundException(entityName);
    }
    return item;
  }

  async getOneOrNull(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    select?: NonNullable<unknown>,
    options?: OtherMethodOptions,
    manager?: EntityManager,
  ): Promise<T | null> {
    const repository = this.getRepository(manager);
    const item = await repository.findOne({
      where: condition,
      relations: { ...relations },
      select: select,
      ...options,
    });
    return item || null;
  }

  async create(item: T, manager?: EntityManager): Promise<T> {
    const repository = this.getRepository(manager);
    const newItem = repository.create(item);
    return repository.save(newItem);
  }

  async update(
    condition: NonNullable<unknown> | any[],
    item: T,
    manager?: EntityManager,
  ): Promise<T> {
    const repository = this.getRepository(manager);
    const existingItem = await this.getOne(
      condition,
      undefined,
      undefined,
      undefined,
      manager,
    );
    const updatedItem = repository.merge(existingItem, item);
    return repository.save(updatedItem);
  }

  async findOrCreate(
    condition: NonNullable<unknown> | any[],
    item: T,
    relations?: NonNullable<unknown>,
    options?: OtherMethodOptions,
    manager?: EntityManager,
  ): Promise<T> {
    const repository = this.getRepository(manager);
    const existingItem = await repository.findOne({
      where: condition,
      relations: { ...relations },
      ...options,
    });

    if (existingItem) {
      return existingItem;
    }

    const newItem = repository.create(item);
    return repository.save(newItem);
  }

  async createOrUpdate(
    condition: NonNullable<unknown> | any[],
    item: T,
    relations?: NonNullable<unknown>,
    manager?: EntityManager,
  ): Promise<T> {
    const repository = this.getRepository(manager);
    const existingItem = await repository.findOne({
      where: condition,
      relations: { ...relations },
    });

    if (existingItem) {
      const updatedItem = repository.merge(existingItem, item);
      return repository.save(updatedItem);
    }

    const newItem = repository.create(item);
    return repository.save(newItem);
  }

  async createBulk(items: T[], manager?: unknown): Promise<T[]> {
    const repository = this.getRepository(manager as EntityManager);
    return repository.save(items);
  }

  async updateBulk(
    condition: NonNullable<unknown> | any[],
    item: any,
    manager?: EntityManager,
  ): Promise<T[]> {
    const repository = this.getRepository(manager);
    const items = await this.getAll(
      condition,
      undefined,
      undefined,
      undefined,
      undefined,
      manager,
    );
    const updatedItems = items.map((existingItem) =>
      repository.merge(existingItem, item),
    );
    return repository.save(updatedItems);
  }

  async softDelete(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(manager);
    const item = await this.getOne(
      condition,
      relations,
      undefined,
      undefined,
      manager,
    );
    await repository.softRemove(item);
  }

  async hardDelete(
    condition: NonNullable<unknown> | any[],
    relations?: NonNullable<unknown>,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(manager);
    const item = await this.getOne(
      condition,
      relations,
      undefined,
      undefined,
      manager,
    );
    await repository.remove(item);
  }
}
