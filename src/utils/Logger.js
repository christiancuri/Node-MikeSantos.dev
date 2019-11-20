import winston, { createLogger, format } from "winston";

const { combine, colorize, simple } = format;

const consoleConfig = {
  level: "info",
  handleExceptions: true,
  format: combine(colorize(), simple())
};

const loggerTransports = new winston.transports.Console(consoleConfig);

const logger = createLogger({
  transports: [loggerTransports],
  exitOnError: false
});

export default logger;
