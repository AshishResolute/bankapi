import { Worker } from "bullmq";



const redisConnection={
    host:'127.0.0.1',
    port:6379,
    maxmaxRetriesPerRequest:null
}
const emailWorker = new Worker(
  "email-service",
  async (job) => {
    console.log(`Picking up the Work with jobId:${job.id},details:${job.data.Testing}`);
  },
  {connection:redisConnection},
);

emailWorker.on("completed", (job) =>
  console.log(`job completed with Id:${job.id}`),
);

emailWorker.on("failed", (job) => console.log(`Job Failed with ID:${job.id}`));
