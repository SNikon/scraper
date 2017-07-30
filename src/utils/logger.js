import winston from 'winston';
import config from './config';

if (config.logger.colors) {
  winston.addColors(config.logger.colors);
}

const logger = new (winston.Logger)({
  exitOnError: config.logger.quit,
  level: config.logger.level,
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      handleExceptions: true,
      json: false
    })
  ]
});

if (config.logger.disable) {
  logger.remove(logger.transports);
}

export default logger;
