import express from "express";
// for password hashing
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import session from "express-session";
import pool from "../database/database.js";
import MySQLStore from "connect-mysql2";
import logger from "../utils/logger.js";

// creatig express router instance
const router = express.Router();

// user signup route
router.post("/signup", async (req, res) => {
  logger.info("form submission started");
  const { username, email, password } = req.body;
  logger.debug(`received signup data: ${JSON.stringify({ username, email })}`);

  try {
    // check if the user already exists in the database
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("user already exists");
      return res
        .status(400)
        .json({ message: "user already exists please log in!" });
    }
    // hash the password before saving
    const hashedPass = await bcrypt.hash(password, 10);

    // create new user in the database
    const newUser = await User.create({
      username,
      email,
      password: hashedPass,
    });

    // make sure session middleware is working
    if (!req.session) {
      console.error("session is undefined. check session middleware setup.");
      return res.status(500).send("server error: session not initialized");
    }

    //to store the user session:
    req.session.user = { id: newUser.id, username: newUser.username };
    logger.debug(`session data set: ${JSON.stringify(req.session.user)}`);

    res.status(201).json({
      message: "user has been registered!",
      username: newUser.username,
    });
  } catch (err) {
    logger.error(`signup error: ${err.message}`, err);
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

// route for user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userId = 1;

  try {
    logger.debug(`login credentials received: ${JSON.stringify({ email })}`);

    // Step 1: Look for the user in the database
    const user = await User.findOne({ where: { email } });
    console.log("user found:", user); // Log user data

    // error if user not found
    if (!user) {
      logger.warn(`login failed - user not found for email: ${email}`);
      return res.status(400).json({ message: "invalid email or password." });
    }

    // Step 2: validate passwords
    const match = await bcrypt.compare(password, user.password);
    logger.debug(`password match: ${match}`);

    //to fetch the data from cart table so that we ca login and get our cart data:
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ?",
      [userId]
    );

    req.session.cart = cartItems;

    // error if it is not a match
    if (!match) {
      logger.warn(
        `login failed - password mismatch for user: ${user.username}`
      );
      return res.status(400).json({ message: "invalid email or password." });
    }

    // Step 3: Store session data
    if (user && match) {
      req.session.user = { id: user.id, username: user.username };
      logger.debug(`session data set: ${JSON.stringify(req.session.user)}`);
    } else {
      console.log("session is undefined.");
      return res.status(500).json({ message: "session not available." });
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json({ message: "login successful.", username: user.username });
  } catch (err) {
    logger.error(`login error: ${err.message}`, err);
    res.status(500).json({ message: "an internal server error occurred." });
  }
});

// logout router
router.post("/logout", async (req, res) => {
  // get user id from session
  const userId = req.session.user.id;

  try {
    // optionally, save the cart back to the database
    // get the cart from session
    const cart = req.session.cart || [];

    // iterate through each cart item and save or update it in the database
    for (let item of cart) {
      await pool.execute(
        `INSERT INTO cart (user_id, product_id, name, price, quantity, image_url)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       quantity = VALUES(quantity),
       price = VALUES(price),
       name = VALUES(name),
       image_url = VALUES(image_url)`,
        [
          userId,
          item.product_id,
          item.name,
          parseFloat(item.price),
          parseInt(item.quantity),
          item.image_url,
        ]
      );
    }

    // destroy the session to logout
    req.session.destroy((err) => {
      if (err) {
        logger.error("logout failed during session destruction", err);
        return res.status(500).json({ message: "logout failed" });
      }
      res.clearCookie("user_cookie");
      res.json({ message: "logged out successfully" });
    });
  } catch (err) {
    logger.error(`logout error: ${err.message}`, err);
    res.status(500).json({ message: "an error occurred during logout" });
  }
});

// check session route
router.get("/session", async (req, res) => {
  try {
    logger.debug(`session object: ${JSON.stringify(req.session)}`);

    // check if user is logged in by checking session.user
    if (req.session.user) {
      // fetch session data from the session cookie
      const sessionId = req.sessionID;
      logger.debug(`session ID from req.sessionID: ${sessionId}`);

      // get session from mysql database
      const [sessionData] = await pool.execute(
        "SELECT * FROM sessions WHERE session_id = ?",
        [sessionId]
      );
      logger.debug(`session data from DB: ${JSON.stringify(sessionData)}`);

      if (sessionData && sessionData.length > 0) {
        // send back the session ID if it's stored in the database
        res.json({
          loggedIn: true,
          username: req.session.user.username,
          sessionId: sessionId,
        });
      } else {
        res.json({ loggedIn: false });
      }
    } else {
      res.json({ loggedIn: false });
    }
  } catch (err) {
    logger.error(`error fetching session data: ${err.message}`, err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching session data." });
  }
});

// route to render the login-required page
router.get("/login-required", (req, res) => {
  res.render("login-required", {
    message: "you must be logged in to add items to your cart!",
  });
});

export default router;
