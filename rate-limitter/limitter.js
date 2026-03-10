import rateLimit from 'express-rate-limit';
import redisConnection from '../database/redis.js';
import RedisStore from 'rate-limit-redis';
const limitter=rateLimit({
    windowMs:2*60*1000,
    max:5,
    message:{
        statusCode:429,
        Details:`Too many Requests,Try Again Later!`
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisConnection.sendCommand(args),
        prefix:'Bank-Api-Limitter:'
    })
})

const loginLimitter=rateLimit({
    windowMs:15*60*1000,
    max:5,
    message:{
        stausCode:429,
        Details:`Too many Login Attempts,Try Later!`
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisConnection.sendCommand(args),
        prefix:"Bank-Api-login-limtter"
    })
})

export  {limitter,loginLimitter};