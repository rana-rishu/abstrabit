import { Request, Response } from 'express';
import { ApiResponse } from '../dto/response.dto';
import { db } from '../config/db.config';

export class HealthController {
  public static getLive = (req: Request, res: Response): void => {
    res.status(200).json(
      ApiResponse.success(
        { status: 'UP', service: 'Abstrabit API Server' },
        undefined,
        req.id,
      ),
    );
  };

  public static getReady = async (req: Request, res: Response): Promise<void> => {
    const isDbConnected = await db.checkConnection();
    if (!isDbConnected) {
      res
        .status(503)
        .json(
          ApiResponse.error(
            'SERVICE_UNAVAILABLE',
            'Database connection unavailable',
            { database: 'DOWN' },
            req.id,
          ),
        );
      return;
    }

    res.status(200).json(
      ApiResponse.success(
        {
          status: 'READY',
          database: 'CONNECTED',
          timestamp: new Date().toISOString(),
        },
        undefined,
        req.id,
      ),
    );
  };

  public static getMetrics = (req: Request, res: Response): void => {
    const memoryUsage = process.memoryUsage();
    res.status(200).json(
      ApiResponse.success(
        {
          uptimeSeconds: Math.floor(process.uptime()),
          memory: {
            rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          },
        },
        undefined,
        req.id,
      ),
    );
  };
}
