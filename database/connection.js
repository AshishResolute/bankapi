import dotenv from 'dotenv';
import {Pool} from 'pg'
import path from 'path';
import { fileURLToPath } from 'url';
const filePath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filePath)
dotenv.config({path:path.join(dirname,'../dev.env')})


const pool = new Pool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
})

pool.query('select now()',(err,res)=>{
    if(err) console.log(`Database connection Failed,:${err.stack}`)
        else console.log(`Database connection at:${res.rows[0].now}`)
})

export default pool


