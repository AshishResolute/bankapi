import crypto from 'crypto';


let createTransactionId = ()=>{
    return crypto.randomBytes(16).toString('hex');
}



export default createTransactionId;