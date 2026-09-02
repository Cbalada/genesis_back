import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { BookingStatus } from '../../common/enums';
import { datesOverlap } from '../../common/utils/date.util';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  create(data: Partial<Booking>): Booking {
    return this.repository.create(data);
  }

  async save(booking: Booking, manager?: EntityManager): Promise<Booking> {
    const repo = manager ? manager.getRepository(Booking) : this.repository;
    return repo.save(booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['property', 'property.host', 'guest'],
    });
  }

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Booking[], number]> {
    return this.repository.findAndCount({
      where: { guestId: userId },
      relations: ['property', 'property.images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findAllForHostProperties(
    hostId: string,
    page: number,
    limit: number,
  ): Promise<[Booking[], number]> {
    return this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.property', 'property')
      .leftJoinAndSelect('booking.guest', 'guest')
      .where('property.hostId = :hostId', { hostId })
      .orderBy('booking.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async findAllAdmin(page: number, limit: number): Promise<[Booking[], number]> {
    return this.repository.findAndCount({
      relations: ['property', 'guest'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async hasOverlappingBooking(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager ? manager.getRepository(Booking) : this.repository;
    const activeBookings = await repo.find({
      where: {
        propertyId,
        status: BookingStatus.CONFIRMED,
      },
    });

    const pendingBookings = await repo.find({
      where: {
        propertyId,
        status: BookingStatus.PENDING,
      },
    });

    const allActive = [...activeBookings, ...pendingBookings];

    return allActive.some((booking) =>
      datesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut),
    );
  }

  async findOverlappingBookings(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    manager: EntityManager,
  ): Promise<Booking[]> {
    return manager
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .where('booking.property_id = :propertyId', { propertyId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .andWhere('booking.check_in < :checkOut', { checkOut })
      .andWhere('booking.check_out > :checkIn', { checkIn })
      .setLock('pessimistic_write')
      .getMany();
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async completePastBookings(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.repository
      .createQueryBuilder()
      .update(Booking)
      .set({ status: BookingStatus.COMPLETED })
      .where('status = :status', { status: BookingStatus.CONFIRMED })
      .andWhere('check_out <= :today', { today })
      .execute();
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }
}
