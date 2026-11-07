import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { Prisma } from '@prisma/client';

export function validateParams(schema: ZodType) {
  function middleware(req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.params);
    if (!result.success) {
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
      return res.status(400).json({ error: 'Invalid body' });
    }

    req.body = result.data;
    next();
  }

  return middleware;
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
