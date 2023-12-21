/* eslint-disable @typescript-eslint/no-explicit-any */

export type AsyncQueueErrorType = 'timeout' | 'error' | 'immediateExecuteError' | 'cancel'

export interface AsyncQueueError {
  message?: string
  type?: AsyncQueueErrorType
  taskObject?: PatrialInnerTaskObject<any>
  reason?: any
}

export interface PatrialInnerTaskObject<R> {
  /**
   * @default '__nokey__'
   */
  key: string
  timestamp: number
  task?: Promise<R | TaskError> | (() => Promise<R | TaskError>)
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
  /**
   * The maximum length of the task queue, if it exceeds, the task will not be added.
   * If not set, there is no limit.
   */
  maxTaskLength?: number
  /**
   * Execute the task immediately.
   * if false, the task is executed only after the previous task has completed.
   * Does not affect return in stack order.
   * @default true
   */
  immediate?: boolean
}

export interface TaskOptions {
  key?: string
  /**
   * Execute the task immediately.
   * if false, the task is executed only after the previous task has completed.
   * Does not affect return in stack order.
   * @default AsyncQueueOption.immediate
   */
  immediate?: boolean
}

export type InnerTaskObject<R> = Required<PatrialInnerTaskObject<R>>

export class TaskError {
  taskObject?: PatrialInnerTaskObject<any>
  type?: AsyncQueueErrorType
  reason?: any
  message: string

  constructor(option: AsyncQueueError) {
    this.message = option.message ?? 'AyncQueueError'
    this.taskObject = option.taskObject
    this.type = option.type ?? 'error'
    this.reason = option.reason
  }
}

export function PromiseTry<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(() => fn())
      .then(resolve)
      .catch(reject)
  })
}

/**
 * The command is executed simultaneously, and the order of execution is returned.
 * It is used to deal with the uncontrollable sequence of some asynchronous coherent tasks.
 */
export class AsyncQueue<R> {
  protected innerTaskObjects: InnerTaskObject<R>[] = []
  protected timeout?: number = 0
  protected timeoutMessage: string = ''
  protected maxTaskLength?: number = 0
  protected immediate: boolean

  constructor(option: AsyncQueueOption = {}) {
    this.innerTaskObjects = []
    this.timeout = option.timeout
    this.timeoutMessage = option.timeoutMessage ?? 'async queue task timeout'
    this.maxTaskLength = option.maxTaskLength
    this.immediate = option.immediate ?? true

    if (!option.timeout) {
      console.warn(
        `[AsyncQueue] not set timeout,There is a risk of blocking, make sure you add a timeout to the task itself`,
      )
    }
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
      const timeoutPromise = new Promise<TaskError>((_resolve) => {
        const timeoutError = new TaskError({
          type: 'timeout',
          taskObject: this.innerTaskObjects[0],
          message: this.timeoutMessage,
        })
        if (timeDiff >= this.timeout) {
          return _resolve(timeoutError)
        }
        const timeout = this.timeout - timeDiff
        setTimeout(() => {
          _resolve(timeoutError)
        }, timeout)
      })
      promises.push(timeoutPromise)
    }

    Promise.race(promises)
      .then((result) => {
        if (result instanceof TaskError) {
          throw result
        }
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

  protected cancelTaskByIndex(index: number) {
    if (index > this.length() - 1) {
      return false
    }
    const taskObject = this.innerTaskObjects[index]
    taskObject.reject?.(
      new TaskError({
        message: 'async queue task cancel',
        type: 'cancel',
      }),
    )
    this.innerTaskObjects.splice(index, 1)
    return true
  }

  /**
   * @description
   * Add a task to the queue, return a `Promise`.
   * when the task is completed, the Promise will be resolved.
   * The timing of completion depends on the order of tasks in the queue.
   * The timing of execution depends on the `immediate` option.
   * @param task  Task to be executed
   * @param options
   * @returns
   */
  public addTask(task: () => Promise<R>, options: TaskOptions = {}) {
    const { immediate, key = '__nokey__' } = options

    // Create a new Promise that will resolve when the task is complete, but its resolution will be delayed until all previous tasks are completed.
    return new Promise<R>((resolve, reject) => {
      if (this.maxTaskLength) {
        if (this.length() >= this.maxTaskLength) {
          return reject(
            new TaskError({
              message: 'async queue task length is max',
              type: 'error',
            }),
          )
        }
      }
      const realImmediate = immediate ?? this.immediate
      const normalTask = () => {
        return new Promise<R | TaskError>((_resolve) => {
          PromiseTry(task)
            .then(_resolve)
            .catch((reason) => {
              _resolve(
                new TaskError({
                  type: 'immediateExecuteError',
                  reason,
                }),
              )
            })
        })
      }
      // Add the task to the queue
      this.innerTaskObjects.push({
        key,
        timestamp: Date.now(),
        resolve,
        reject,
        task: realImmediate ? normalTask() : normalTask,
      })
      // If there is only one task in the queue, execute it immediately
      if (this.innerTaskObjects.length === 1) {
        this.executeNextTask()
      }
    })
  }

  /**
   * You may not need this method
   * @description remove the task from the queue and rejects it
   * @ Cancellation of a task usually comes with preconditions, such as canceling a network request.
   * @ Therefore, you should complete the precondition before fulfilling this promise.
   * @ It should still run in the queue instead of being forcibly canceled, which would exit the queue.
   */
  public forceCancel(key: string) {
    console.warn(
      `[AsyncQueue] calling forceCancel("${key}")  This task is not completed sequentially`,
    )
    let found = false
    while (!found) {
      const index = this.innerTaskObjects.findIndex((item) => item.key === key)
      if (index === -1) {
        found = true
      } else {
        this.cancelTaskByIndex(index)
      }
    }
    return true
  }

  public forceCancelAll() {
    this.innerTaskObjects.forEach((item) => {
      item.reject?.(
        new TaskError({
          message: 'async queue task cancel',
          type: 'cancel',
        }),
      )
    })
    this.innerTaskObjects = []
    return true
  }

  /**
   * @description Get the current length of the task queue
   * @returns
   */
  public length() {
    return this.innerTaskObjects.length
  }
}
