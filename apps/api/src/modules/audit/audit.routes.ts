import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { Role } from '@zatch/shared';

import { requireRole } from '../../middleware/rbac.middleware';
import { sendSuccess } from '../../lib/http';
import { auditService } from './audit.service';

const auditListQuerySchema = z.object({
  targetCollection: z.string().min(1).optional(),
  adminUserId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid admin user id').optional(),
  action: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const auditTargetParamsSchema = z.object({
  targetId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid audit target id'),
});

const auditTargetQuerySchema = z.object({
  targetCollection: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const auditRouter = Router();

auditRouter.get(
  '/',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = auditListQuerySchema.parse(req.query);
      const result = await auditService.list({
        page: query.page,
        limit: query.limit,
        ...(query.targetCollection ? { targetCollection: query.targetCollection } : {}),
        ...(query.adminUserId ? { adminUserId: query.adminUserId } : {}),
        ...(query.action ? { action: query.action } : {}),
        ...(query.startDate ? { startDate: query.startDate } : {}),
        ...(query.endDate ? { endDate: query.endDate } : {}),
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

auditRouter.get(
  '/:targetId',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = auditTargetParamsSchema.parse(req.params);
      const query = auditTargetQuerySchema.parse(req.query);
      const result = await auditService.listByTarget({
        targetId: params.targetId,
        page: query.page,
        limit: query.limit,
        ...(query.targetCollection ? { targetCollection: query.targetCollection } : {}),
        ...(query.startDate ? { startDate: query.startDate } : {}),
        ...(query.endDate ? { endDate: query.endDate } : {}),
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);
