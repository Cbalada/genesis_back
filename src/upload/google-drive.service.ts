import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

export interface DriveUploadResult {
  fileId: string;
  imageUrl: string;
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private driveClient: drive_v3.Drive | null = null;
  private folderId: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getDriveClient(): { drive: drive_v3.Drive; folderId: string } {
    if (this.driveClient && this.folderId) {
      return { drive: this.driveClient, folderId: this.folderId };
    }

    const folderId =
      this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID') ||
      '1ZoYqYHMfM_RTH2-t9k1cv3iocxMti3UG';

    let clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY');
    const keyFilePath = this.configService.get<string>('GOOGLE_DRIVE_KEY_FILE');

    const defaultJsonPath = path.resolve(
      process.cwd(),
      'lithe-transport-452223-n4-bedc94ebf0a5.json',
    );
    const targetJsonPath =
      keyFilePath || (fs.existsSync(defaultJsonPath) ? defaultJsonPath : null);

    let auth: any;

    if (targetJsonPath && fs.existsSync(targetJsonPath)) {
      this.logger.log(
        `Cargando credenciales de Google Service Account desde: ${targetJsonPath}`,
      );
      auth = new google.auth.GoogleAuth({
        keyFile: targetJsonPath,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
    } else if (clientEmail && privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
    } else {
      this.logger.error(
        'Google Drive environment variables or JSON key file are missing',
      );
      throw new BadGatewayException(
        'Configuración de Google Drive incompleta en las variables de entorno',
      );
    }

    this.driveClient = google.drive({ version: 'v3', auth });
    this.folderId = folderId;

    return { drive: this.driveClient, folderId: this.folderId };
  }

  async uploadFile(file: Express.Multer.File): Promise<DriveUploadResult> {
    try {
      const { drive, folderId } = this.getDriveClient();

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await drive.files.create({
        requestBody: {
          name: `${Date.now()}_${file.originalname}`,
          parents: [folderId],
        },
        media,
        fields: 'id',
        supportsAllDrives: true,
      } as any);

      const fileId = response.data.id;
      if (!fileId) {
        throw new Error('No se obtuvo un ID de archivo desde Google Drive API');
      }

      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      return { fileId, imageUrl };
    } catch (error: any) {
      this.logger.error(
        `Failed to upload file to Google Drive: ${error.message}. Falling back to local storage.`,
      );

      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, file.buffer);

        const host = process.env.APP_URL || 'http://localhost:3000';
        const imageUrl = `${host}/uploads/${filename}`;
        return { fileId: filename, imageUrl };
      } catch (localErr: any) {
        throw new BadGatewayException(
          `Error al guardar la imagen: ${error.message || localErr.message}`,
        );
      }
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!fileId) return;

    // Check if it's a local file first
    const localFilePath = path.join(process.cwd(), 'uploads', fileId);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        return;
      } catch (err: any) {
        this.logger.error(`Error deleting local file ${fileId}: ${err.message}`);
      }
    }

    try {
      const { drive } = this.getDriveClient();
      await drive.files.delete({ fileId });
    } catch (error: any) {
      this.logger.error(
        `Failed to delete file ${fileId} from Google Drive: ${error.message}`,
      );
    }
  }
}
