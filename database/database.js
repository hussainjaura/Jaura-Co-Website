import mysql from "mysql2/promise";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import fs from "fs";

// to load environmental variables
dotenv.config();

// to create a connection pool
const pool = mysql.createPool({
  // my database host
  host: process.env.cloud_host,
  // cloud port
  port: process.env.cloud_port,
  // my MySQL username
  user: process.env.cloud_user,
  // my MySQL password
  password: process.env.cloud_password_TIBD,
  database: process.env.cloud_name,
  // wait for a connection if all are in use
  waitForConnections: true,
  // maximum number of connections in the pool
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(process.env.cloud_certificate),
  },
});

// function to test the database connection
async function testDatabaseConnection() {
  try {
    const [results] = await pool.query("SELECT 1 + 1 AS solution");
    // should output 2 just as a test
    logger.info(
      `Database connected! Test query result: ${results[0].solution}`
    );
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
  }
}

// test the connection
testDatabaseConnection();

export default pool;
