# Fastify Queue

_Still work in progress_

### Installation:

```
npm i fastify-queue
npm i bullmq
```

This package is an abstraction on top of [BullMQ](https://github.com/taskforcesh/bullmq)

### Use

Register the plugin

```
import fp from 'fastify-plugin';
import queue, { FastifyQueueOptions } from 'fastify-queue';

export default fp<FastifyQueueOptions>(async (fastify, opts) => {
  fastify.register(queue, {
    bullPath: '*/bull/**/*.js',
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
});
```
