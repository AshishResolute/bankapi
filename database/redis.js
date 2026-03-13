import {createClient} from 'redis';
import dotenv from 'dotenv';
import {fileURLToPath} from 'url';
import path from 'path';


const filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filePath);

dotenv.config({path:path.join(__dirname,'../dev.env')})



console.log(process.env.REDIS_URL)
const redisClient = createClient({
    url:process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
});

redisClient.on('error',err=>console.log(`Redis Connection failed! ,Details:${err}`));

async function redisConnection(){
    await redisClient.connect();
    console.log(`Redis Connection Successfull!`)
}

redisConnection();


export default redisClient;