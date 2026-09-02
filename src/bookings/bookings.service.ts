import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookingsRepository } from './repositories/bookings.repository';
import { CreateBookingDto, BookingQueryDto } from './dto/booking.dto';
import { User } from '../users/entities/user.entity';
import { BookingStatus, PropertyStatus, UserRole } from '../common/enums';
import {
  calculateNights,
  getTodayDateOnly,
  parseCheckInDateTime,
  addHoursToDate,
} from '../common/utils/date.util';
import { buildPaginatedResult, PaginatedResult } from '../common/utils/pagination.util';
import { Booking } from './entities/booking.entity';
import { Property } from '../properties/entities/property.entity';
import { PropertiesRepository } from '../properties/repositories/properties.repository';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly propertiesRepository: PropertiesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBookingDto, user: User): Promise<Booking> {
    this.validateDates(dto.checkIn, dto.checkOut);

    return this.dataSource.transaction(async (manager) => {
      const property = await manager
        .getRepository(Property)
        .createQueryBuilder('property')
        .setLock('pessimistic_write')
        .where('property.id = :id', { id: dto.propertyId })
        .getOne();

      if (!property || property.status !== PropertyStatus.ACTIVE) {
        throw new NotFoundException('Property not found');
      }

      if (property.hostId === user.id && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You cannot book your own property');
      }

      if (dto.guests > property.maxGuests) {
        throw new BadRequestException(
          `Maximum guests allowed: ${property.maxGuests}`,
        );
      }

      const overlapping =
        await this.bookingsRepository.findOverlappingBookings(
          dto.propertyId,
          dto.checkIn,
          dto.checkOut,
          manager,
        );

      if (overlapping.length > 0) {
        throw new ConflictException(
          'Property is not available for the selected dates',
        );
      }

      const nights = calculateNights(dto.checkIn, dto.checkOut);
      const totalPrice = Number(property.pricePerNight) * nights;

      const booking = this.bookingsRepository.create({
        propertyId: dto.propertyId,
        guestId: user.id,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guests: dto.guests,
        totalPrice,
        status: BookingStatus.CONFIRMED,
      });

      return this.bookingsRepository.save(booking, manager);
    });
  }

  async findAll(
    query: BookingQueryDto,
    user: User,
  ): Promise<PaginatedResult<Booking>> {
    await this.bookingsRepository.completePastBookings();

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    let result: [Booking[], number];

    if (user.role === UserRole.ADMIN) {
      result = await this.bookingsRepository.findAllAdmin(page, limit);
    } else if (user.role === UserRole.HOST) {
      result = await this.bookingsRepository.findAllForHostProperties(
        user.id,
        page,
        limit,
      );
    } else {
      result = await this.bookingsRepository.findAllForUser(
        user.id,
        page,
        limit,
      );
    }

    const [data, total] = result;
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, user: User): Promise<Booking> {
    await this.bookingsRepository.completePastBookings();

    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    this.ensureCanViewBooking(booking, user);
    return booking;
  }

  async cancel(id: string, user: User): Promise<Booking> {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== UserRole.ADMIN) {
      if (booking.guestId !== user.id) {
        throw new ForbiddenException('You can only cancel your own bookings');
      }
    }

    if (booking.status === BookingStatus.CANCELED) {
      throw new BadRequestException('Booking is already canceled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    if (user.role !== UserRole.ADMIN) {
      const checkInDate = parseCheckInDateTime(booking.checkIn);
      const cutoff = addHoursToDate(checkInDate, -24);
      if (new Date() > cutoff) {
        throw new UnprocessableEntityException(
          'Cannot cancel within 24 hours of check-in',
        );
      }
    }

    await this.bookingsRepository.updateStatus(id, BookingStatus.CANCELED);
    booking.status = BookingStatus.CANCELED;
    return booking;
  }

  private validateDates(checkIn: string, checkOut: string): void {
    const today = getTodayDateOnly();

    if (checkIn >= checkOut) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    if (checkIn < today) {
      throw new BadRequestException('checkIn cannot be in the past');
    }
  }

  private ensureCanViewBooking(booking: Booking, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (booking.guestId === user.id) {
      return;
    }
    if (
      user.role === UserRole.HOST &&
      booking.property?.hostId === user.id
    ) {
      return;
    }
    throw new ForbiddenException('You do not have access to this booking');
  }
}
