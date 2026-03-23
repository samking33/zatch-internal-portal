import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { Role, SellerStatus, updateSellerStatusSchema } from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { sendSuccess } from '../../lib/http';
import { requireRole } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { sellerService } from './seller.service';

const sellerIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid seller id'),
});

const sellerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['receivedAt']).optional(),
  states: z.string().optional(),
  city: z.string().trim().min(1).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits').optional(),
  status: z.enum([SellerStatus.PENDING, SellerStatus.APPROVED, SellerStatus.REJECTED, 'all']).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be YYYY-MM-DD').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be YYYY-MM-DD').optional(),
});

const sellerStatsQuerySchema = z.object({
  states: z.string().optional(),
  city: z.string().trim().min(1).optional(),
});

export const sellerRouter = Router();

sellerRouter.get(
  '/stats/by-state',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await sellerService.getCountByState();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },
);

sellerRouter.get(
  '/stats/by-city',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  validateRequest({ query: sellerStatsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = sellerStatsQuerySchema.parse(req.query);
      const states = query.states?.split(',').map((value) => value.trim()).filter(Boolean);
      const stats = await sellerService.getCountByCity(states && states.length > 0 ? states : undefined);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },
);

sellerRouter.get(
  '/stats/by-pincode',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  validateRequest({ query: sellerStatsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = sellerStatsQuerySchema.parse(req.query);
      const states = query.states?.split(',').map((value) => value.trim()).filter(Boolean);
      const stats = await sellerService.getCountByPincode({
        ...(query.city ? { city: query.city } : {}),
        ...(states && states.length > 0 ? { states } : {}),
      });
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },
);

sellerRouter.get(
  '/',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  validateRequest({ query: sellerListQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = sellerListQuerySchema.parse(req.query);
      const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined;
      const to = query.to ? new Date(`${query.to}T23:59:59.999Z`) : undefined;

      if (from && Number.isNaN(from.getTime())) {
        throw new AppError(400, 'Invalid from date');
      }

      if (to && Number.isNaN(to.getTime())) {
        throw new AppError(400, 'Invalid to date');
      }

      if (from && to && from > to) {
        throw new AppError(400, 'From date must be before to date');
      }

      const states = query.states
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      const result = await sellerService.getSellers({
        page: query.page,
        limit: query.limit,
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
        ...(states && states.length > 0 ? { states } : {}),
        ...(query.city ? { city: query.city } : {}),
        ...(query.pincode ? { pincode: query.pincode } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

sellerRouter.get(
  '/:id',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  validateRequest({ params: sellerIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = sellerIdParamsSchema.parse(req.params);
      const seller = await sellerService.getSellerDetailById(id);
      sendSuccess(res, seller);
    } catch (error) {
      next(error);
    }
  },
);

sellerRouter.patch(
  '/:id/status',
  requireRole(Role.OPS_ADMIN, Role.SUPER_ADMIN),
  validateRequest({
    params: sellerIdParamsSchema,
    body: updateSellerStatusSchema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const { id } = sellerIdParamsSchema.parse(req.params);
      const body = updateSellerStatusSchema.parse(req.body);

      const seller = await sellerService.updateStatus({
        sellerId: id,
        action: body.action,
        ...(body.note ? { note: body.note } : {}),
        adminUserId: req.user.userId,
        adminUserEmail: req.user.email,
        ...(req.ip ? { ipAddress: req.ip } : {}),
      });

      sendSuccess(res, seller);
    } catch (error) {
      next(error);
    }
  },
);
