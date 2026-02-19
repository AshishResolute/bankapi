import request from "supertest";
import { jest, describe, it, expect, afterAll } from "@jest/globals";
import app from "../routes/main.js";
import db from "../database/connection.js";

// just practicing

db.query = jest.fn();
db.connect = jest.fn();
// jest.mock('../database/connection.js', () => ({
//   query: jest.fn(),
//   connect: jest.fn()
// }));

afterAll(async () => {
  await db.end();
});
describe("POST /auth/login", () => {
  it("should return 400 if email is invalid", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "notanemail", password: "Test@1234" });

    expect(res.status).toBe(400);
  });

  it("should return 404 if user not found", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@test.com", password: "Wrong123!" });

    expect(res.status).toBe(404);
  });

  it("should return 400 if user enters wrong Password", async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 1, email: "Test@jest.com" }],
    });
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ password_hash: "!@@#%34454hash" }],
    });
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "Test@jest.com", password: "Wrong123!" });

    expect(res.status).toBe(400);
  });

  it("should return a token with Successfull Login request", async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ email: "some@test.com", id: 1 }],
    });
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [
        {
          password_hash:
            "$2b$10$9BeAHB6231rQedtmsuSqFuihV9PioPTHZh6TueexxIj3Z1z.YZiFO",
        },
      ],
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "some@test.com", password: "somePassword!23" });

    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});

describe("POST /auth/signUp", () => {
  it("should give 400 status if user input Validation fails", async () => {
    const res = await request(app).post("/auth/signUp").send({
      email: "sometest.com",
      userName: "Ash",
      password: "Ash@12345",
      confirmPassword: "Ash@12345",
      phoneNo: "1234567891",
    });

    console.log(res.body);
    expect(res.status).toBe(400);

    expect(res.body).toHaveProperty("Message");
  });

  it("should return 200 on successful signup", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    db.connect = jest.fn().mockResolvedValue(mockClient);
    db.query = jest.fn().mockResolvedValueOnce({ rowCount: 0 });
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({});

    const res = await request(app).post("/auth/signUp").send({
      email: "ash@gmail.com",
      userName: "Ash",
      password: "Ash@123456789",
      confirmPassword: "Ash@123456789",
      phoneNo: "1234567890",
    });

    console.log(`Error Message`);
    console.log(res.body);
    expect(res.status).toBe(200);
  });
});
