import { Worker } from "bullmq";
import transporter from "../mailService/mailTrapSetup.js";


const redisConnection={
    host:'127.0.0.1',
    port:6379,
    maxmaxRetriesPerRequest:null
}
const emailWorker = new Worker(
  "email-service",
  async (job) => {
    const {userMail,transactionType,amount} = job.data;
    console.log(`Picking up the Work with jobId:${job.id},details:${job.data}`);
   await transporter.sendMail({
    from:'Banking-Api <support@bankapi.com>',
    to:userMail,
    subject:'Transaction Successfull!',
    text:`Amount of ${amount} ${transactionType} from your Account`
   })

   console.log(`Mail Sent for Id:${job.id}`)

  },
  {connection:redisConnection},
);

emailWorker.on("completed", (job) =>
  console.log(`job completed with Id:${job.id}`),
);

emailWorker.on("failed", (job,err) => console.log(`Job Failed with ID:${job.id},errDetails:${err.message}`));
