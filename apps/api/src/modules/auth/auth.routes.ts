import { Router, type NextFunction, type Request, type Response } from 'express';

import { loginSchema } from '@zatch/shared';

import { getEnv } from '../../config/env';
import { AppError } from '../../lib/app-error';
import { sendSuccess } from '../../lib/http';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { authService } from './auth.service';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

const getRefreshCookieOptions = () => {
  const env = getEnv();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: sevenDaysMs,
    path: '/',
  };
};

const getRefreshCookieClearOptions = () => {
  const { maxAge: _maxAge, ...options } = getRefreshCookieOptions();
  return options;
};

export const authRouter = Router();

authRouter.post(
  '/login',
  validateRequest({ body: loginSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body, {
        ...(req.ip ? { ipAddress: req.ip } : {}),
      });

      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshCookieOptions());

      sendSuccess(res, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await authService.refresh(refreshToken);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    await authService.logout(req.user.userId, {
      ...(req.ip ? { ipAddress: req.ip } : {}),
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshCookieClearOptions());
    sendSuccess(res, { message: 'Logged out' });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await authService.getCurrentUser(req.user.userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});
