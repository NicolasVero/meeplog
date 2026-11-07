import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export function validateParams(schema: ZodType) {
  function middleware(req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      console.log(result.error);
      return res.status(400).json({ error: 'Invalid params' });
    }
    next();
  }

  return middleware;
}

export function validateBody(schema: ZodType) {
  function middleware(req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.log(result.error);
      return res.status(400).json({ error: 'Invalid params' });
    }
    next();
  }

  return middleware;
}
