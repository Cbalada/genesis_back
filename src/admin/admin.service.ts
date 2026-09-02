import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { PropertiesRepository } from '../properties/repositories/properties.repository';
import { BookingsRepository } from '../bookings/repositories/bookings.repository';
import { ReviewsRepository } from '../reviews/repositories/reviews.repository';
import { UpdateUserRoleDto, AdminStatsResponseDto } from './dto/admin.dto';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { BookingStatus } from '../common/enums';
import { buildPaginatedResult, PaginatedResult } from '../common/utils/pagination.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly propertiesRepository: PropertiesRepository,
    private readonly bookingsRepository: BookingsRepository,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async getStats(): Promise<AdminStatsResponseDto> {
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalReviews,
      activeBookings,
      completedBookings,
      canceledBookings,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.propertiesRepository.count(),
      this.bookingsRepository.count(),
      this.reviewsRepository.count(),
      this.bookingsRepository.countByStatus(BookingStatus.CONFIRMED),
      this.bookingsRepository.countByStatus(BookingStatus.COMPLETED),
      this.bookingsRepository.countByStatus(BookingStatus.CANCELED),
    ]);

    return {
      totalUsers,
      totalProperties,
      totalBookings,
      totalReviews,
      activeBookings,
      completedBookings,
      canceledBookings,
    };
  }

  async listUsers(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.usersRepository.findAll(page, limit);
    return buildPaginatedResult(data, total, page, limit);
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.usersRepository.update(userId, { role: dto.role });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.remove(userId);
  }

  async listProperties(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Property>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.propertiesRepository.findWithFilters({
      page,
      limit,
    });
    return buildPaginatedResult(data, total, page, limit);
  }

  async listBookings(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Booking>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.bookingsRepository.findAllAdmin(
      page,
      limit,
    );
    return buildPaginatedResult(data, total, page, limit);
  }

  async listReviews(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Review>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.reviewsRepository.findAll(page, limit);
    return buildPaginatedResult(data, total, page, limit);
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.reviewsRepository.remove(reviewId);
  }
}
