import type { Request, Response, NextFunction } from 'express';
import type { ZodError, ZodType } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from './errors';

function formatIssues(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateParams(schema: ZodType) {
  function middleware(req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid params', details: formatIssues(result.error) });
    }

    next();
  }

  return middleware;
}

export function validateBody(schema: ZodType) {
  function middleware(req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid body', details: formatIssues(result.error) });
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

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    return res.status(409).json({ error: 'Related resource missing or still referenced' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
