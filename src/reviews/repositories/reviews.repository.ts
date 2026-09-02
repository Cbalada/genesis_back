import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repository: Repository<Review>,
  ) {}

  create(data: Partial<Review>): Review {
    return this.repository.create(data);
  }

  async save(review: Review): Promise<Review> {
    return this.repository.save(review);
  }

  async findById(id: string): Promise<Review | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'property', 'booking'],
    });
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    return this.repository.findOne({ where: { bookingId } });
  }

  async findByProperty(
    propertyId: string,
    page: number,
    limit: number,
  ): Promise<[Review[], number]> {
    return this.repository.findAndCount({
      where: { propertyId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findAll(page: number, limit: number): Promise<[Review[], number]> {
    return this.repository.findAndCount({
      relations: ['user', 'property'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
