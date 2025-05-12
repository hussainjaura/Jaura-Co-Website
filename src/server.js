import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import dbsession from "../database/dbsession.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import helmet from "helmet";

// load environmental variables from .env file
dotenv.config();

// destructure the object to get sessionStore and checkDatabaseConnection
const { sessionStore, checkDatabaseConnection } = dbsession;

// directory and file name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
// used helmet to secure HTTP headers
app.use(helmet());

// middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// set up session management if the database connection is successful
app.use(
  session({
    name: "user_cookie",
    secret: process.env.secret,
    resave: false,
    // important for setting cookies only after session creation
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      name: "user_cookie",
      secure: false,
      httpOnly: true,
      // 1 hour
      maxAge: 3600000,
      path: "/",
      sameSite: "lax",
    },
  })
);

// check if the database works
async function initializeApp() {
  try {
    // await the promise returned by checkDatabaseConnection
    const message = await checkDatabaseConnection();
    // this will show whether the connection is successful or not
    logger.info(message);
  } catch (error) {
    logger.error(`database connection error: ${error.message}`);
  }
}

initializeApp();

// set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// middleware to log requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  // proceed to next middleware
  next();
});

// serve static files (CSS, images, etc.)
app.use(
  "/ClothingSite/styling",
  express.static(path.join(__dirname, "..", "styling"))
);
app.use(
  "/ClothingSite/views",
  express.static(path.join(__dirname, "..", "views"))
);
app.use(
  "/ClothingSite/images",
  express.static(path.join(__dirname, "..", "images"))
);
app.use(
  "/ClothingSite/auth",
  express.static(path.join(__dirname, "..", "auth"))
);
app.use(
  "/ClothingSite/scripts",
  express.static(path.join(__dirname, "..", "scripts"))
);

// serve favicon directly from root level
app.use(express.static(path.join(__dirname, "..")));

// Routes for static pages and main app logic
import frontRouter from "../routers/front.js";
import mainRouter from "../routers/search.js";
import cartRouter from "../routers/cart.js";
import authRouter from "../auth/authRouter.js";
import checkoutRouter from "../routers/checkout.js";

// Routes for other pages
app.use(mainRouter);
app.use(frontRouter);
app.use(cartRouter);
app.use(authRouter);
app.use(checkoutRouter);

// serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "web.html"));
});

app.get("/test", (req, res) => {
  res.send("server is working fine");
});

// 404 Page for unmatched routes
app.use((req, res, next) => {
  logger.warn(`404 - Page not found: ${req.path}`);
  res.status(404).render("error", {
    title: "Error 404 - Jaura & Co",
    message: "Page Not Found",
    description:
      "The page you were looking for does not exist. Please check the URL or navigate back to our homepage.",
  });
});

// added a general error handler
app.use((err, req, res, next) => {
  logger.error(`500 - Internal Server Error: ${err.message}`);
  res.status(500).render("error", {
    title: "Error 500 - Jaura & Co",
    message: "Something went wrong!",
    description:
      "We encountered an error processing your request. Please try again later.",
  });
});

// to start the server
app.listen(PORT, () => {
  logger.info(`server is running at ${PORT}`);
});

// if I cannot logout with cart items then its definately the cart name problem
