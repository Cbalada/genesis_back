import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BookingsModule),
    forwardRef(() => FavoritesModule),
  ],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
