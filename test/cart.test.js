import request from "supertest";
import express from "express";
import session from "express-session";
import cartRouter from "../routers/cart.js";
import db from "../database/database.js";

// mock logger to silence log output
jest.mock("../utils/logger.js", () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));

// mock database
jest.mock("../database/database.js", () => ({
  default: {
    execute: jest.fn(),
  },
}));

// setup express app
const app = express();
// middleware to parse json request bodies
app.use(express.json());
app.use(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  })
);
// attach cart router
app.use(cartRouter);

// main test
describe("Cart Router", () => {
  let testSession;

  // to create a mock user session before each test
  beforeEach(() => {
    testSession = { user: { id: 1 } };
  });

  // clear mocks after each test to avoid cross-test-pollution
  afterEach(() => {
    jest.clearAllMocks();
  });

  // test for get route
  describe("GET /cart", () => {
    it("should redirect to login if user is not logged in", async () => {
      const res = await request(app).get("/cart");
      expect(res.status).toBe(302);
      expect(res.header.location).toBe("/login-required");
    });

    it("should render cart with items for logged-in user", async () => {
      // to mock a cart item return from DB
      db.default.execute.mockResolvedValueOnce([[{ id: 1, name: "Shirt" }]]);
      app.use((req, res, next) => {
        req.session = testSession;
        next();
      });

      // rendering requires a view engine or mocking res.render
      const res = await request(app).get("/cart");
      expect(res.status).toBe(200);
    });
  });

  // test route for post cart
  describe("POST /cart/add", () => {
    it("should reject if user not logged in", async () => {
      const res = await request(app).post("/cart/add").send({
        productId: 2,
        name: "Test Product",
        price: 19.99,
        quantity: 1,
        imageUrl: "/images/test.jpg",
      });
      expect(res.status).toBe(401);
    });

    it("should add item if not in cart", async () => {
      // mock a no existing item found
      db.default.execute.mockResolvedValueOnce([[]]).mockResolvedValueOnce();
      app.use((req, res, next) => {
        req.session = testSession;
        next();
      });

      const res = await request(app).post("/cart/add").send({
        productId: 2,
        name: "New Shirt",
        price: 19.99,
        quantity: 1,
        imageUrl: "/images/test.jpg",
      });

      // expect back 200 code and a success msg
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/item added/i);
    });

    it("should update quantity if item exists", async () => {
      // mock an existing item
      db.default.execute
        .mockResolvedValueOnce([[{ quantity: 2 }]])
        .mockResolvedValueOnce();
      // inject a test session
      app.use((req, res, next) => {
        req.session = testSession;
        next();
      });

      const res = await request(app).post("/cart/add").send({
        productId: 3,
        name: "Another Shirt",
        price: 25.0,
        quantity: 1,
        imageUrl: "/images/test.jpg",
      });

      expect(res.status).toBe(200);
    });
  });
  // test route for removing from cart
  describe("POST /cart/remove", () => {
    it("should remove the product by ID", async () => {
      // to mock succesfull deletion
      db.default.execute.mockResolvedValueOnce();
      const res = await request(app).post("/cart/remove").send({
        productId: 4,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });

    it("should return 400 for invalid product ID", async () => {
      const res = await request(app).post("/cart/remove").send({
        productId: "abc",
      });

      expect(res.status).toBe(400);
    });
  });

  // test route for post cart update
  describe("POST /cart/update", () => {
    it("should update product quantity", async () => {
      db.default.execute.mockResolvedValueOnce();
      const res = await request(app).post("/cart/update").send({
        productId: 1,
        quantity: 5,
      });

      expect(res.status).toBe(200);
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app).post("/cart/update").send({
        productId: "invalid",
        // invalid quantity passed
        quantity: "not a number",
      });
      // expect status code 400
      expect(res.status).toBe(400);
    });
  });
});
