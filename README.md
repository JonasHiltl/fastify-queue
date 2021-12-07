# Fastify Queue

Plugin to easily intergrate BullMQ into fastify through file based Queue/Worker creation.

### Install

```
npm i fastify-queue
npm i bullmq
```

## Usage

```typescript
import fp from 'fastify-plugin';
import queue, { FastifyQueueOptions } from 'fastify-queue';
import * as IORedis from 'ioredis';

export default fp<FastifyQueueOptions>(async (fastify, opts) => {
  const connection = new IORedis({
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  fastify.register(queue, {
    bullPath: '*/bull/**/*.js',
    connection: connection,
  });
});
```

#### Specify `bullPath`

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
