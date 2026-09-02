import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  @ApiOperation({ summary: 'Add property to favorites' })
  add(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @CurrentUser() user: User,
  ) {
    return this.favoritesService.add(propertyId, user);
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'Remove property from favorites' })
  remove(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @CurrentUser() user: User,
  ) {
    return this.favoritesService.remove(propertyId, user);
  }

  @Get()
  @ApiOperation({ summary: 'List user favorites' })
  findAll(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.favoritesService.findAll(user, query);
  }
}
