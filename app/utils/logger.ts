import winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create a simplified logger configuration
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    isDevelopment ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.printf(({ timestamp, level, message, action, ...rest }) => {
      // Format with action name if present
      const prefix = action ? `[${action}]` : '';
      
      // Format metadata for better readability
      const meta = Object.keys(rest).length && !rest.error ? 
        ` ${JSON.stringify(rest)}` : '';
      
      // Format error data if present
      const errorData = rest.error ? 
        ` Error: ${typeof rest.error === 'object' ? JSON.stringify(rest.error, null, 2) : rest.error}` : '';
      
      return `${timestamp} ${level}: ${prefix} ${message}${meta}${errorData}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  exitOnError: false,
});

/**
 * Simple logger for server actions
 * @param action The name of the server action
 */
export function serverLogger(action: string) {
  return {
    /**
     * Log the start of a server action
     */
    start(meta?: Record<string, any>) {
      logger.info(`Started`, { action, ...meta });
    },
    
    /**
     * Log an info message
     */
    info(message: string, meta?: Record<string, any>) {
      logger.info(message, { action, ...meta });
    },
    
    /**
     * Log a debug message
     */
    debug(message: string, meta?: Record<string, any>) {
      logger.debug(message, { action, ...meta });
    },
    
    /**
     * Log a warning message
     */
    warn(message: string, meta?: Record<string, any>) {
      logger.warn(message, { action, ...meta });
    },
    
    /**
     * Log an error message with optional error object
     */
    error(message: string, error?: any, meta?: Record<string, any>) {
      logger.error(message, { 
        action,
        error,
        ...(meta || {})
      });
    },
    
    /**
     * Log a success message
     */
    success(message: string, meta?: Record<string, any>) {
      logger.info(`✅ ${message}`, { action, ...meta });
    }
  };
}

export default logger; 