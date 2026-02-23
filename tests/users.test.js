import request from "supertest";
import { jest, describe, it, afterAll, test } from "@jest/globals";
import db from "../database/connection.js";
import app from "../routes/main.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filePath);

dotenv.config({ path: path.join(__dirname, "../dev.env") });

const testToken = jwt.sign(
  { id: 1, email: "users@test.com" },
  process.env.JWT_KEY,
  { expiresIn: "1h" },
);

db.query = jest.fn();
db.connect = jest.fn();

afterAll(async () => {
  await db.end();
});

describe("DELETE /users/deleteUser", () => {
  it("should return 200 and delete users account successfully!", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete("/users/deleteUser")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty("Message");
  });

  it("Should return 400 when user is not found", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete("/users/deleteUser")
      .set("Authorization", `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("Message");
  });

  describe("POST /users/updatePassword", () => {
    it("Should return 400 status for failed input validation for email and password", async () => {
      const res = await request(app)
        .patch("/users/updatePassword")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ email: "usersTest.com", password: "123Ash" });

      console.log(res.body);
      expect(res.status).toBe(400);
    });

    it("should return 200 on successfully updating Password", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .patch("/users/updatePassword")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ email: "users@test.com", password: `Testuser23!` });

      console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("Message");
    });

    it("should return 400 if password Updation fails", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .patch("/users/updatePassword")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ email: "someuser@test.com", password: "testMy!@#122" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("Message");
    });
  });
});

describe('GET /users/debitHistory',()=>{


  it("should return 400 for Invalid query Details",async()=>{
    const res = await request(app)
    .get("/users/debitHistory?page=2&&limit=-1")
    .set("Authorization",`Bearer ${testToken}`)

     console.log(res.body)
    expect(res.status).toBe(400);

  })

  it("Should return 200 status with the users debit History",async()=>{
    db.query.mockResolvedValueOnce({rowCount:1})

    const res = await request(app)
    .get("/users/debitHistory?page=1")
    .set("Authorization",`Bearer ${testToken}`)

    expect(res.status).toBe(200)
    // expect(Array.isArray(res.body)).toBe(true)
  })

  it("should return 404 if transaction not Found",async()=>{


    db.query.mockResolvedValueOnce({rowCount:0})

    const res = await request(app)
    .get("/users/debitHistory?page=4")
    .set("Authorization",`Bearer ${testToken}`)

    expect(res.status).toBe(404)
  })
})

describe("GET /users/creditTransactions",()=>{


  it("should return 400 is invalid query details provided",async()=>{
    const res = await request(app)
    .get("/users/creditTransactions?page=-1")
    .set("Authorization",`Bearer ${testToken}`)

    expect(res.status).toBe(400)
  })

  it("should return 200 with credit History of user",async()=>{
    db.query.mockResolvedValueOnce({rowCount:1})

    const res = await request(app)
    .get("/users/creditTransactions?page=1")
    .set("Authorization",`Bearer ${testToken}`)

    expect(res.status).toBe(200)
  })

  it("should return 404 if user Transaction not found",async()=>{
    db.query.mockResolvedValueOnce({rowCount:0})

    const res = await request(app)
    .get("/users/creditTransactions?page=1")
    .set("Authorization",`Bearer ${testToken}`)

    expect(res.status).toBe(404)
  })
})
