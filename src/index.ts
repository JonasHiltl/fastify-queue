import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Queue, Worker, ConnectionOptions, Job } from 'bullmq';
import * as fg from 'fast-glob';
import path from 'path';

export declare type FastifyQueueOptions = {
  bullPath: string;
  connection: ConnectionOptions;
};

/**
 * Load every worker function inside a specified directory
 * @param {Object} fastify - Fastify instance
 * @param {Object} opts - Plugin's options
 */
const fastifyBullMQ = async (
  fastify: FastifyInstance,
  opts: FastifyQueueOptions
) => {
  const queues = {};
  const workers = {};
  // Detect BullMQ version by checking if Queue supports certain properties
  const isBullMQ5 = Queue.prototype.hasOwnProperty('isPaused');
  
  fastify.log.info(`Using BullMQ version ${isBullMQ5 ? '5.x' : '1.x'} compatibility mode`);

  const files = fg.sync(opts.bullPath);

  for (const filePath of files) {
    const parts = filePath.split('/');
    // the queue name is defined by the name of the directory in which the files are
    const queueName = parts[parts.length - 2];

    const {
      default: worker,
      queueConfig,
      workerConfig,
    } = await import(path.resolve(filePath));

    (queues as any)[queueName] = new Queue(queueName, {
      connection: opts.connection,
      ...(queueConfig && queueConfig),
    });
    fastify.log.info(`Created the queue ${queueName}`);

    if (!worker) {
      fastify.log.warn(
        `The queue ${queueName} does not have a worker function`
      );
    } else {
      // Worker implementation compatible with both BullMQ 1.x and 5.x
      (workers as any)[queueName] = new Worker(
        queueName,
        async (job: Job) => {
          try {
            return await worker(fastify, job);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            fastify.log.error(`Error processing job ${job.id} in queue ${queueName}: ${errorMessage}`);
            throw error;
          }
        },
        {
          connection: opts.connection,
          ...(workerConfig && workerConfig),
        }
      );
      fastify.log.info(`Created a worker for the queue ${queueName}`);
    }
  }

  fastify.decorate('queues', queues);
  fastify.decorate('workers', workers);
};

export default fp<FastifyQueueOptions>(fastifyBullMQ, {
  name: 'fastify-queue',
});
