import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../app.module';
import { UsersRepository } from '../../users/repositories/users.repository';
import { PropertiesRepository } from '../../properties/repositories/properties.repository';
import { BookingsRepository } from '../../bookings/repositories/bookings.repository';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';
import { FavoritesRepository } from '../../favorites/repositories/favorites.repository';
import {
  UserRole,
  PropertyType,
  PropertyStatus,
  BookingStatus,
} from '../../common/enums';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Seed cannot run in production');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const usersRepo = app.get(UsersRepository);
  const propertiesRepo = app.get(PropertiesRepository);
  const bookingsRepo = app.get(BookingsRepository);
  const reviewsRepo = app.get(ReviewsRepository);
  const favoritesRepo = app.get(FavoritesRepository);

  const password = await bcrypt.hash('Password123!', 12);

  const admin = await usersRepo.save(
    usersRepo.create({
      name: 'Admin User',
      email: 'admin@genesis.com',
      password,
      role: UserRole.ADMIN,
    }),
  );

  const host = await usersRepo.save(
    usersRepo.create({
      name: 'María Host',
      email: 'host@genesis.com',
      password,
      role: UserRole.HOST,
    }),
  );

  const guest = await usersRepo.save(
    usersRepo.create({
      name: 'Juan Guest',
      email: 'guest@genesis.com',
      password,
      role: UserRole.GUEST,
    }),
  );

  const guest2 = await usersRepo.save(
    usersRepo.create({
      name: 'Ana Traveler',
      email: 'ana@genesis.com',
      password,
      role: UserRole.GUEST,
    }),
  );

  const property1 = await propertiesRepo.save(
    propertiesRepo.create({
      hostId: host.id,
      title: 'Departamento céntrico en Palermo',
      description:
        'Hermoso departamento de 2 ambientes en el corazón de Palermo. Ideal para parejas o familias pequeñas.',
      propertyType: PropertyType.APARTMENT,
      city: 'Buenos Aires',
      country: 'Argentina',
      address: 'Av. Santa Fe 1234, Palermo',
      latitude: -34.5875,
      longitude: -58.4204,
      pricePerNight: 100,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      status: PropertyStatus.ACTIVE,
    }),
  );

  const property2 = await propertiesRepo.save(
    propertiesRepo.create({
      hostId: host.id,
      title: 'Casa con pileta en Mendoza',
      description:
        'Amplia casa con pileta y vista a la montaña. Perfecta para vacaciones en familia.',
      propertyType: PropertyType.HOUSE,
      city: 'Mendoza',
      country: 'Argentina',
      address: 'Calle Las Heras 567',
      latitude: -32.8908,
      longitude: -68.8272,
      pricePerNight: 150,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      status: PropertyStatus.ACTIVE,
    }),
  );

  const property3 = await propertiesRepo.save(
    propertiesRepo.create({
      hostId: host.id,
      title: 'Habitación privada en Córdoba',
      description: 'Habitación cómoda en casa compartida, cerca del centro.',
      propertyType: PropertyType.ROOM,
      city: 'Córdoba',
      country: 'Argentina',
      address: 'Bv. San Juan 890',
      latitude: -31.4201,
      longitude: -64.1888,
      pricePerNight: 45,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      status: PropertyStatus.ACTIVE,
    }),
  );

  await propertiesRepo.addImage({
    propertyId: property1.id,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    isCover: true,
  });
  await propertiesRepo.addImage({
    propertyId: property1.id,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
    isCover: false,
  });
  await propertiesRepo.addImage({
    propertyId: property2.id,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
    isCover: true,
  });
  await propertiesRepo.addImage({
    propertyId: property3.id,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
    isCover: true,
  });

  const completedBooking = await bookingsRepo.save(
    bookingsRepo.create({
      propertyId: property1.id,
      guestId: guest.id,
      checkIn: '2025-06-01',
      checkOut: '2025-06-06',
      guests: 2,
      totalPrice: 500,
      status: BookingStatus.COMPLETED,
    }),
  );

  await bookingsRepo.save(
    bookingsRepo.create({
      propertyId: property2.id,
      guestId: guest.id,
      checkIn: '2026-10-01',
      checkOut: '2026-10-05',
      guests: 3,
      totalPrice: 600,
      status: BookingStatus.CONFIRMED,
    }),
  );

  await reviewsRepo.save(
    reviewsRepo.create({
      propertyId: property1.id,
      userId: guest.id,
      bookingId: completedBooking.id,
      rating: 5,
      comment: 'Excelente estadía, muy recomendable. El departamento estaba impecable.',
    }),
  );

  await favoritesRepo.add(guest.id, property2.id);
  await favoritesRepo.add(guest2.id, property1.id);

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Test users (password for all: Password123!):');
  console.log('  Admin: admin@genesis.com');
  console.log('  Host:  host@genesis.com');
  console.log('  Guest: guest@genesis.com');
  console.log('  Guest: ana@genesis.com');

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
