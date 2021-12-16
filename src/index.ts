import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Queue, Worker, ConnectionOptions } from 'bullmq';
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

  const files = fg.sync(opts.bullPath);

  files.forEach(async (filePath) => {
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
      (workers as any)[queueName] = new Worker(
        queueName,
        (job) => worker(fastify, job),
        {
          connection: opts.connection,
          ...(workerConfig && workerConfig),
        }
      );
      fastify.log.info(`Created a worker for the queue ${queueName}`);
    }
  });

  fastify.decorate('queues', queues);
  fastify.decorate('workers', workers);
};

export default fp<FastifyQueueOptions>(fastifyBullMQ, {
  name: 'fastify-queue',
});
