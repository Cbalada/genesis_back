import {
  Body,
  Controller,
  Delete,
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
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyQueryDto,
  AddPropertyImageDto,
} from './dto/property.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter properties' })
  findAll(@Query() query: PropertyQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property (HOST/ADMIN)' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property (owner or ADMIN)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate property (owner or ADMIN)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.propertiesService.remove(id, user);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add image to property' })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPropertyImageDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.addImage(id, dto, user);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from property' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.removeImage(id, imageId, user);
  }

  @Patch(':id/images/:imageId/cover')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set image as cover' })
  setCover(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.setCoverImage(id, imageId, user);
  }
}
