import request from "supertest";
import express from "express";
import session from "express-session";
import checkoutRouter from "../routers/checkout.js";
import db from "../database/database.js";

// mock Stripe with a mock create session
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          // pass fake url and id
          id: "sess_123",
          url: "https://stripe.com/checkout/session/sess_123",
        }),
      },
    },
  }))
);

// mock DB
jest.mock("../database/database.js", () => ({
  default: {
    execute: jest.fn(),
  },
}));

// mock logger to silence log output
jest.mock("../utils/logger.js", () => ({
  debug: jest.fn(),
  error: jest.fn(),
}));

// create express app for testing
const app = express();

// middleware setup
app.use(express.json());
app.use(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// set the view engine for rendering
app.set("view engine", "ejs");
app.use(checkoutRouter);

// mock render method
app.response.render = jest.fn().mockImplementation((view) => {
  // fake render output for testing
  return view;
});

// main checkout router
describe("Checkout Router", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // test for post checkout
  describe("POST /checkout", () => {
    it("should return session ID and URL for valid cart", async () => {
      const response = await request(app)
        .post("/checkout")
        .send({
          cartItems: [
            { name: "Item 1", price: 1000, quantity: 2 },
            { name: "Item 2", price: 500, quantity: 1 },
          ],
        });

      // expect a status code 200 with session details
      expect(response.status).toBe(200);
      expect(response.body.id).toBe("sess_123");
      expect(response.body.url).toMatch(/stripe\.com/);
    });

    it("should return 400 if cart is empty", async () => {
      const response = await request(app).post("/checkout").send({
        cartItems: [],
      });

      //   expect a 400 status code
      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/cart is empty/i);
    });

    // override stripe mock for this test
    it("should return 500 on Stripe error", async () => {
      const Stripe = (await import("stripe")).default;
      Stripe.mockImplementationOnce(() => ({
        checkout: {
          sessions: {
            create: jest.fn().mockRejectedValue(new Error("Stripe error")),
          },
        },
      }));

      const response = await request(app)
        .post("/checkout")
        .send({
          cartItems: [{ name: "Item", price: 1000, quantity: 1 }],
        });

      // expect a status code of 500
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Stripe error");
    });
  });

  //   test for get checkout success
  describe("GET /checkout/success", () => {
    it("should clear cart and render success if logged in", async () => {
      //
      const agent = request.agent(app);

      // fake route used
      await agent.get("/set-session").then((res) => {
        res.req.session = { user: { id: 1 } };
      });

      //   simulate a logged in user
      app.use((req, res, next) => {
        req.session.user = { id: 1 };
        next();
      });

      const response = await agent.get("/checkout/success");

      //   make sure that the cart was cleared for logged in user
      expect(db.default.execute).toHaveBeenCalledWith(
        "DELETE FROM cart WHERE user_id = ?",
        [1]
      );

      //   expect to get success page
      expect(app.response.render).toHaveBeenCalledWith("success");
      expect(response.status).toBe(200); // Still considered successful
    });

    it("should return 401 if user not logged in", async () => {
      const response = await request(app).get("/checkout/success");

      //   expect a 401 unauthorized code
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/not logged in/i);
    });
  });

  //   test for get checkout/cancel
  describe("GET /checkout/cancel", () => {
    it("should render cancel page", async () => {
      const response = await request(app).get("/checkout/cancel");

      //   expect cancel.ejs to be rendered
      expect(app.response.render).toHaveBeenCalledWith("cancel");
      expect(response.status).toBe(200);
    });
  });
});
