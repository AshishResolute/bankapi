import { Queue } from "bullmq";

const connectionConfig = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null, 
};


const emailQueue = new Queue("email-service", { connection: connectionConfig });

export default emailQueue;
