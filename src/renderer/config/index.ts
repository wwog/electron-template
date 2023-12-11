export const os = process.platform === 'darwin' ? 'mac' : 'win'
export const ak = ''
export const deviceId = ''
export const version = window.api.allConfig.appVersion
export const over = window.api.allConfig.release
export const APICONFIG = (() => {
  const result = {
    businessBaseUrl: '',
    businessApiHeaders: {
      ak,
      os,
      deviceId,
      version,
      over,
      'Content-Type': 'application/json;charset=UTF-8',
      lang: 'en',
    },
    sdkWSBaseUrl: '',
    sdkWSHeaders: {},
  }
  switch (process.env.NODE_ENV) {
    case 'development':
      result.businessBaseUrl = ''
      result.sdkWSBaseUrl = ''
      break
    case 'production':
    default:
      result.businessBaseUrl = ''
      result.sdkWSBaseUrl = ''
      break
  }
  return result
})()
