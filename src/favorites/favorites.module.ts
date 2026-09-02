import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoritesRepository } from './repositories/favorites.repository';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), PropertiesModule],
  controllers: [FavoritesController],
  providers: [FavoritesRepository, FavoritesService],
  exports: [FavoritesRepository, FavoritesService],
})
export class FavoritesModule {}
