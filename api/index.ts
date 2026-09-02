import express from 'express';
import { createApp } from '../src/main';

let cachedServer: express.Express;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const expressApp = express();
    await createApp(expressApp);
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  const server = await bootstrapServer();
  server(req, res);
}
