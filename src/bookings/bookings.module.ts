import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsRepository } from './repositories/bookings.repository';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), PropertiesModule],
  controllers: [BookingsController],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsRepository, BookingsService],
})
export class BookingsModule {}
