// const checkDetails=(email,userName,PhoneNo)=>{
//     console.log(email)
//     if(email.trim()==='') return `Email cant be Empty`
//     if(userName.trim()==='') return `userName cant be Empty`
//     if(PhoneNo.trim()==='') return `PhoneNo cant be Empty`
//     if(!email.includes('@')) return `Enter an valid Email`
//     if(userName.length<3) return `userName must contain atleast 3 characters`
// }
// export default checkDetails

import express from 'express';
import fs from 'fs';
import PDFDocument from 'pdfkit';
const app = express.Router()

router.get('/getPdf',async(req,res)=>{
const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('ex.pdf'));

doc.font('Times-Roman')
.fontSize(16)
.text('Testing pdf generation using PDFkit')


doc.end()
})
