export type JobHandler<T = unknown> = (payload: T) => Promise<void>;

export interface JobQueue {
  register<T>(name: string, handler: JobHandler<T>): void;
  enqueue<T>(name: string, payload: T): void;
}

/** In-process queue. Extract jobs run after the HTTP response is sent. */
export function createInProcessQueue(): JobQueue {
  const handlers = new Map<string, JobHandler>();

  return {
    register(name, handler) {
      handlers.set(name, handler as JobHandler);
    },
    enqueue(name, payload) {
      const handler = handlers.get(name);
      if (!handler) {
        console.error(`no handler registered for job ${name}`);
        return;
      }
      setImmediate(() => {
        handler(payload).catch((err) => {
          console.error(`job ${name} failed`, err);
        });
      });
    },
  };
}
