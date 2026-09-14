import crypto from 'crypto';
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errors';
import { config } from './config';

export interface AuthContext { userId: string; companyId: string; role: 'admin' | 'analyst' | 'viewer' }
export interface AuthenticatedRequest extends Request { auth?: AuthContext; requestId?: string }

export function requestContext(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  req.requestId = req.header('x-request-id')?.slice(0, 100) || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  if ((config.NODE_ENV !== 'production' || config.DESKTOP_MODE) && !config.JWT_SECRET) {
    req.auth = { userId: 'local-dev', companyId: 'local-dev', role: 'admin' };
    return next();
  }
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !config.JWT_SECRET) return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  try {
    const claims = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    if (!claims.sub || typeof claims.companyId !== 'string' || !['admin', 'analyst', 'viewer'].includes(claims.role)) {
      throw new Error('Missing tenant claims');
    }
    req.auth = { userId: claims.sub, companyId: claims.companyId, role: claims.role } as AuthContext;
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 'Invalid or expired access token', 401));
  }
}

export const errorHandler: ErrorRequestHandler = (error, req: AuthenticatedRequest, res, _next) => {
  const appError = error instanceof AppError ? error : new AppError('INTERNAL_ERROR', 'Unexpected server error', 500);
  if (appError.status >= 500) console.error(JSON.stringify({ level: 'error', requestId: req.requestId, code: appError.code, message: error instanceof Error ? error.message : String(error) }));
  res.status(appError.status).json({ error: { code: appError.code, message: appError.message, details: appError.status < 500 ? appError.details : undefined }, requestId: req.requestId });
};
