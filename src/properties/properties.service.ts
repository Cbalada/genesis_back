import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PropertiesRepository } from './repositories/properties.repository';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryDto,
  AddPropertyImageDto,
} from './dto/property.dto';
import { User } from '../users/entities/user.entity';
import { UserRole, PropertyStatus } from '../common/enums';
import { buildPaginatedResult, PaginatedResult } from '../common/utils/pagination.util';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';

@Injectable()
export class PropertiesService {
  constructor(private readonly propertiesRepository: PropertiesRepository) {}

  async create(dto: CreatePropertyDto, user: User): Promise<Property> {
    this.ensureHostOrAdmin(user);
    const property = this.propertiesRepository.create({
      ...dto,
      hostId: user.id,
      status: PropertyStatus.ACTIVE,
    });
    return this.propertiesRepository.save(property);
  }

  async findAll(query: PropertyQueryDto): Promise<PaginatedResult<Property>> {
    if (query.checkIn && query.checkOut && query.checkIn >= query.checkOut) {
      throw new BadRequestException('checkOut must be after checkIn');
    }

    const [data, total] =
      await this.propertiesRepository.findWithFilters(query);
    return buildPaginatedResult(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findById(id);
    if (!property || property.status === PropertyStatus.INACTIVE) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, user: User): Promise<Property> {
    const property = await this.findOne(id);
    this.ensureCanManageProperty(property, user);

    Object.assign(property, dto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: string, user: User): Promise<void> {
    const property = await this.findOne(id);
    this.ensureCanManageProperty(property, user);
    await this.propertiesRepository.softDelete(id);
  }

  async addImage(
    propertyId: string,
    dto: AddPropertyImageDto,
    user: User,
  ): Promise<PropertyImage> {
    const property = await this.findOne(propertyId);
    this.ensureCanManageProperty(property, user);

    if (dto.isCover) {
      await this.propertiesRepository.clearCoverImages(propertyId);
    }

    const existingImages = property.images ?? [];
    const isFirstImage = existingImages.length === 0;

    return this.propertiesRepository.addImage({
      propertyId,
      imageUrl: dto.imageUrl,
      isCover: dto.isCover ?? isFirstImage,
    });
  }

  async removeImage(
    propertyId: string,
    imageId: string,
    user: User,
  ): Promise<void> {
    const property = await this.findOne(propertyId);
    this.ensureCanManageProperty(property, user);

    const image = await this.propertiesRepository.findImageById(imageId);
    if (!image || image.propertyId !== propertyId) {
      throw new NotFoundException('Image not found');
    }

    await this.propertiesRepository.removeImage(imageId);
  }

  async setCoverImage(
    propertyId: string,
    imageId: string,
    user: User,
  ): Promise<void> {
    const property = await this.findOne(propertyId);
    this.ensureCanManageProperty(property, user);

    const image = await this.propertiesRepository.findImageById(imageId);
    if (!image || image.propertyId !== propertyId) {
      throw new NotFoundException('Image not found');
    }

    await this.propertiesRepository.setCoverImage(imageId, propertyId);
  }

  ensureCanManageProperty(property: Property, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (user.role !== UserRole.HOST || property.hostId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to manage this property',
      );
    }
  }

  ensureHostOrAdmin(user: User): void {
    if (user.role !== UserRole.HOST && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only HOST or ADMIN can create properties');
    }
  }
}
