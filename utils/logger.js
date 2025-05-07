import winston from "winston";

// using winston a npm library to make sure I dont share private and secret info to logs like console.logs
// and this way application looks professional and scallable when it comes to deploying the app

// create a logger instance
const logger = winston.createLogger({
  // in production only log 'error' and above to avoid leaking debug info
  //in development log everything from 'debug' and above for troubleshooting
  level: process.env.NODE_ENV === "production" ? "error" : "debug",

  // to define the format of log messages
  format: winston.format.combine(
    // to add colors
    winston.format.colorize(),
    // to add time
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp }) => {
      // output
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    // to log to console for developement
    new winston.transports.Console(),
    // files would be found in log folder for specific error logging
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
