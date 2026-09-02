import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyImage } from '../properties/entities/property-image.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { getDatabaseSsl } from '../config/database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('database.url'),
        ssl: getDatabaseSsl(configService.get<string>('database.url')),
        entities: [User, Property, PropertyImage, Booking, Review, Favorite],
        synchronize: false,
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
