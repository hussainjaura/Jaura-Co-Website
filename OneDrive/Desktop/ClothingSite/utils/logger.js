import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// using winston a npm library to make sure I dont share private and secret info to logs like console.logs
// and this way application looks professional and scallable when it comes to deploying the app

// to add color and timestamp to log messages
const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// create a logger instance
const logger = winston.createLogger({
  // in production only log 'error' and above to avoid leaking debug info
  //in development log everything from 'debug' and above for troubleshooting
  level: process.env.NODE_ENV === "production" ? "error" : "debug",

  // to define the format of log messages
  format: logFormat,
  transports: [
    new winston.transports.Console(),

    new DailyRotateFile({
      filename: "logs/error.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      // keep the data for one day only
      maxFiles: "1d",
      zippedArchive: false,
    }),

    new DailyRotateFile({
      filename: "logs/combined.log",
      datePattern: "YYYY-MM-DD",
      // delete after 24 hours
      maxFiles: "1d",
      // max size set so nothing breaks because of oversize
      maxSize: "20m",
      zippedArchive: false,
    }),
  ],
});

export default logger;
