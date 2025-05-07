import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

// load environmental variables from .env file
dotenv.config();

// create a sequelize instance to connect to MYSQL database
const sequelize = new Sequelize(
  "clothingwebsite",
  "root",
  process.env.password,
  {
    host: "localhost",
    dialect: "mysql",
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
    console.log("User table has been created!");
  })
  .catch((err) => {
    console.log("Error occured:", err);
  });

//   to check and authenticate the database connection
try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully!");
} catch (err) {
  console.error("Unable to establish a connection:", err.message);
}

export default User;
