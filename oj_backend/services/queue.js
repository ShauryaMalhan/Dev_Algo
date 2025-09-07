import { Queue } from 'bullmq';

const submissionQueue = new Queue('submissions', {
    connection: {
        host: 'redis_queue',
        port: 6379
    }
});

export default submissionQueue;