import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1734567890123 implements MigrationInterface {
  name = 'InitialSchema1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('GUEST', 'HOST', 'ADMIN');
      CREATE TYPE "property_status_enum" AS ENUM ('ACTIVE', 'INACTIVE');
      CREATE TYPE "property_type_enum" AS ENUM ('APARTMENT', 'HOUSE', 'ROOM', 'HOTEL', 'OTHER');
      CREATE TYPE "booking_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'GUEST',
        "avatar_url" character varying(500),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      );
      CREATE INDEX "IDX_users_email" ON "users" ("email");
    `);

    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "host_id" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text NOT NULL,
        "property_type" "property_type_enum" NOT NULL,
        "city" character varying(100) NOT NULL,
        "country" character varying(100) NOT NULL,
        "address" character varying(300) NOT NULL,
        "latitude" decimal(10,7),
        "longitude" decimal(10,7),
        "price_per_night" decimal(10,2) NOT NULL,
        "max_guests" integer NOT NULL,
        "bedrooms" integer NOT NULL DEFAULT 0,
        "bathrooms" integer NOT NULL DEFAULT 0,
        "status" "property_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_properties" PRIMARY KEY ("id"),
        CONSTRAINT "FK_properties_host" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_properties_city" ON "properties" ("city");
      CREATE INDEX "IDX_properties_country" ON "properties" ("country");
      CREATE INDEX "IDX_properties_property_type" ON "properties" ("property_type");
      CREATE INDEX "IDX_properties_status" ON "properties" ("status");
      CREATE INDEX "IDX_properties_host_id" ON "properties" ("host_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "property_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "image_url" character varying(500) NOT NULL,
        "is_cover" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_property_images_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_property_images_property_id" ON "property_images" ("property_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "guest_id" uuid NOT NULL,
        "check_in" date NOT NULL,
        "check_out" date NOT NULL,
        "guests" integer NOT NULL,
        "total_price" decimal(10,2) NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'CONFIRMED',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bookings_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bookings_guest" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_bookings_dates" CHECK ("check_out" > "check_in")
      );
      CREATE INDEX "IDX_bookings_property_id" ON "bookings" ("property_id");
      CREATE INDEX "IDX_bookings_guest_id" ON "bookings" ("guest_id");
      CREATE INDEX "IDX_bookings_dates" ON "bookings" ("check_in", "check_out");
      CREATE INDEX "IDX_bookings_status" ON "bookings" ("status");
    `);

    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "booking_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_booking_id" UNIQUE ("booking_id"),
        CONSTRAINT "FK_reviews_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
      );
      CREATE INDEX "IDX_reviews_property_id" ON "reviews" ("property_id");
      CREATE INDEX "IDX_reviews_user_id" ON "reviews" ("user_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "property_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorites_user_property" UNIQUE ("user_id", "property_id"),
        CONSTRAINT "FK_favorites_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favorites_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      );
      CREATE INDEX "IDX_favorites_user_id" ON "favorites" ("user_id");
      CREATE INDEX "IDX_favorites_property_id" ON "favorites" ("property_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "favorites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "property_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "properties"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "property_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "property_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
