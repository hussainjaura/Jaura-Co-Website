import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "../database/database.js";
import logger from "../utils/logger.js";

// please convert import.meta.url to CommonJS directory and filename as
// Jest does not support import.meta.url filename in Testing so for Testing use like this:
// const __dirname = __dirname;

// file and directory name to use in routing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create an express instance
const router = express.Router();

// route to get the cart page
router.get("/cart", async (req, res) => {
  // ensure user is logged in
  const userId = req.session.user ? req.session.user.id : null;

  if (!userId) {
    return res.redirect("/login-required");
  }

  try {
    // fetches the user's cart items from the database
    const [cartItems] = await db.execute(
      "SELECT * FROM cart WHERE user_id = ?",
      [userId]
    );

    // logs cartItems to verify data
    logger.debug(`cart items for user ${userId}: ${JSON.stringify(cartItems)}`);

    // render cart page with the cart items
    res.render("cart", { cartItems });
  } catch (err) {
    logger.error(`error retrieving cart items: ${err.message}`);
    res.status(500).json({ error: "error retrieving cart items" });
  }
});

// route to add an item to the cart
router.post("/cart/add", async (req, res) => {
  // destructure required product data from request body
  const { productId, name, price, quantity, imageUrl } = req.body;
  const userId = req.session.user ? req.session.user.id : null;

  //   parse incoming data
  const productIdNum = parseInt(productId, 10);
  const priceNum = parseFloat(price);
  const quantityNum = parseInt(quantity, 10);

  if (!productIdNum || !name || isNaN(priceNum) || isNaN(quantityNum)) {
    return res.status(400).send("invalid product data");
  }

  if (!userId) {
    return res.status(401).json({ error: "user is not logged in" });
  }

  try {
    // check if the item already exists in the cart for user
    const [existingItem] = await db.execute(
      "SELECT * FROM cart WHERE product_id = ? AND user_id = ?",
      [productIdNum, userId]
    );

    if (existingItem.length > 0) {
      // if exists update its quantity
      const updatedQuantity = existingItem[0].quantity + quantityNum;
      await db.execute(
        "UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?",
        [updatedQuantity, productIdNum, userId]
      );
      logger.debug(
        `updated quantity for product ${productIdNum} to ${updatedQuantity}`
      );
    } else {
      // if the item does not exist insert it into the cart
      await db.execute(
        "INSERT INTO cart (user_id, product_id, name, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, productIdNum, name, priceNum, quantityNum, imageUrl || null]
      );
      logger.debug(`added new item to cart: productId ${productIdNum}`);
    }

    // send success response
    res.status(200).json({ message: "Item added to cart" });
  } catch (err) {
    console.error("error adding item to cart:", err);
    res.status(500).json({ error: "error adding item to cart" });
  }
});

// route to remove an item from the cart
router.post("/cart/remove", async (req, res) => {
  // get product id from the request body
  const { productId } = req.body;
  console.log("removing item with productId:", productId);

  const productIdNum = parseInt(productId, 10);

  //   if product id is invalid then return error
  if (!productIdNum) {
    console.log("invalid product ID");
    return res.status(400).send("invalid product ID");
  }

  try {
    // to delete item from cart using productID
    await db.execute("DELETE FROM cart WHERE product_id = ?", [productIdNum]);
    logger.debug(`removed product ${productIdNum} from cart`);
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    logger.error(`Error removing item from cart: ${err.message}`);
    res.status(500).json({ error: "Error removing item from cart" });
  }
});

// route to update the quantity of an item in the cart
router.post("/cart/update", async (req, res) => {
  // get the product id and quantity from request body
  const { productId, quantity } = req.body;

  //   parse the incoming data
  const productIdNum = parseInt(productId, 10);
  const quantityNum = parseInt(quantity, 10);

  if (!productIdNum || isNaN(quantityNum)) {
    return res.status(400).json({ error: "invalid data" });
  }

  try {
    // update the quantity of the product in the cart
    await db.execute("UPDATE cart SET quantity = ? WHERE product_id = ?", [
      quantityNum,
      productIdNum,
    ]);
    logger.debug(
      `updated cart item ${productIdNum} to quantity ${quantityNum}`
    );
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (err) {
    // to handle errors
    logger.error(`error updating cart item: ${err.message}`);
    res.status(500).json({ error: "error updating item in cart" });
  }
});

export default router;
