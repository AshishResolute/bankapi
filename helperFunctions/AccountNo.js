import db from '../database/connection.js'
import crypto from 'crypto'
async function checkUniqueAccountNo()
{
    let isUnique=false
    let newAccountNo;
    while(!isUnique)
    {
         newAccountNo  = Math.floor((Math.random()*(99999999-10000000))+10000000);
         let foundId = await db.query(`select account_no from users where account_no=$1`,[newAccountNo])
         if(foundId.rows.length===0) isUnique=true
    }
    return newAccountNo
}

// creating a random string
console.log(crypto.randomBytes(16).toString('hex'))


export default checkUniqueAccountNo;