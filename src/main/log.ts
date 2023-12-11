/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from 'ansi-styles'
import { formatDate } from '../common/format'

function getDate() {
  const date = new Date()
  const dateStr = `${styles.green.open}[${formatDate('MM-DD hh:mm:ss', { date })}]${
    styles.green.close
  }`
  return {
    dateStr,
    dateTime: date.getTime(),
  }
}

export interface LogOptions {
  onLog?: (dateTime: number, logStr: string) => void
  onError?: (dateTime: number, logStr: string) => void
  onWarn?: (dateTime: number, logStr: string) => void
}

class Log {
  static instance: Log
  static getInstance(options: LogOptions = {}) {
    if (Log.instance) {
      return Log.instance
    }
    Log.instance = new Log(options)
    return Log.instance
  }
  static formatLogArgs(args: any[]) {
    return args.reduce((acc, cur) => {
      switch (typeof acc) {
        case 'object':
          return acc + JSON.stringify(cur, null, 2) + '\n'
        default:
          return acc + cur + '\n'
      }
    }, '')
  }
  private constructor(protected options: LogOptions = {}) {}

  log(...args: any[]) {
    const { dateTime, dateStr } = getDate()
    console.log(dateStr, ...args)
    this.options?.onLog?.(dateTime, Log.formatLogArgs(args))
  }

  err(...args: any[]) {
    const { dateTime, dateStr } = getDate()
    console.error(dateStr, ...args)
    this.options?.onError?.(dateTime, Log.formatLogArgs(args))
  }

  warn(...args: any[]) {
    const { dateTime, dateStr } = getDate()
    console.error(dateStr, ...args)
    this.options?.onWarn?.(dateTime, Log.formatLogArgs(args))
  }
}

/**
 * if u want write log file , you can set options.onLog
 * @param options
 */
function initLog(options: LogOptions = {}) {
  Log.getInstance(options)
}
initLog({
  onLog() {},
})
console.log('')
export const log = (...args: any[]) => Log.getInstance().log(...args)
export const err = (...args: any[]) => Log.getInstance().err(...args)
export const warn = (...args: any[]) => Log.getInstance().warn(...args)
