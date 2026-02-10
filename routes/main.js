import express from 'express'
import morgan from 'morgan'
import auth from './auth.js';
import users from './users.js';
import transactions from './transactions.js';
const app = express()


app.get('/health',(req,res)=>{
    res.status(200).json({Message:`Services Running,${new Date()}`})
})

app.use(express.json())
app.use(morgan('dev'))
app.use('/auth',auth)
app.use('/users',users)
app.use('/transactions',transactions)


export default app