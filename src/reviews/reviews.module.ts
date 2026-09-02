import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), BookingsModule],
  controllers: [ReviewsController],
  providers: [ReviewsRepository, ReviewsService],
  exports: [ReviewsRepository, ReviewsService],
})
export class ReviewsModule {}
