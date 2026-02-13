import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import db from "../database/connection.js";
import bcrypt from "bcrypt";
import joi from "joi";
const router = express.Router();

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Delete User Account
 *     tags: [users]
 *     description: Delete User account just login and hit this route no info needed
 *     responses:
 *       200:
 *         description: Account Deleted,Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: "Account Deleted,Successfully"
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   oneOf:
 *                     - type: string
 *                     - type: array
 *                       items:
 *                         type: string
 *                   example: "Passwords don't match, try again or reset password!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */



router.delete("/deleteUser", verifyToken, async (req, res) => {
  try {
    let user_id = req.user.id;
    let result = await db.query("delete from users where id=$1", [user_id]);
    if (result.rowCount === 0)
      return res.status(400).json({ Message: "Deletion failed!" });
    res.status(200).json({ Message: "Account Deleted,Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

let validateUserInput = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi
    .string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must conatain atleast one Uppercase,one lowercase and one special character",
    }),
});
/**
 * @swagger
 * /users/updatePassword:
 *   patch:
 *     summary: Login and provide your Previous password and update it
 *     tags: [users]
 *     description: Login and reset your Password or create a new Password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *                   example: "Password Updated successfully! or Password Reset Successfull!"
 *                   description: Password Updated successfully
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   oneOf:
 *                     - type: string
 *                     - type: array
 *                       items:
 *                         type: string
 *                   example: "Passwords don't match, try again or reset password!"
 *       404:
 *         description: Passwords Don't Match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: Array
 *                   items:
 *                     type: string
 *                   example: ["Password must contain at least one uppercase character"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/updatePassword", verifyToken, async (req, res) => {
  try {
    let { error, value } = validateUserInput.validate(req.body);
    if (error)
      return res.status(400).json(error.details.map((err) => err.message));
    let user_id = req.user.id;
    let { newPassword } = value;
    let hashedPassword = await bcrypt.hash(newPassword, 10);
    let result = await db.query(
      "update userDetails set password_hash=$1 where user_id=$2",
      [hashedPassword, user_id],
    );
    if (result.rowCount === 0)
      return res.status(400).json({ Message: "PassWord Updation Failed!" });
    res.status(200).json({ Message: "Password Updated successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ Message: "Internal Server Error" });
  }
});

let querySchema = joi.object({
    page:joi.number().positive().required(),
    limit:joi.number().positive().optional()
})

router.get("/debitHistory", verifyToken, async (req, res) => {
  try {
    let {error,value} = querySchema.validate(req.query);
    if(error) return res.status(400).json({Message:`Enter Valid Query Details`});
    let {page,limit} = value;
    page = page||1;
    limit = limit||3;
    // better let {page=1,limit=3} = value , same as above logic
    let offset = (page - 1) * limit;
    let user_id = req.user.id;
    let result = await db.query(
      `select transaction_id,user_transaction_status,transaction_time from user_transaction_details where user_id=$1 and user_transaction_type=$2 order by transaction_time desc limit $3 offset $4`,
      [user_id, "Debit", limit, offset],
    );
    if (result.rowCount === 0)
      res.status(404).json({ Message: `No Transaction Found!` });
    res.status(200).json({ transactions: result.rows });
  } catch (err) {
    console.log(`Error Details:${err.message}`);
    res.status(500).json({ Message: `Internal Server Error` });
  }
});

router.get('/creditTransactions',verifyToken,async(req,res)=>{
  try{
    let user_id = req.user.id;
    let {error,value} = querySchema.validate(req.query);
    if(error) return res.status(400).json({Message:`Enter Valid Query parameters Details!`});
    let {page=1,limit=3} = value;
    let offset = (page-1)*limit
    let result = await db.query(`select transaction_id,user_transaction_type,user_transaction_status,transaction_time from user_transaction_details where user_id=$1 and user_transaction_type=$2 order by transaction_time limit $3 offset $4`,[user_id,'Credit',limit,offset]);
    if(result.rowCount===0) return res.status(404).json({Message:`No Transactions Found!`});
    res.status(200).json({Transactions:result.rows});
  }
  catch(err){
    console.log(`Error Details: ${err.details}`);
    res.status(500).json({Message:`Internal Server Error!`});
  }
})


export default router;
