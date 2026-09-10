import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CloudinaryService } from '../upload/cloudinary.service';
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
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @ApiOperation({ summary: 'Create new property (HOST or ADMIN)' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
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
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File | undefined,
    @Body('isCover') isCoverParam: any,
    @Body('imageUrl') bodyImageUrl: string | undefined,
    @CurrentUser() user: User,
  ) {
    const isCover =
      typeof isCoverParam === 'string'
        ? isCoverParam.toLowerCase() === 'true'
        : Boolean(isCoverParam);

    let imageUrl = bodyImageUrl;
    let driveFileId: string | undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      imageUrl = uploadResult.imageUrl;
      driveFileId = uploadResult.fileId;
    }

    if (!imageUrl) {
      throw new BadRequestException(
        'Debe adjuntar un archivo de imagen ("file") o proporcionar una URL ("imageUrl").',
      );
    }

    return this.propertiesService.addImage(
      id,
      { imageUrl, driveFileId, isCover },
      user,
    );
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
