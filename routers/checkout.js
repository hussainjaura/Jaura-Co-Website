import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { url } from "inspector";
import db from "../database/database.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

// load environmental variables from .env file
dotenv.config();

// please convert import.meta.url to CommonJS directory and filename as
// Jest does not support import.meta.url filename in Testing so for Testing use like this:
// const __dirname = __dirname;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
// key hidden for safety purposes
const stripe = new Stripe(process.env.secret_key);

//this router will be for my checkout page button is pressed it moves to the new page that will be
//most probabky a ejs file that is going to ask the user if they are sure about there payment:
router.post("/checkout", async (req, res) => {
  logger.debug("checkout router hit!");
  logger.debug(`received cart items: ${JSON.stringify(req.body)}`);

  try {
    // get cart items from request body
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // convert cart items to stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // create stripe session with dynamic cart data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://jaura-co-website.onrender.com/checkout/success",
      cancel_url: "https://jaura-co-website.onrender.com/checkout/cancel",
      line_items: lineItems,
    });

    // to send Stripe checkout URL
    res.json({ id: session.id, url: session.url });
  } catch (err) {
    logger.error(`checkout error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// route for checkout success
router.get("/checkout/success", async (req, res) => {
  // check the session data
  logger.debug(`session received: ${JSON.stringify(req.session)}`);

  try {
    logger.debug(`user session data: ${JSON.stringify(req.session.user)}`);

    // this ensures user session is correctly set
    const userId = req.session.user ? req.session.user.id : null;
    console.log("user Session:", req.session.user);

    if (!userId) {
      console.error("no user is logged in!");
      return res.status(401).json({ error: "user not logged in" });
    }

    // to remove cart items for the logged-in user
    await db.execute("DELETE FROM cart WHERE user_id = ?", [userId]);
    logger.debug(`cleared cart for user ID: ${userId}`);

    res.render("success");
  } catch (err) {
    console.error("error removing all items from cart:", err);
    res.status(500).json({ error: "error removing items from cart" });
  }
});

// checkout cancel route when user clicks back in stripe page
router.get("/checkout/cancel", (req, res) => {
  // renders cancel.ejs file
  res.render("cancel");
});

export default router;
