import express from 'express'
import morgan from 'morgan'
import auth from './auth.js'
const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use('/auth',auth)



// creating 8 digit random number


export default app