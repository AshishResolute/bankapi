import express from "express";
import verifyToken from "../middlewears/verifyToken.js";
import createTransactionId from "../helperFunctions/transactionId.js";
import db from "../database/connection.js";
import joi from "joi";

const router = express.Router();

let verifyTransactionId = joi.string().required();
let verifyCreditAmount = joi.object({
    creditAmount:joi.number().positive().required()
});

router.post('/credit',verifyToken,async(req,res)=>{
    let client = await db.connect();
    let user_id = req.user.id;
    let transactionId = createTransactionId();
    try{
        let {error,value} = verifyCreditAmount.validate(req.body);
        if(error) return res.status(400).json({message:`Enter an valid Amount!`});
        let {creditAmount} = value;
        let {error:idError} = verifyTransactionId.validate(transactionId);
        if(idError) return res.status(500).json({Message:`Transaction Failed,Server Error`});
        await client.query('begin');
        let updateBalance = await client.query(`update user_balance set balance = balance +$1 where user_id =$2 returning balance`,[creditAmount,user_id]);
        if(updateBalance.rowCount===0){
            await client.query('rollback');
            return res.status(404).json({Message:`User Account not Found`});
        }
        let insertTransactionDetails = await client.query(`insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,[user_id,transactionId,'Credit','Success']); 
        await client.query('commit');
        res.status(200).json({Message:`Amount of ${creditAmount} Credited in your Account`,Balance:updateBalance.rows[0].balance});
    }
    catch(error)
    {
        await client.query('rollback');
        console.log({Message:error.message});
        try{
            let failedTransactionLog = await db.query(`insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,[user_id,transactionId,'Credit','Failed'])
        }catch(logError)
        {
            console.log(logError.message);
        }
        if (!res.headersSent) {
            return res.status(500).json({ Message: "Internal Server Error" });
        }
    }
    finally{
        client.release()
    }
});


export default router;


