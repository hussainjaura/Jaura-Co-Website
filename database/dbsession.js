import mysql from "mysql2/promise";
import expressSession from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

// to load environmental variables
dotenv.config();

// to create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: process.env.user,
  password: process.env.password,
  database: "clothingwebsite",
});

// to correctly initialize MySQL session store
const MySQLStore = MySQLStoreFactory(expressSession);
// passed pool here
const sessionStore = new MySQLStore({}, pool);

// check if sessionStore is initialized
if (!sessionStore) {
  logger.error("Session store is not initialized properly!");
} else {
  logger.info("Session store initialized successfully.");
}

// check the database connection
async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release(); // Release connection back to the pool
    logger.info("SESSION database connected successfully.");
    return "SESSION database connected successfully";
  } catch (error) {
    logger.error("SESSION database connection failed:", error);
    throw new Error("SESSION database connection failed");
  }
}

// export sessionStore and checkDatabaseConnection
export default { sessionStore, checkDatabaseConnection };
