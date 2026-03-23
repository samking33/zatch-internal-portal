import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';

import { Role } from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { sendSuccess } from '../../lib/http';
import { requireRole } from '../../middleware/rbac.middleware';
import { adminUsersService } from './admin-users.service';

const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createAdminUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200).trim(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be 128 characters or fewer')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  role: z.enum([Role.OPS_ADMIN, Role.VIEWER]).default(Role.OPS_ADMIN),
});

const updateAdminUserParamsSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid admin user id'),
});

const updateAdminUserSchema = z
  .object({
    role: z.enum([Role.OPS_ADMIN, Role.VIEWER]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    message: 'At least one field is required',
  });

export const adminUsersRouter = Router();

adminUsersRouter.get(
  '/',
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = adminUserListQuerySchema.parse(req.query);
      const result = await adminUsersService.list({
        page: query.page,
        limit: query.limit,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

adminUsersRouter.post(
  '/',
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const body = createAdminUserSchema.parse(req.body);
      const user = await adminUsersService.create({
        email: body.email,
        name: body.name,
        password: body.password,
        role: body.role,
        adminUserId: req.user.userId,
        adminUserEmail: req.user.email,
        ...(req.ip ? { ipAddress: req.ip } : {}),
      });
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  },
);

adminUsersRouter.patch(
  '/:id',
  requireRole(Role.SUPER_ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const params = updateAdminUserParamsSchema.parse(req.params);
      const body = updateAdminUserSchema.parse(req.body);
      const user = await adminUsersService.update({
        userId: params.id,
        ...(body.role ? { role: body.role } : {}),
        ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
        adminUserId: req.user.userId,
        adminUserEmail: req.user.email,
        ...(req.ip ? { ipAddress: req.ip } : {}),
      });
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },
);
