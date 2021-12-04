# Fastify Queue

Easily integrate [BullMQ](https://github.com/taskforcesh/bullmq) with Fastify. Create queues and workers through your folder structure.

_Still work in progress_

### Installation:

```
npm i fastify-queue
npm i bullmq
```

### Use

Register the plugin

```typescript
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
