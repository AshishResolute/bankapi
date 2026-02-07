import express from 'express'
import app from '../routes/main.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
const currentFile = fileURLToPath(import.meta.url)
const dirname = path.dirname(currentFile)
dotenv.config({path:path.join(dirname,'../devEnv.env')})

const PORT=process.env.SERVER_DEV_PORT||3000

app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)
})

