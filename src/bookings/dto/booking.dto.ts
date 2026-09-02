import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  propertyId!: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  checkIn!: string;

  @ApiProperty({ example: '2026-09-15' })
  @IsDateString()
  checkOut!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  guests!: number;
}

export class BookingQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
