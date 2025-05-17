import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom colors for different log levels
const customColors = {
    error: 'bold red',
    warn: 'bold yellow',
    info: 'bold green',
    http: 'bold cyan',
    verbose: 'bold blue',
    debug: 'bold magenta',
    silly: 'bold gray'
};

// Add custom colors to winston
winston.addColors(customColors);

// Define log format for file output
const fileLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define enhanced console format with colors and better formatting
const consoleLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        // Format the metadata
        let metaStr = '';
        if (Object.keys(metadata).length > 0 && metadata.service) {
            const { service, ...rest } = metadata;
            if (Object.keys(rest).length > 0) {
                metaStr = JSON.stringify(rest, null, 2);
            }
        }

        // Format error stacks if they exist
        const errorDetails = stack ? `\n${stack}` : '';

        // Create formatted output
        const formattedTimestamp = `\x1b[90m${timestamp}\x1b[0m`; // Gray timestamp

        // Format message with appropriate spacing
        return `${formattedTimestamp} [${level}]: ${message} ${metaStr}${errorDetails}`;
    })
);

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: fileLogFormat,
    defaultMeta: { service: 'unma-registration-api' },
    transports: [
        // Write all logs to console with enhanced colors
        new winston.transports.Console({
            format: consoleLogFormat,
            handleExceptions: true
        }),
        // Write to all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: fileLogFormat
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: fileLogFormat
        }),
    ],
    exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
    write: (message) => {
        // Remove newline character from morgan logging
        logger.http(message.trim());
    },
};

// Add convenience methods for specific formatting
logger.success = (message, metadata) => {
    logger.info(`✅ ${message}`, metadata);
};

logger.warning = (message, metadata) => {
    logger.warn(`⚠️ ${message}`, metadata);
};

logger.critical = (message, metadata) => {
    logger.error(`🔥 ${message}`, metadata);
};

logger.highlight = (message, metadata) => {
    logger.info(`🔸 ${message}`, metadata);
};

// Log unhandled exceptions and rejections
process.on('uncaughtException', (error) => {
    logger.critical('Uncaught Exception:', error);
    // Give the logger time to write to files before exiting
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

process.on('unhandledRejection', (error) => {
    logger.critical('Unhandled Rejection:', error);
});

// Export both the logger instance and the setup function for flexibility
export { logger, stream };
export const setupLogger = () => {
    return logger;
}; 