import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Queue, Worker } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';
import * as fg from 'fast-glob';
import * as path from 'path';

export interface FastifyQueueOptions extends RedisOptions {
  bullPath: string;
}

/**
 * Load every worker function inside a specified directory
 * @param {Object} fastify - Fastify instance
 * @param {Object} opts - Plugin's options
 */
const fastifyBullMQ = async (
  fastify: FastifyInstance,
  opts: FastifyQueueOptions
) => {
  const connection = new IORedis(opts);
  const queues = {};
  const workers = {};

  const files = fg.sync(opts.bullPath);

  files.forEach(async (filePath) => {
    const parts = filePath.split('/');
    const queueName = parts[parts.length - 2];

    const worker = await import(path.resolve(filePath));

    (queues as any)[queueName] = new Queue(queueName, {
      connection,
    });
    fastify.log.info(`Created a queue called ${queueName}`);

    // Show an error if a file for a worker is created but no function is exported as default
    // This also causes BullMQ to throw a TypeError, because the worker.default function is an empty object
    if (
      Object.keys(worker.default).length === 0 &&
      worker.default.constructor === Object
    ) {
      fastify.log.warn(
        `The worker ${queueName} does not export a default function`
      );
    } else {
      (workers as any)[queueName] = new Worker(queueName, worker.default, {
        connection,
      });
      fastify.log.info(`Created a worker for the queue ${queueName}`);
    }
  });

  fastify.decorate('queues', queues);
  fastify.decorate('workers', workers);
};

export default fp<FastifyQueueOptions>(fastifyBullMQ, {
  name: 'fastify-queue',
});
