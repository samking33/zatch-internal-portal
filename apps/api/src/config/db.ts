import mongoose from 'mongoose';

import { getEnv } from './env';
import { logger } from '../middleware/logger.middleware';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2_000;

let listenersAttached = false;

const attachConnectionListeners = (): void => {
  if (listenersAttached) {
    return;
  }

  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (error: Error) => {
    logger.error('MongoDB connection error', {
      error: error.message,
      stack: error.stack,
    });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });
};

const wait = async (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export const connectToDatabase = async (attempt = 1): Promise<void> => {
  attachConnectionListeners();

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(getEnv().MONGODB_URI);
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error('Unknown database error');

    logger.error('MongoDB connection attempt failed', {
      attempt,
      error: normalizedError.message,
      stack: normalizedError.stack,
    });

    if (attempt >= MAX_RETRIES) {
      throw normalizedError;
    }

    await wait(RETRY_DELAY_MS * attempt);
    await connectToDatabase(attempt + 1);
  }
};
