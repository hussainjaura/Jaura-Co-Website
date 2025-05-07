import mysql from "mysql2/promise";
import dotenv from "dotenv";

// to load environmental variables
dotenv.config();

// to create a connection pool
const pool = mysql.createPool({
  // my database host
  host: "localhost",
  // my MySQL username
  user: process.env.user,
  database: "clothingwebsite",
  // my MySQL password
  password: process.env.password,
  // wait for a connection if all are in use
  waitForConnections: true,
  // maximum number of connections in the pool
  connectionLimit: 10,
  queueLimit: 0,
});

// function to test the database connection
async function testDatabaseConnection() {
  try {
    const [results] = await pool.query("SELECT 1 + 1 AS solution");
    // should output 2 just as a test
    console.log("Database connected! Test query result:", results[0].solution);
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

// test the connection
testDatabaseConnection();

export default pool;
