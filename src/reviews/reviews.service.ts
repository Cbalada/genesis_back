import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsRepository } from './repositories/reviews.repository';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { User } from '../users/entities/user.entity';
import { BookingStatus, UserRole } from '../common/enums';
import { BookingsRepository } from '../bookings/repositories/bookings.repository';
import { Review } from './entities/review.entity';
import { buildPaginatedResult, PaginatedResult } from '../common/utils/pagination.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly bookingsRepository: BookingsRepository,
  ) {}

  async create(dto: CreateReviewDto, user: User): Promise<Review> {
    const booking = await this.bookingsRepository.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== user.id) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.propertyId !== dto.propertyId) {
      throw new BadRequestException('Booking does not belong to this property');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can only review completed bookings',
      );
    }

    const existing = await this.reviewsRepository.findByBookingId(dto.bookingId);
    if (existing) {
      throw new ConflictException('A review already exists for this booking');
    }

    const review = this.reviewsRepository.create({
      propertyId: dto.propertyId,
      userId: user.id,
      bookingId: dto.bookingId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    return this.reviewsRepository.save(review);
  }

  async findByProperty(
    propertyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Review>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.reviewsRepository.findByProperty(
      propertyId,
      page,
      limit,
    );
    return buildPaginatedResult(data, total, page, limit);
  }

  async update(id: string, dto: UpdateReviewDto, user: User): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot modify this review');
    }

    Object.assign(review, dto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string, user: User): Promise<void> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot delete this review');
    }

    await this.reviewsRepository.remove(id);
  }
}
