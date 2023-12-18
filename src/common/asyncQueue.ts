/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PatrialInnerTaskObject<R> {
  timestamp: number
  promise?: Promise<R>
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

export type InnerTaskObject<R> = Required<PatrialInnerTaskObject<R>>

export class AsyncQueue<R> {
  protected innerTaskObjects: InnerTaskObject<R>[] = []
  protected timeout?: number = 0
  protected timeoutMessage: string = ''
  constructor(option: AsyncQueueOption = {}) {
    this.innerTaskObjects = []
    this.timeout = option.timeout
    this.timeoutMessage = option.timeoutMessage ?? 'async queue task timeout'
  }

  addTask(task: () => Promise<R>) {
    // Create a new Promise that will resolve when the task is complete, but its resolution will be delayed until all previous tasks are completed.
    const taskPromise = new Promise<R>((resolve, reject) => {
      // Add the task to the queue
      this.innerTaskObjects.push({
        timestamp: Date.now(),
        resolve,
        reject,
        promise: task(),
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
    const { promise, resolve, reject, timestamp } = this.innerTaskObjects[0]

    const promises = [promise]
    const now = Date.now()
    const timeDiff = now - timestamp
    if (this.timeout) {
      const timeoutPromise = new Promise<R>((_, reject) => {
        if (timeDiff >= this.timeout) {
          return reject(new Error(this.timeoutMessage))
        }
        const timeout = this.timeout - timeDiff
        setTimeout(() => {
          reject(new Error(this.timeoutMessage))
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
