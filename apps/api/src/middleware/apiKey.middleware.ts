import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { getEnv } from '../config/env';
import { sendError } from '../lib/http';

const secureCompare = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const requireApiKey = (req: Request, res: Response, next: NextFunction): Response | void => {
  const apiKey = req.headers['x-api-key'];

  if (typeof apiKey !== 'string' || !secureCompare(apiKey, getEnv().MOBILE_API_KEY)) {
    return sendError(res, 'Invalid or missing API key', 401);
  }

  next();
};
