import type { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response =>
  res.status(statusCode).json({
    success: true,
    data,
  });

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: unknown,
): Response =>
  res.status(statusCode).json({
    success: false,
    error,
    ...(details === undefined ? {} : { details }),
  });
