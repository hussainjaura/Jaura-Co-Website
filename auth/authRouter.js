import express from "express";
// for password hashing
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import session from "express-session";
import pool from "../database/database.js";
import MySQLStore from "connect-mysql2";

const router = express.Router();

// user signup route
router.post("/signup", async (req, res) => {
  console.log("Form submission started");
  const { username, email, password } = req.body;
  console.log("Received data:", { username, email, password });

  try {
    // check if the user already exists in the database
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists");
      return res
        .status(400)
        .json({ message: "User already exists. Please log in!" });
    }
    // hash the password before saving
    const hashedPass = await bcrypt.hash(password, 10);

    // create new user in the database
    const newUser = await User.create({
      username,
      email,
      password: hashedPass,
    });
    console.log("Session Object before setting user:", req.session);

    // make sure session middleware is working
    if (!req.session) {
      console.error("Session is undefined. Check session middleware setup.");
      return res.status(500).send("Server error: Session not initialized");
    }

    //to store the user session:
    req.session.user = { id: newUser.id, username: newUser.username };
    console.log("Session data set:", req.session);

    res.status(201).json({
      message: "User has been registered!",
      username: newUser.username,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

// route for user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userId = 1;

  try {
    console.log("Received login request:", { email, password });

    // Step 1: Look for the user in the database
    const user = await User.findOne({ where: { email } });
    console.log("User found:", user); // Log user data

    // error if user not found
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Step 2: validate passwords
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);

    //to fetch the data from cart table so that we ca login and get our cart data:
    const [cartItems] = await pool.execute(
      "SELECT * FROM cart WHERE user_id = ?",
      [userId]
    );

    req.session.cart = cartItems;

    // error if it is not a match
    if (!match) {
      console.log("Password mismatch for user:", user.username);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Step 3: Store session data
    if (user && match) {
      req.session.user = { id: user.id, username: user.username };
      console.log("Session data set:", req.session.user);
    } else {
      console.log("Session is undefined.");
      return res.status(500).json({ message: "Session not available." });
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json({ message: "Login successful.", username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "An internal server error occurred." });
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
        "INSERT INTO cart (user_id, product_id, quantity, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?",
        [userId, item.product_id, item.quantity, item.price, item.quantity]
      );
    }

    // destroy the session to logout
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("user_cookie");
      res.json({ message: "Logged out successfully" });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "An error occurred during logout" });
  }
});

// check session route
router.get("/session", async (req, res) => {
  try {
    console.log("Session Object:", req.session);

    // check if user is logged in by checking session.user
    if (req.session.user) {
      // fetch session data from the session cookie
      const sessionId = req.sessionID;
      console.log("Session ID from req.sessionID:", sessionId);

      // get session from mysql database
      const [sessionData] = await pool.execute(
        "SELECT * FROM sessions WHERE session_id = ?",
        [sessionId]
      );
      console.log("Session data from DB:", sessionData);

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
    console.error("Error fetching session data:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching session data." });
  }
});

// route to render the login-required page
router.get("/login-required", (req, res) => {
  res.render("login-required", {
    message: "You must be logged in to add items to your cart!",
  });
});

export default router;
