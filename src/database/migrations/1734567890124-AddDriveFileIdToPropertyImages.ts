import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDriveFileIdToPropertyImages1734567890124
  implements MigrationInterface
{
  name = 'AddDriveFileIdToPropertyImages1734567890124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_images"
      ADD COLUMN IF NOT EXISTS "drive_file_id" character varying(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "property_images"
      DROP COLUMN IF EXISTS "drive_file_id";
    `);
  }
}
