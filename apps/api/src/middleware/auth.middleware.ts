import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { accessTokenPayloadSchema } from '@zatch/shared';

import { getEnv } from '../config/env';
import { sendError } from '../lib/http';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized', 401);
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, getEnv().JWT_ACCESS_SECRET);
    const parsedPayload = accessTokenPayloadSchema.parse(decoded);

    req.user = parsedPayload;
    next();
  } catch {
    return sendError(res, 'Unauthorized', 401);
  }
};
