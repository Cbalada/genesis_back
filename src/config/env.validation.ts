import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  DATABASE_URL_UNPOOLED?: string;

  @IsOptional()
  @IsString()
  POSTGRES_URL?: string;

  @IsOptional()
  @IsString()
  POSTGRES_URL_NON_POOLING?: string;

  @IsOptional()
  @IsString()
  POSTGRES_PRISMA_URL?: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (
    !validatedConfig.DATABASE_URL &&
    !validatedConfig.POSTGRES_URL &&
    !validatedConfig.POSTGRES_PRISMA_URL &&
    !validatedConfig.DATABASE_URL_UNPOOLED &&
    !validatedConfig.POSTGRES_URL_NON_POOLING
  ) {
    throw new Error(
      'Missing database connection string. Set DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL.',
    );
  }

  if (validatedConfig.NODE_ENV === Environment.Production && !validatedConfig.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET. Set JWT_SECRET in production.');
  }

  return validatedConfig;
}
