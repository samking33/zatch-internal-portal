import type { NextFunction, Request, Response } from 'express';

import { getEnv } from '../config/env';
import { sendError } from '../lib/http';

export const requireApiKey = (req: Request, res: Response, next: NextFunction): Response | void => {
  const apiKey = req.headers['x-api-key'];

  if (typeof apiKey !== 'string' || apiKey !== getEnv().MOBILE_API_KEY) {
    return sendError(res, 'Invalid or missing API key', 401);
  }

  next();
};
