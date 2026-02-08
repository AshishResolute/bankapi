import express from 'express'
import morgan from 'morgan'
import auth from './auth.js';
import users from './users.js';
const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use('/auth',auth)
app.use('/users',users)


// creating 8 digit random number

export default app