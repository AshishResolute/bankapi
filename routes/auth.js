import express from "express";
import joi from "joi";
import db from "../database/connection.js";
import newAccountNo from "../helperFunctions/AccountNo.js";
import bcrypt from "bcrypt";
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
    console.log(req.body);
    let accountNo = await newAccountNo();
    console.log(accountNo);
    if (accountNo) {
      await client.query("begin");
      let result1 = await client.query(
        "insert into users(account_no,email,user_name,phone_no) values($1,$2,$3,$4) returning id",
        [accountNo, email, userName, phoneNo],
      );
      console.log(result1.rows[0]);
      let id = result1.rows[0]?.id;
      console.log(`Id generated is ${id}`);
      let hashedPassword = await bcrypt.hash(password, 10);
      if (id) {
        let result2 = await client.query(
          `insert into userDetails(user_id,password_hash) values($1,$2)`,
          [id, hashedPassword],
        );
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

export default router;
