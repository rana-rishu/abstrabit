import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { HEADER_KEYS } from '../constants/http.constants';

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const incomingId = req.headers[HEADER_KEYS.CORRELATION_ID] as string | undefined;
  const requestId = incomingId && incomingId.trim() !== '' ? incomingId : uuidv4();
  
  req.id = requestId;
  res.setHeader(HEADER_KEYS.CORRELATION_ID, requestId);
  next();
};
