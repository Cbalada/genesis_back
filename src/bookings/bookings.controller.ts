import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, BookingQueryDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 409, description: 'Date conflict' })
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings (guest, host or admin view)' })
  findAll(@Query() query: BookingQueryDto, @CurrentUser() user: User) {
    return this.bookingsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 422, description: 'Cannot cancel within 24h of check-in' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.bookingsService.cancel(id, user);
  }
}
