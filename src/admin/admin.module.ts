import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [UsersModule, PropertiesModule, BookingsModule, ReviewsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
