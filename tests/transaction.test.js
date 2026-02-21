import request from "supertest";
import { jest, describe, it, expect, afterAll } from "@jest/globals";
import app from "../routes/main.js";
import db from "../database/connection.js";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileName);

dotenv.config({ path: path.join(__dirname, "../dev.env") });
console.log(process.env.SERVER_DEV_PORT);

const testToken = jwt.sign(
  { id: 1, email: "test@test.com" },
  process.env.JWT_KEY,
  { expiresIn: "1h" },
);

db.connect = jest.fn();
db.query = jest.fn();

jest.mock("../helperFunctions/transactionId.js", () => ({
  default: jest.fn().mockReturnValue("MockTRansactionId123346"),
}));
afterAll(async () => {
  await db.end();
});
describe("POST /transactions/credit", () => {
  it("should return 400 if inCorrect credit amount", async () => {
    const res = await request(app)
      .post("/transactions/credit")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ creditAmount: -1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 500 if transactionId generation fails", async () => {
    const res = await request(app)
      .post("/transactions/credit")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(500);
    // expect(res.body).toHaveProperty("Message");
  });

  it("should return 200 and credit the amount", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ balance: 1000 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      //   .mockResolvedValueOnce({rowCount:1})
      .mockResolvedValueOnce({});
    const res = await request(app)
      .post("/transactions/credit")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ creditAmount: 500 });

    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("Balance");
  });
});

describe("POST /transactions/debit", () => {
  it("should return 400 for Incorrect Debit Amount", async () => {
    const res = await request(app)
      .post("/transactions/debit")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ debitAmount: 0 });

    expect(res.status).toBe(400);
  });

  it("should return 200 status and debit amount from user account", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ balance: 1000 }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ balance: 900 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({});

    const res = await request(app)
      .post("/transactions/debit")
      .set("Authorization", `Bearer ${testToken}`)
      .send({ debitAmount: 100 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("balance");
  });

  it("should return 400 for insufficient Balance while debiting from Account",async()=>{
    const mockClient={
        query:jest.fn(),
        release:jest.fn()
    }
    db.connect = jest.fn().mockResolvedValue(mockClient);

    mockClient.query
    .mockResolvedValueOnce({})
    .mockResolvedValueOnce({rowCount:1,rows:[{balance:500}]})
    .mockResolvedValueOnce({})

    const res = await request(app)
    .post("/transactions/debit")
    .set("Authorization",`Bearer ${testToken}`)
    .send({debitAmount:501})

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message")
  })
});
