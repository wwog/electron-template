export function formatLocal(localString: string) {
  switch (localString) {
    case 'zh-Hans-CN':
      return 'zh-CN'
    case 'zh-Hant-TW':
      return 'zh-TW'
    default:
      return localString
  }
}

export interface FormatOptions {
  /**
   * Specify the date to format
   * @default {Date} new Date()
   */
  date?: Date
  /**
   * Used to determine whether to fill a number to a specified length.
   * @default false
   */
  zerofill?: boolean
}
/**
 *
 * @param format keystrs 'YYYY' | 'YY' | 'MM' | 'DD' | 'hh' | 'mm' | 'ss'
 * @param option
 * @returns
 */
export function formatDate(format: string, option?: FormatOptions) {
  const { date = new Date(), zerofill = false } = option ?? {}

  const formatDateValue = (value: number | string, length: number): string => {
    const strValue = String(value)
    return zerofill ? strValue.padStart(length, '0') : strValue
  }

  const map: Record<string, () => string | number> = {
    YYYY: () => formatDateValue(date.getFullYear(), 4),
    YY: () => formatDateValue(date.getFullYear(), 2).slice(-2),
    MM: () => formatDateValue(date.getMonth() + 1, 2),
    DD: () => formatDateValue(date.getDate(), 2),
    hh: () => formatDateValue(date.getHours(), 2),
    mm: () => formatDateValue(date.getMinutes(), 2),
    ss: () => formatDateValue(date.getSeconds(), 2),
  }

  const formatKeys = Object.keys(map).join('|')
  const regex = new RegExp(`(${formatKeys})`, 'g')

  return format.replace(regex, (match: string) => {
    return String(map[match as keyof typeof map]())
  })
}
