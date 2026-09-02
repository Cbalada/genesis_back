import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly repository: Repository<Favorite>,
  ) {}

  async add(userId: string, propertyId: string): Promise<Favorite> {
    const favorite = this.repository.create({ userId, propertyId });
    return this.repository.save(favorite);
  }

  async remove(userId: string, propertyId: string): Promise<void> {
    await this.repository.delete({ userId, propertyId });
  }

  async findByUserAndProperty(
    userId: string,
    propertyId: string,
  ): Promise<Favorite | null> {
    return this.repository.findOne({ where: { userId, propertyId } });
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Favorite[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      relations: ['property', 'property.images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
