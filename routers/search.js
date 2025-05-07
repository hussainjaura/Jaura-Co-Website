import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// to generate current file path and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// to create a express router instance
const router = express.Router();

// define the path to the products.json file
const productsPath = path.join(__dirname, "../", "JSON", "products.json");

// function to get products from the JSON file
const getProducts = () => {
  const data = fs.readFileSync(productsPath, "utf8");
  // parse the data into an object
  return JSON.parse(data);
};

// handle GET request for /search route to display the search form
router.get("/search", (req, res, next) => {
  // pass an empty array and null for message
  res.render("search", { products: [], message: null });
});

// route to post products when user searches
router.post("/search", (req, res, next) => {
  // get and trim input, lowercase for comparison
  const query = req.body.Product.trim().toLowerCase();
  // to get the selected category
  const category = req.body.category;
  // fetch the list of products from json file
  const products = getProducts();

  // initialized an empty array to store filtered products
  let filteredProducts = [];

  if (!query && category) {
    // If no product name is entered but a category is selected, show all products from that category
    filteredProducts = products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  } else if (query) {
    // if I typed something, match product name OR category (partial match for both)
    filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }
  // render the search.ejs file with filtered products or show a error message if no products are found
  res.render("search", {
    products: filteredProducts.length > 0 ? filteredProducts : null,
    message:
      filteredProducts.length > 0
        ? null
        : `No products found for "${req.body.Product}". Please try another search.`,
  });
});

export default router;
