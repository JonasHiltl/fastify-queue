# Fastify Queue

Plugin to easily intergrate BullMQ into fastify through file based Queue/Worker creation.

## Install

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

## Worker Function

This is an example for a Worker function that accepts a fastify instance and a `BullMQ` job. Needs to be the default export.

```typescript
import { FastifyInstance } from 'fastify';
import { Job } from 'bullmq';

interface AuthData {
  id: string;
  username?: string;
  email?: string;
}

const authWorker = async (
  fastify: FastifyInstance,
  job: Job<AuthData, any, string>
) => {
  const { id, email, username } = job.data;

  switch (job.name) {
    case 'create':
      break;
    case 'update':
      // handle jobs based on job name
      break;
    case 'delete':
      break;
    default:
      break;
  }
};

export default authWorker;
```

### Queue & Worker Options

You can export two addittional variables besides your Worker Function named `queueConfig` and `workerConfig`. They are of type [QueueOptions](https://github.com/taskforcesh/bullmq/blob/dd7efc3390e4a9a90f1b3ee0c3e3c74deb1f0369/docs/gitbook/api/bullmq.queueoptions.md) and [WorkerOptions](https://github.com/taskforcesh/bullmq/blob/dd7efc3390e4a9a90f1b3ee0c3e3c74deb1f0369/docs/gitbook/api/bullmq.workeroptions.md) and if exist can be used to configure addtional options supported by `BullMQ`.

```typescript
export const queueConfig: QueueOptions = {
  defaultJobOptions: {
    removeOnComplete: true,
  },
};

export const workerConfig: WorkerOptions = {
  autorun: true,
  // connection would override default connection defined in plugin options
};
```

## Typescript

In order to have typing for the fastify instance, you should follow the example below:
This is the typing for the folder structure above if each file exports a worker function

```typescript
declare module 'fastify' {
  export interface FastifyInstance {
    queues: {
      profile: Queue<ProfileData, any, string>;
      auth: Queue<AuthData, any, string>;
    };
    workers: {
      profile: Queue<ProfileData, any, string>;
      auth: Worker<AuthData, any, string>;
    };
  }
}
```
