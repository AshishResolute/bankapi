import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';


const filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filePath);

dotenv.config({path:path.join(__dirname,'../dev.env')})

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})

export default transporter