import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../common/enums';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class AdminQueryDto extends PaginationQueryDto {}

export class AdminStatsResponseDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalProperties!: number;

  @ApiProperty()
  totalBookings!: number;

  @ApiProperty()
  totalReviews!: number;

  @ApiProperty()
  activeBookings!: number;

  @ApiProperty()
  completedBookings!: number;

  @ApiProperty()
  canceledBookings!: number;
}
