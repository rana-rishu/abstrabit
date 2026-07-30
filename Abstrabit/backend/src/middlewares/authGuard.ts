import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError } from '../errors/AppError';
import { HEADER_KEYS } from '../constants/http.constants';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers[HEADER_KEYS.AUTHORIZATION];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_err) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};
