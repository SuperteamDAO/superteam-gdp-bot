import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const getLogger = () => (isDevelopment ? pino({
 level: process.env.DEV_LOG_LEVEL,
 target: 'pino-pretty',
 options: {
  colorize: true,
 },
 timestamp: true,
}) : pino({
 level: process.env.PROD_LOG_LEVEL,
 timestamp: pino.stdTimeFunctions.isoTime,
 transport: {
  target: 'pino-pretty',
  options: {
   colorize: true,
  },
 },
}));

// useMetadata: true,

const logger = getLogger();

export default logger;
