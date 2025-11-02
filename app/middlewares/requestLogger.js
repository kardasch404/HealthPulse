import Logger from '../logs/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('user-agent');

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const message = `${method} ${url} - ${statusCode}`;

    const logData = {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userAgent,
    };

    if (statusCode >= 500) {
      Logger.error(message, null, logData);
    } else if (statusCode >= 400) {
      Logger.warn(message, logData);
    } else {
      Logger.http(message, logData);
    }
  });

  next();
};
