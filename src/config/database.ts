const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
] as const;

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  return DATABASE_URL_KEYS.map((key) => env[key]).find(Boolean);
}

export function getDatabaseSsl(databaseUrl?: string) {
  if (!databaseUrl) {
    return false;
  }

  const sslMode = new URL(databaseUrl).searchParams.get('sslmode');

  if (sslMode === 'disable') {
    return false;
  }

  return { rejectUnauthorized: false };
}
