import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodSchema } from 'zod';

import { sendError } from '../lib/http';

type RequestSchemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

const mapZodError = (error: ZodError): Array<{ field: string; message: string }> =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));

export const validateRequest =
  (schemas: RequestSchemas) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    if (schemas.body) {
      const bodyResult = schemas.body.safeParse(req.body);
      if (!bodyResult.success) {
        return sendError(res, 'Validation failed', 400, mapZodError(bodyResult.error));
      }
      req.body = bodyResult.data;
    }

    if (schemas.params) {
      const paramsResult = schemas.params.safeParse(req.params);
      if (!paramsResult.success) {
        return sendError(res, 'Validation failed', 400, mapZodError(paramsResult.error));
      }
      req.params = paramsResult.data as Request['params'];
    }

    if (schemas.query) {
      const queryResult = schemas.query.safeParse(req.query);
      if (!queryResult.success) {
        return sendError(res, 'Validation failed', 400, mapZodError(queryResult.error));
      }
      req.query = queryResult.data as Request['query'];
    }

    next();
  };
