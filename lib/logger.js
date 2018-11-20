const winston = require("winston");
 const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json()
});
 
// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;