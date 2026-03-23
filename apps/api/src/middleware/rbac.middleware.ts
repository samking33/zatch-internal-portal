import type { NextFunction, Request, Response } from 'express';

import type { Role } from '@zatch/shared';

import { sendError } from '../lib/http';

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', 403);
    }

    next();
  };
