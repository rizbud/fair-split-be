import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;

    const logger = new Logger('HTTP');

    const userAgent = headers['user-agent'] ?? '-';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;
      const methodColor =
        {
          GET: '\x1b[32m',
          POST: '\x1b[33m',
          PUT: '\x1b[34m',
          PATCH: '\x1b[35m',
          DELETE: '\x1b[31m',
        }[method] ?? '\x1b[0m';

      let statusCodeColor = '\x1b[32m';
      switch (true) {
        case statusCode >= 500:
          statusCodeColor = '\x1b[31m';
          break;
        case statusCode >= 400:
          statusCodeColor = '\x1b[33m';
          break;
        case statusCode >= 300:
          statusCodeColor = '\x1b[36m';
          break;
      }

      const message = `${methodColor}[${method}] \x1b[32m[${originalUrl}] ${statusCodeColor}[${statusCode}] \x1b[32m[${ip}] [${userAgent}] [${responseTime}ms] [${contentLength}bytes]`;

      if (statusCode >= 500) {
        logger.error(message);
      } else {
        logger.log(message);
      }
    });

    next();
  }
}
