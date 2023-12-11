/* eslint-disable @typescript-eslint/no-explicit-any */

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 320,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
