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

// function to create the cart table if it doesn't exist
// async function createCartTable() {
//   const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS cart (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       user_id INT NOT NULL,
//       product_id INT NOT NULL,
//       name VARCHAR(255) NULL,
//       price DECIMAL(10, 2) NOT NULL,
//       quantity INT NOT NULL,
//       image_url VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     );
//   `;

//   try {
//     // execute the query to create the cart table
//     await pool.query(createTableQuery);
//     logger.info("cart table created or already exists.");
//   } catch (err) {
//     logger.error(`error creating cart table: ${err.message}`);
//   }
// }

// function to create the session table if it doesn't exist
async function createSessionTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(255) PRIMARY KEY,
      expires INT NOT NULL,
      data TEXT NOT NULL
    );
  `;

  try {
    // execute the query to create the session table
    await pool.query(createTableQuery);
    logger.info("sessions table created or already exists.");
  } catch (err) {
    logger.error(`error creating sessions table: ${err.message}`);
  }
}

// function to test the database connection
async function testDatabaseConnection() {
  try {
    const [results] = await pool.query("SELECT 1 + 1 AS solution");
    // should output 2 just as a test
    logger.info(
      `Database connected! Test query result: ${results[0].solution}`
    );

    // this is to ceate cart table if it doesn't exist
    await createCartTable();
    // to create sessions table if it doesn't exist
    await createSessionTable();
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
  }
}

// test the connection
testDatabaseConnection();

export default pool;
