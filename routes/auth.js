import express from "express";
import joi from "joi";
import db from "../database/connection.js";
import newAccountNo from "../helperFunctions/AccountNo.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const filePath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filePath);
dotenv.config({ path: path.join(dirname, "../dev.env") });

console.log(`key is ${process.env.JWT_KEY}`);
const router = express.Router();

const userSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  userName: joi.string().min(3).max(30).required(),
  password: joi
    .string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lower case character,uppercase and one special character",
    }),
  confirmPassword: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords Dont match,Try Again!" }),
  phoneNo: joi.string().pattern(/^[0-9]{10}$/),
});

router.post("/signUp", async (req, res) => {
  let client = await db.connect();
  try {
    let { error, value } = userSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ Message: error.details.map((err) => err.message) });
    let { email, userName, password, phoneNo } = req.body;
    let accountNo = await newAccountNo();
    if (accountNo) {
      await client.query("begin");
      let result1 = await client.query(
        "insert into users(account_no,email,user_name,phone_no) values($1,$2,$3,$4) returning id",
        [accountNo, email, userName, phoneNo],
      );
      let id = result1.rows[0]?.id;
      let hashedPassword = await bcrypt.hash(password, 10);
      if (id) {
        let result2 = await client.query(
          `insert into userDetails(user_id,password_hash) values($1,$2)`,
          [id, hashedPassword],
        );
        let result3 = await client.query(
          `insert into user_balance(user_id) values($1)`,
          [id],
        );
        if (result3.rowCount === 0)
          return res
            .status(500)
            .json({ Message: "Account_Type not set for User,Try Again!" });
        await client.query("commit");
        res.status(200).json(`Sign Up Successfull!`);
      } else {
        res.status(400).json({ message: "SignUp Failed,Try Again!" });
      }
    }
  } catch (error) {
    await client.query("rollback");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

const validateLoginInput = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi
    .string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must have atleast one Uppercase,lowerCase and special character",
    }),
});

router.post("/login", async (req, res) => {
  try {
    let { error, value } = validateLoginInput.validate(req.body);
    if (error)
      return res.status(400).json(error.details.map((err) => err.message));
    let { email, password } = value;
    let findUser = await db.query(`select email,id from users where email=$1`, [
      email,
    ]);
    if (!(findUser.rowCount > 0))
      return res.status(404).json({ message: `User not found,Try Again!` });
    let hashedPassword = await db.query(
      `select password_hash from userDetails where user_id=$1`,
      [findUser.rows[0].id],
    );
    let verifyPassword = await bcrypt.compare(
      password,
      hashedPassword.rows[0].password_hash,
    );
    if (!verifyPassword)
      return res
        .status(400)
        .json({ message: `Passwords Dont Match,Try Again or Reset Password!` });
    let token = jwt.sign(
      { id: findUser.rows[0].id, email: findUser.rows[0].email },
      process.env.JWT_KEY,
      { expiresIn: "15m" },
    );
    if (!token)
      return res
        .status(500)
        .json({ message: `Internal server error!,token Generation Failed` });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ Message: err.message });
  }
});

export default router;
