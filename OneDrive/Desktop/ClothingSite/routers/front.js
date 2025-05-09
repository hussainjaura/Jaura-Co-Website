import express from "express";
//importing path so that works for all softwares
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// ESMA modules works differently so I had to use these:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create a express router instance
const router = express.Router();

// defined the path for products.json where all products json data is!
const productsPath = path.join(__dirname, "../", "JSON", "products.json");

// function to get the json products
const getProducts = () => {
  const data = fs.readFileSync(productsPath, "utf8");
  // parse the json data and return result as javascript object
  return JSON.parse(data);
};

// route to render the clothes page
router.get("/clothes", (req, res, next) => {
  const products = getProducts();
  // pass the products data to the template ejs file
  res.render("clothes", { products });
});

// route to render the home page
router.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "views", "web.html"));
});

// route to render the about page
router.get("/about", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "views", "about.html"));
});

// route to render the account page
router.get("/account", (req, res, next) => {
  // when we reach account depending on what we clicked it should open the other window
  res.sendFile(path.join(__dirname, "../", "views", "account.html"));
});

//route for the contact page
router.get("/contact", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "views", "contact.html"));
});

export default router;
