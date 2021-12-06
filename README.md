# Fastify Queue

Easily integrate [BullMQ](https://github.com/taskforcesh/bullmq) with Fastify. Create queues and workers through your folder structure.

_Still work in progress_

### Installation:

```
npm i fastify-queue
npm i bullmq
```

## How to use

1. Register the plugin

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

2. Specify `bullPath`:

   The `bullPath` is a glob path and it specifies in which directory your worker functions and queues can be found.

For example with the folder structure below, we would create a `Queue` with the name of `user` and `auth`.

```
src
  - bull
    - user
        profile.worker.ts
    - auth
        auth.worker.ts
```

The name of the file inside the subdiretories is irrelevant. The name of the Queue is based on the subdirectories name.

If the file inside the subdiretories do not export a default function, it will just create a `Queue` with the name of the subdiretory. If a defualt function export exists it will be used as the `Worker`.
