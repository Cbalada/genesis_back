import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  fileId: string;
  imageUrl: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private initialized = false;

  private init() {
    if (this.initialized) return;

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new BadGatewayException(
        'CLOUDINARY_URL no está configurada en las variables de entorno',
      );
    }

    // cloudinary.config() accepts the CLOUDINARY_URL directly via env var,
    // but we can also set it explicitly to be safe.
    const match = cloudinaryUrl.match(
      /cloudinary:\/\/(\d+):([^@]+)@(.+)/,
    );
    if (!match) {
      throw new BadGatewayException(
        'El formato de CLOUDINARY_URL es inválido. Debe ser cloudinary://api_key:api_secret@cloud_name',
      );
    }

    cloudinary.config({
      api_key: match[1],
      api_secret: match[2],
      cloud_name: match[3],
      secure: true,
    });

    this.initialized = true;
    this.logger.log(`Cloudinary configurado para cloud: ${match[3]}`);
  }

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    this.init();

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'genesis_property_images',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(
              `Error al subir imagen a Cloudinary: ${error.message}`,
            );
            return reject(
              new BadGatewayException(
                `Error al subir imagen a Cloudinary: ${error.message}`,
              ),
            );
          }

          if (!result) {
            return reject(
              new BadGatewayException(
                'Cloudinary no retornó un resultado válido',
              ),
            );
          }

          resolve({
            fileId: result.public_id,
            imageUrl: result.secure_url,
          });
        },
      );

      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!publicId) return;

    try {
      this.init();
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      this.logger.error(
        `Error al eliminar imagen de Cloudinary (${publicId}): ${error.message}`,
      );
    }
  }
}
