import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../dto/response.dto';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res
      .status(429)
      .json(
        ApiResponse.error(
          'TOO_MANY_REQUESTS',
          'Too many requests from this IP, please try again after 15 minutes.',
          null,
          req.id,
        ),
      );
  },
});
