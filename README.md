# Fastify Queue

Easily integrate [BullMQ](https://github.com/taskforcesh/bullmq) with Fastify. Create queues and workers through your folder structure.

_Still work in progress_

### Installation:

```
npm i fastify-queue
npm i bullmq
```

## How to use

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

The glob path `*/bull/**/*.js` will load files from `src/bull/[queue-name]/handler.js` or when using typescript it can also load from `dist/bull/[queue-name]/handler.js`

You can create a folder inside the `bull` directory (or any other name specified through the `bullPath`) and it's name will be used as the name of the BullMQ `Queue`.

If the file inside the folder exports a default function that will be used as the BullMQ `Worker`. The worker function accepts the `Job` and a fastify instance.
