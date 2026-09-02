import { getDatabaseUrl } from './database';

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: getDatabaseUrl(),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'local-development-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
  },
  nodeEnv: process.env.NODE_ENV ?? 'development',
});
