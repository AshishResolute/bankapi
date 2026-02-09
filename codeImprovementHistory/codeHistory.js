// router.post("/credit", verifyToken, async (req, res) => {
//   let client = await db.connect();
//   try {
//     let user_id = req.user.id;
//     let transaction_id = createTransactionId();
//     let { error, value } = verifyTransactionId.validate(transaction_id);
//     if (error)
//       return res
//         .status(500)
//         .json({
//           message: `Transaction_id generation failed`,
//           Details: error.details.map((err) => err.message),
//         });
//     await client.query("begin");
//     let initialBalance = await client.query(
//       `select balance from user_balance where user_id=$1`,
//       [user_id],
//     );
//     let userInitialBalance = parseFloat(initialBalance.rows[0].balance);
//     console.log(userInitialBalance);
//     let { creditAmount } = req.body;
//     console.log(creditAmount);
//     let addAmount = creditAmount + userInitialBalance;
//     let result = await client.query(
//       `update user_balance set balance =$1 where user_id=$2`,
//       [addAmount, user_id],
//     );
//     let checkBalance = await client.query(
//       `select balance from user_balance where user_id=$1`,
//       [user_id],
//     );
//     if (checkBalance.rows[0].balance == addAmount) {
//       let updateDetails = await client.query(
//         `insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,
//         [user_id, transaction_id, "Credit", "Success"],
//       );
//       if (updateDetails.rowCount > 0) {
//         await client.query("commit");
//         res
//           .status(200)
//           .json({
//             Message: `Amount of ${creditAmount} has been credited in your Account`,
//           });
//       }
//     } else {
//       let updateFailedPaymentDetails = await client.query(
//         `insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,
//         [user_id, transaction_id, "Credit", "Failed"],
//       );
//       if (updateFailedPaymentDetails.rowCount > 0) {
//         await client.query("commit");
//         res
//           .status(402)
//           .json({ message: `Payment Failed Amount not credited,Try again` });
//       }
//     }
//   } catch (error) {
//     await client.query("rollback");
//     console.log(`ErrorDetails:${error.message}`);
//     res.status(500).json({ Message: `Internal Server Error` });
//   } finally {
//      client.release();
//   }
// });

//            LEARNT ABOUT RACE CONDITIONS
// USED THIS FROM GEMINI AND UNDERSTOOD JOI VALIDATION JUST RETURNS ERROR AND VALUE FOR OBJECT DESTRUCTION AND USING ATOMIC SQL UPDATES IN POSTGRES

// BETTER CODE 

// router.post('/credit',verifyToken,async(req,res)=>{
//     let client = await db.connect();
//     let user_id = req.user.id;
//     let transactionId = createTransactionId();
//     try{
//         let {error,value} = verifyCreditAmount.validate(req.body);
//         if(error) return res.status(400).json({message:`Enter an valid Amount!`});
//         let {creditAmount} = value;
//         let {error:idError} = verifyTransactionId.validate(transactionId);
//         if(idError) return res.status(500).json({Message:`Transaction Failed,Server Error`});
//         await client.query('begin');
//         let updateBalance = await client.query(`update user_balance set balance = balance +$1 where user_id =$2 returning balance`,[creditAmount,user_id]);
//         if(updateBalance.rowCount===0){
//             await client.query('rollback');
//             return res.status(404).json({Message:`User Account not Found`});
//         }
//         let insertTransactionDetails = await client.query(`insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,[user_id,transactionId,'Credit','Success']); 
//         await client.query('commit');
//         res.status(200).json({Message:`Amount of ${creditAmount} Credited in your Account`,Balance:updateBalance.rows[0].balance});
//     }
//     catch(error)
//     {
//         await client.query('rollback');
//         console.log({Message:error.message});
//         try{
//             let failedTransactionLog = await db.query(`insert into user_transaction_details(user_id,transaction_id,user_transaction_type,user_transaction_status) values($1,$2,$3,$4)`,[user_id,transactionId,'Credit','Failed'])
//         }catch(logError)
//         {
//             console.log(logError.message);
//         }
//         if (!res.headersSent) {
//             return res.status(500).json({ Message: "Internal Server Error" });
//         }
//     }
//     finally{
//         client.release()
//     }
// });