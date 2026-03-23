import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import path from 'path';
import rateLimit from 'express-rate-limit';

import mongoose from 'mongoose';

import { setupAdminJs } from './adminjs/setup';
import { connectToDatabase } from './config/db';
import { getEnv } from './config/env';
import { AppError } from './lib/app-error';
import { sendError, sendSuccess } from './lib/http';
import { authMiddleware } from './middleware/auth.middleware';
import { logger, requestLogger } from './middleware/logger.middleware';
import { adminUsersRouter } from './modules/admin-users/admin-users.routes';
import { auditRouter } from './modules/audit/audit.routes';
import { authRouter } from './modules/auth/auth.routes';
import { sellerRouter } from './modules/sellers/seller.routes';

const initializeSentry = (): void => {
  const { SENTRY_DSN, NODE_ENV } = getEnv();

  if (!SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
  });
};

let processHandlersRegistered = false;

const registerProcessHandlers = (): void => {
  if (processHandlersRegistered) {
    return;
  }

  processHandlersRegistered = true;

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    Sentry.captureException(error);
    logger.error('Unhandled promise rejection', {
      error: error.message,
      stack: error.stack,
    });
  });

  process.on('uncaughtException', (error) => {
    Sentry.captureException(error);
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });
  });
};

export const createApp = async (): Promise<express.Express> => {
  initializeSentry();
  registerProcessHandlers();

  const app = express();
  const env = getEnv();
  const protectedApiRouter = Router();
  const { adminRouter, rootPath } = await setupAdminJs();
  const adminLoginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, 'Too many admin login attempts', 429);
    },
  });

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(express.static(path.resolve(__dirname, '../public')));

  app.use('/api/auth', authRouter);
  app.get('/api/health', (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'ok',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  protectedApiRouter.use('/sellers', sellerRouter);
  protectedApiRouter.use('/audit', auditRouter);
  protectedApiRouter.use('/admin-users', adminUsersRouter);

  app.use('/api', authMiddleware, protectedApiRouter);
  app.use(`${rootPath}/login`, adminLoginRateLimiter);
  app.use(rootPath, adminRouter);

  app.use((_req: Request, res: Response) => {
    sendError(res, 'Not found', 404);
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const normalizedError =
      error instanceof AppError
        ? error
        : new AppError(500, error instanceof Error ? error.message : 'Internal server error');

    Sentry.captureException(error);
    logger.error('Request failed', {
      error: normalizedError.message,
      stack: error instanceof Error ? error.stack : undefined,
      details: normalizedError.details,
    });

    sendError(res, normalizedError.message, normalizedError.statusCode, normalizedError.details);
  });

  return app;
};

const startServer = async (): Promise<void> => {
  const env = getEnv();
  await connectToDatabase();

  const app = await createApp();
  app.listen(env.PORT, () => {
    logger.info('API server listening', {
      port: env.PORT,
      environment: env.NODE_ENV,
    });
  });
};

if (require.main === module) {
  startServer().catch((error: unknown) => {
    const normalizedError = error instanceof Error ? error : new Error('Server bootstrap failed');
    Sentry.captureException(normalizedError);
    logger.error('Failed to start API server', {
      error: normalizedError.message,
      stack: normalizedError.stack,
    });
    process.exit(1);
  });
}
