import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import fs from "fs";

// load environmental variables from .env file
dotenv.config();

// create a sequelize instance to connect to MYSQL database
const sequelize = new Sequelize(
  // TIDB cloud service database name
  "test",
  // cloud user name
  process.env.cloud_user,
  // stored in .env
  process.env.cloud_password_TIBD,
  {
    host: process.env.cloud_host,
    port: process.env.cloud_port,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        // cert file in env
        ca: fs.readFileSync(process.env.cloud_certificate),
      },
    },
    logging: false,
  }
);

//creating a user table in our database:
const User = sequelize.define(
  "User",
  {
    //primary key in our table:
    // its unique and cannot be null
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    //to create username:
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    //to create an email:
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    //to create a password:
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    //to set out table name:
    tableName: "users_table",
    //to automatically create createdAt, and updatedAt
    timestamps: true,
  }
);

//to sync model with the database:
sequelize
  .sync()
  .then(() => {
    console.log("user table has been created!");
  })
  .catch((err) => {
    console.log("error occured:", err);
  });

//   to check and authenticate the database connection
try {
  await sequelize.authenticate();
  console.log("connection to TIBD has  been established successfully!");
} catch (err) {
  logger.error(`unable to establish a connection: ${err.message}`);
}

export default User;
