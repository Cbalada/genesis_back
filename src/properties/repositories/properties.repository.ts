import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Property } from '../entities/property.entity';
import { PropertyImage } from '../entities/property-image.entity';
import { PropertyQueryDto } from '../dto/property.dto';
import { PropertyStatus, BookingStatus } from '../../common/enums';

@Injectable()
export class PropertiesRepository {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PropertyImage)
    private readonly imageRepo: Repository<PropertyImage>,
  ) {}

  create(data: Partial<Property>): Property {
    return this.propertyRepo.create(data);
  }

  async save(property: Property): Promise<Property> {
    return this.propertyRepo.save(property);
  }

  async findById(id: string): Promise<Property | null> {
    return this.propertyRepo.findOne({
      where: { id },
      relations: ['images', 'host'],
    });
  }

  async findByIdForUpdate(
    id: string,
    manager?: Repository<Property>['manager'],
  ): Promise<Property | null> {
    const repo = manager
      ? manager.getRepository(Property)
      : this.propertyRepo;
    return repo
      .createQueryBuilder('property')
      .setLock('pessimistic_write')
      .where('property.id = :id', { id })
      .getOne();
  }

  async findWithFilters(
    query: PropertyQueryDto,
  ): Promise<[Property[], number]> {
    const qb = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.images', 'images')
      .leftJoinAndSelect('property.host', 'host')
      .where('property.status = :status', { status: PropertyStatus.ACTIVE });

    this.applyFilters(qb, query);

    const sortBy = this.resolveSortField(query.sortBy ?? 'createdAt');
    const order = query.order ?? 'DESC';
    qb.orderBy(`property.${sortBy}`, order);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getManyAndCount();
  }

  async softDelete(id: string): Promise<void> {
    await this.propertyRepo.update(id, { status: PropertyStatus.INACTIVE });
  }

  async addImage(data: Partial<PropertyImage>): Promise<PropertyImage> {
    const image = this.imageRepo.create(data);
    return this.imageRepo.save(image);
  }

  async findImageById(id: string): Promise<PropertyImage | null> {
    return this.imageRepo.findOne({ where: { id }, relations: ['property'] });
  }

  async removeImage(id: string): Promise<void> {
    await this.imageRepo.delete(id);
  }

  async clearCoverImages(propertyId: string): Promise<void> {
    await this.imageRepo.update({ propertyId }, { isCover: false });
  }

  async setCoverImage(imageId: string, propertyId: string): Promise<void> {
    await this.imageRepo.manager.transaction(async (manager) => {
      await manager.update(PropertyImage, { propertyId }, { isCover: false });
      await manager.update(PropertyImage, { id: imageId }, { isCover: true });
    });
  }

  async count(): Promise<number> {
    return this.propertyRepo.count();
  }

  private applyFilters(
    qb: SelectQueryBuilder<Property>,
    query: PropertyQueryDto,
  ): void {
    if (query.city) {
      qb.andWhere('LOWER(property.city) LIKE LOWER(:city)', {
        city: `%${query.city}%`,
      });
    }
    if (query.country) {
      qb.andWhere('LOWER(property.country) LIKE LOWER(:country)', {
        country: `%${query.country}%`,
      });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('property.pricePerNight >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('property.pricePerNight <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }
    if (query.guests) {
      qb.andWhere('property.maxGuests >= :guests', { guests: query.guests });
    }
    if (query.bedrooms !== undefined) {
      qb.andWhere('property.bedrooms >= :bedrooms', {
        bedrooms: query.bedrooms,
      });
    }
    if (query.bathrooms !== undefined) {
      qb.andWhere('property.bathrooms >= :bathrooms', {
        bathrooms: query.bathrooms,
      });
    }
    if (query.propertyType) {
      qb.andWhere('property.propertyType = :propertyType', {
        propertyType: query.propertyType,
      });
    }
    if (query.checkIn && query.checkOut) {
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.property_id = property.id
          AND b.status IN (:...activeStatuses)
          AND b.check_in < :checkOut
          AND b.check_out > :checkIn
        )`,
        {
          activeStatuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          checkIn: query.checkIn,
          checkOut: query.checkOut,
        },
      );
    }
  }

  private resolveSortField(sortBy: string): string {
    const allowed = ['pricePerNight', 'createdAt', 'title', 'city'];
    return allowed.includes(sortBy) ? sortBy : 'createdAt';
  }
}
