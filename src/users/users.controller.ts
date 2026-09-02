import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserResponseDto } from '../common/dto/user-response.dto';
import { BookingsService } from '../bookings/bookings.service';
import { FavoritesService } from '../favorites/favorites.service';
import { BookingQueryDto } from '../bookings/dto/booking.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/bookings')
  @ApiOperation({ summary: 'Get current user bookings' })
  getMyBookings(@CurrentUser() user: User, @Query() query: BookingQueryDto) {
    return this.bookingsService.findAll(query, user);
  }

  @Get('me/favorites')
  @ApiOperation({ summary: 'Get current user favorites' })
  getMyFavorites(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ) {
    return this.favoritesService.findAll(user, query);
  }
}
