// import request from "supertest";
// import { describe, it, expect, afterAll } from "@jest/globals";
// import app from "../routes/main.js";
// import db from "../database/connection.js";

// describe(`GET /health`, () => {
//   afterAll(async () => {
//     await db.end();
//   });

//   it("should return 200 status if the server is running", async () => {
//     const response = await request(app).get("/health");

//     expect(response.status).toBe(200);

//     expect(response.body).toHaveProperty("Message");
//   });
// });

// describe("Simple Mathematical Test", () => {
//   it("should check if 2 + 2 = 4", () => {
//     expect(2 + 2).toBe(5);
//   });
// });

// describe("Simple String Test", () => {
//   it("check if a given string is pallindrome", () => {
//     let str = "aba";
//     let revStr = str.split("").reverse().join("");
//     expect(revStr).toBe(str);
//   });
// });

// describe("External Website status check", () => {
//   it("should check the status of Google", async () => {
//     const response = await request("https://www.google.com").head("/");
//     expect(response.status).toBe(200);
//   });
// });
