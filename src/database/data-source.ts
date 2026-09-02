import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertyImage } from '../properties/entities/property-image.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Review } from '../reviews/entities/review.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { getDatabaseSsl, getDatabaseUrl } from '../config/database';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: getDatabaseUrl(),
  ssl: getDatabaseSsl(getDatabaseUrl()),
  entities: [User, Property, PropertyImage, Booking, Review, Favorite],
  migrations: ['dist/database/migrations/*.js', 'src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
