import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto, AdminStatsResponseDto } from './dto/admin.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  getStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  listUsers(@Query() query: PaginationQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('properties')
  @ApiOperation({ summary: 'List all properties' })
  listProperties(@Query() query: PaginationQueryDto) {
    return this.adminService.listProperties(query);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  listBookings(@Query() query: PaginationQueryDto) {
    return this.adminService.listBookings(query);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  listReviews(@Query() query: PaginationQueryDto) {
    return this.adminService.listReviews(query);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Moderate (delete) a review' })
  deleteReview(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteReview(id);
  }
}
