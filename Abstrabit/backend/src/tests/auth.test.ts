import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt';
import { authGuard } from '../middlewares/authGuard';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';

describe('Password Utility Tests', () => {
  it('should correctly hash and compare passwords using bcrypt (12 rounds)', async () => {
    const plainText = 'SuperSecret123!';
    const hash = await hashPassword(plainText);

    expect(hash).not.toEqual(plainText);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(plainText, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword!', hash);
    expect(isWrongMatch).toBe(false);
  });
});

describe('JWT Utility Tests', () => {
  const payload = { userId: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };

  it('should generate and verify valid access tokens', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should generate and verify valid refresh tokens', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should deterministically hash refresh tokens via SHA-256', () => {
    const token = 'sample_refresh_token_string';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toEqual(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string length
  });
});

describe('Auth Guard Middleware Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('should throw UnauthorizedError when Authorization header is missing', () => {
    expect(() => authGuard(req as Request, res as Response, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid_token_xyz' };
    expect(() => authGuard(req as Request, res as Response, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach decoded user payload to req.user and call next() on valid token', () => {
    const token = generateAccessToken({ userId: 'user-1', email: 'user@test.com' });
    req.headers = { authorization: `Bearer ${token}` };

    authGuard(req as Request, res as Response, next);

    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe('user-1');
    expect(next).toHaveBeenCalled();
  });
});
