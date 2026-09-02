import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertiesRepository } from './repositories/properties.repository';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyImage])],
  controllers: [PropertiesController],
  providers: [PropertiesRepository, PropertiesService],
  exports: [PropertiesRepository, PropertiesService],
})
export class PropertiesModule {}
