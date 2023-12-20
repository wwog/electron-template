/* eslint-disable @typescript-eslint/no-explicit-any */

//TODO  封装堆栈Error ，支持重试 ，取消任务 ，任务清空 ， 任务队列长度限制 ， 任务暂停 ，任务继续

export function PromiseTry<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(() => fn())
      .then(resolve)
      .catch(reject)
  })
}

export interface PatrialInnerTaskObject<R> {
  timestamp: number
  task?: Promise<R> | (() => Promise<R>)
  resolve?: (value: R) => void
  reject?: (reason?: any) => void
}

export interface AsyncQueueOption {
  /**
   * The timeout is based on the time when the queue is queued, that is, it includes the queuing waiting time.
   * If not set, it will not time out, please make sure that the task will definitely end, otherwise it will cause the queue to block.
   */
  timeout?: number
  timeoutMessage?: string
}

export interface TaskOptions {
  /**
   * Execute the task immediately.
   * if false, the task is executed only after the previous task has completed.
   * Does not affect return in stack order.
   * @default true
   */
  immediate?: boolean
}

export type InnerTaskObject<R> = Required<PatrialInnerTaskObject<R>>
/**
 * The command is executed simultaneously, and the order of execution is returned.
 * It is used to deal with the uncontrollable sequence of some asynchronous coherent tasks.
 */
export class AsyncQueue<R> {
  protected innerTaskObjects: InnerTaskObject<R>[] = []
  protected timeout?: number = 0
  protected timeoutMessage: string = ''

  constructor(option: AsyncQueueOption = {}) {
    this.innerTaskObjects = []
    this.timeout = option.timeout
    this.timeoutMessage = option.timeoutMessage ?? 'async queue task timeout'
  }

  addTask(task: () => Promise<R>, options: TaskOptions = {}) {
    const { immediate = true } = options

    // Create a new Promise that will resolve when the task is complete, but its resolution will be delayed until all previous tasks are completed.
    const taskPromise = new Promise<R>((resolve, reject) => {
      const catchTask = () => {
        //这个函数是为了捕获task的异常，如果task执行出错，会导致队列卡死或程序中断
        return PromiseTry(task).catch(reject)
      }

      // Add the task to the queue
      this.innerTaskObjects.push({
        timestamp: Date.now(),
        resolve,
        reject,
        task: immediate ? (catchTask() as Promise<R>) : (catchTask as () => Promise<R>),
      })
      // If there is only one task in the queue, execute it immediately
      if (this.innerTaskObjects.length === 1) {
        this.executeNextTask()
      }
    })

    return taskPromise
  }

  private executeNextTask() {
    if (this.innerTaskObjects.length === 0) {
      return
    }
    const { task, resolve, reject, timestamp } = this.innerTaskObjects[0]

    const promise = typeof task === 'function' ? task() : task
    const promises = [promise]
    const now = Date.now()
    const timeDiff = now - timestamp
    if (this.timeout) {
      const timeoutPromise = new Promise<R>((_, reject) => {
        if (timeDiff >= this.timeout) {
          return reject(this.timeoutMessage)
        }
        const timeout = this.timeout - timeDiff
        setTimeout(() => {
          reject(this.timeoutMessage)
        }, timeout)
      })
      promises.push(timeoutPromise)
    }

    Promise.race(promises)
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
      .finally(() => {
        this.innerTaskObjects.shift()
        this.executeNextTask()
      })
  }
}

/* const asyncQueue = new AsyncQueue({
  timeout: 1000,
  timeoutMessage: 'timeout for async queue task lala',
})

const task1 = () => {
  console.log('task1 running')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('task1')
    }, 500)
  })
}

const task2 = () => {
  console.log('task2 running')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('task2')
    }, 300)
  })
}

const task3 = () => {
  console.log('task3 running')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('task3')
    }, 1200)
  }).catch(() => {
    console.log('task3 timeout')
  })
}

const task4 = () => {
  console.log('task4 running')
  throw new Error('task4 error')
}

const task5 = () => {
  console.log('task5 running')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('task5')
    }, 1200)
  })
}

asyncQueue.addTask(task1).then((res) => {
  console.log(res, 'success')
})

asyncQueue.addTask(task2).then((res) => {
  console.log(res, 'success')
})

asyncQueue
  .addTask(task3)
  .then((res) => {
    console.log(res, 'success')
  })
  .catch(() => {
    console.log('task3 timeout')
  })

asyncQueue
  .addTask(task4, {
    immediate: false,
  })
  .then((res) => {
    console.log(res)
  })
  .catch(() => {
    console.log('task4 throw error')
  })

asyncQueue
  .addTask(task5, {
    immediate: false,
  })
  .then((res) => {
    console.log(res)
  })
  .catch(() => {
    console.log('task5 timeout')
  })
 */
