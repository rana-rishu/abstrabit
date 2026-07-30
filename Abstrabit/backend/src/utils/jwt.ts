import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.config';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export interface ResetTokenPayload {
  email: string;
  type: 'reset';
}

export const generateResetToken = (email: string): string => {
  return jwt.sign({ email, type: 'reset' }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const verifyResetToken = (token: string): ResetTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as ResetTokenPayload;
};
