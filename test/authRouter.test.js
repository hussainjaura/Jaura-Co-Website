import request from "supertest";
import express from "express";
import session from "express-session";
import authRouter from "../auth/authRouter.js";

// mock the logger to silence output during tests
jest.mock("../utils/logger.js", () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// mock the DB and models
jest.mock("../models/user.js", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../database/database.js", () => ({
  default: {
    execute: jest.fn(),
  },
}));

import User from "../models/user.js";
import db from "../database/database.js";

// setup an express instance for testing
const app = express();
// parse json
app.use(express.json());

// to setup dummy session middleware
app.use(
  session({
    secret: "test-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// move authRouter to test
app.use(authRouter);

// test for auth router
describe("Auth Router", () => {
  afterEach(() => {
    // clear all the mocks after each test to avoid cross-test pollution
    jest.clearAllMocks();
  });

  // to test the signup route
  describe("POST /signup", () => {
    it("should register a new user", async () => {
      User.findOne.mockResolvedValue(null);
      // for user creation
      User.create.mockResolvedValue({ id: 1, username: "testuser" });

      const response = await request(app).post("/signup").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      // expect back 201 code and success msg
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("user has been registered!");
    });

    // to check if user already exist
    it("should not register if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      const response = await request(app).post("/signup").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      // expect a 400 code and a feedback msg
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  // test for login route
  describe("POST /login", () => {
    it("should log in a user with correct credentials", async () => {
      const hashedPassword = await (
        await import("bcryptjs")
      ).hash("password123", 10);

      // to find a user with correct password
      User.findOne.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
      });
      // mock empty cart
      db.default.execute.mockResolvedValue([[]]);
    });

    it("should fail with invalid email", async () => {
      // to test no user found
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/login").send({
        email: "notfound@example.com",
        password: "password123",
      });
      // expect 400 bad request
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });
  });

  // test for logout route
  describe("POST /logout", () => {
    it("should destroy session and log out", async () => {
      // fake user session
      const agent = request.agent(app);

      // signup a user to create a session
      await agent
        .post("/signup")
        .send({ username: "temp", email: "temp@ex.com", password: "123456" });

      // then logout
      const res = await agent.post("/logout");
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });
  // test for session status route
  describe("GET /session", () => {
    it("should return false if not logged in", async () => {
      const res = await request(app).get("/session");
      expect(res.body.loggedIn).toBe(false);
    });
  });
});
