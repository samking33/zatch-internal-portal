import rateLimit from 'express-rate-limit';
import { Router, type NextFunction, type Request, type Response } from 'express';

import { sellerIntakeSchema } from '@zatch/shared';

import { sendSuccess } from '../../lib/http';
import { requireApiKey } from '../../middleware/apiKey.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { sellerService } from '../sellers/seller.service';

const intakeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
    });
  },
});

export const intakeRouter = Router();

intakeRouter.post(
  '/seller',
  requireApiKey,
  intakeRateLimiter,
  validateRequest({ body: sellerIntakeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await sellerService.createFromIntake(req.body, req.ip);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },
);
