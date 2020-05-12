import PromiseQueue from 'src/promise_queue';

describe('PromiseQueue', () => {
  let maxConcurrentPromises: number;
  let concurrentPromises: number;
  let promisesComplete: number;

  beforeEach(() => {
    maxConcurrentPromises = 0;
    concurrentPromises = 0;
    promisesComplete = 0;
  });

  function sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function createPromise(): Promise<void> {
    concurrentPromises += 1;

    await sleep(100);

    if (concurrentPromises > maxConcurrentPromises) {
      maxConcurrentPromises = concurrentPromises;
    }

    concurrentPromises -= 1;
    promisesComplete += 1;
  }

  test('handling a queue of 3 promises 1 at a time', async () => {
    const queue = new PromiseQueue(1);

    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());

    await queue.handleAll();

    expect(maxConcurrentPromises).toEqual(1);
    expect(promisesComplete).toEqual(3);
  });

  test('handling a queue of 6 promises 3 at a time', async () => {
    const queue = new PromiseQueue(3);

    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());

    await queue.handleAll();

    expect(maxConcurrentPromises).toEqual(3);
    expect(promisesComplete).toEqual(6);
  });

  test('handling a queue of 2 promises 3 at a time', async () => {
    const queue = new PromiseQueue(3);

    queue.addPromise(() => createPromise());
    queue.addPromise(() => createPromise());

    await queue.handleAll();

    expect(maxConcurrentPromises).toEqual(2);
    expect(promisesComplete).toEqual(2);
  });

  test('returns the results of the promises', async () => {
    const queue = new PromiseQueue(2);

    queue.addPromise(() => (async (): Promise<number> => 14)());
    queue.addPromise(() => (async (): Promise<number> => 32)());

    const returnValues = await queue.handleAll();

    expect(returnValues).toEqual(expect.arrayContaining([14, 32]));
  });
});
