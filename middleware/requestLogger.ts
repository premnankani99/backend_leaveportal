import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log incoming request
    logger.info(`[Incoming Request] ${req.method} ${req.originalUrl} | Body:`, req.body, `| Query:`, req.query);

    // Monkey-patch res.json to capture response
    const originalJson = res.json;
    
    res.json = function (data: any) {
        const executionTime = Date.now() - start;
        
        logger.info(
            `[Outgoing Response] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${executionTime}ms | Payload:`, 
            data
        );
        
        return originalJson.call(this, data);
    };

    next();
};
