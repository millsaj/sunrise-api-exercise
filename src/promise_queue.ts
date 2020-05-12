class PromiseQueue<T> {
  private queue: Function[] = [];

  constructor(private concurrencyLimit: number) {}

  addPromise(wrapper: Function): void {
    this.queue.push(wrapper);
  }

  private async handleNextPromise(returnValues: T[] = []): Promise<T[]> {
    const wrapper = this.queue.shift();

    if (wrapper) {
      returnValues.push(await wrapper());
      return this.handleNextPromise(returnValues);
    }

    return returnValues;
  }

  async handleAll(): Promise<T[]> {
    const runners = [];

    for (let i = 0; i < this.concurrencyLimit; i += 1) {
      runners.push(this.handleNextPromise());
    }

    return (await Promise.all(runners)).flat(1);
  }
}

export default PromiseQueue;
