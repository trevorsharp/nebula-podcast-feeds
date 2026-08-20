type Task = { id: string; execute: () => Promise<void>; isRunning: boolean };

class AsyncQueue {
  #tasks: Task[] = [];

  constructor(private readonly numberOfConcurrentTasks: number) {}

  push(task: Pick<Task, 'id' | 'execute'>, options?: { addToFrontOfQueue?: boolean }) {
    if (this.#tasks.some(({ id }) => id === task.id)) return;

    const queuedTask = { ...task, isRunning: false };
    if (options?.addToFrontOfQueue) this.#tasks.unshift(queuedTask);
    else this.#tasks.push(queuedTask);

    this.#startNextTasks();
  }

  #startNextTasks() {
    const numberOfRunningTasks = this.#tasks.filter(({ isRunning }) => isRunning).length;
    const numberOfAvailableSlots = this.numberOfConcurrentTasks - numberOfRunningTasks;

    this.#tasks
      .filter(({ isRunning }) => !isRunning)
      .slice(0, numberOfAvailableSlots)
      .forEach((task) => {
        task.isRunning = true;
        task
          .execute()
          .catch(() => undefined)
          .finally(() => {
            this.#tasks = this.#tasks.filter(({ id }) => id !== task.id);
            this.#startNextTasks();
          });
      });
  }
}

export default AsyncQueue;
