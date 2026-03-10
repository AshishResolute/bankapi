import {createClient} from 'redis';

const redisClient = createClient();

redisClient.on('error',err=>console.log(`Redis Connection failed! ,Details:${err}`));

async function redisConnection(){
    await redisClient.connect();
    console.log(`Redis Connection Successfull!`)
}

redisConnection();


export default redisClient;