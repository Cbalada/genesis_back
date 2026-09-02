import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FavoritesRepository } from './repositories/favorites.repository';
import { User } from '../users/entities/user.entity';
import { PropertiesRepository } from '../properties/repositories/properties.repository';
import { Favorite } from './entities/favorite.entity';
import { buildPaginatedResult, PaginatedResult } from '../common/utils/pagination.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async add(propertyId: string, user: User): Promise<Favorite> {
    const property = await this.propertiesRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const existing = await this.favoritesRepository.findByUserAndProperty(
      user.id,
      propertyId,
    );
    if (existing) {
      throw new ConflictException('Property already in favorites');
    }

    return this.favoritesRepository.add(user.id, propertyId);
  }

  async remove(propertyId: string, user: User): Promise<void> {
    const existing = await this.favoritesRepository.findByUserAndProperty(
      user.id,
      propertyId,
    );
    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }
    await this.favoritesRepository.remove(user.id, propertyId);
  }

  async findAll(
    user: User,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Favorite>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.favoritesRepository.findByUser(
      user.id,
      page,
      limit,
    );
    return buildPaginatedResult(data, total, page, limit);
  }
}
