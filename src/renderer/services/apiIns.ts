import { Api } from '../../common/api'
import { APICONFIG } from '../config'

const onError = (error: unknown, type: 'req' | 'res') => {
  console.error('onError', error, type)
  return error
}

export const apiNoToken = new Api(
  {
    baseURL: APICONFIG.businessBaseUrl,
    headers: {
      ...APICONFIG.businessApiHeaders,
    },
  },
  {
    onReq: (config) => {
      return config
    },
    onRes: (response) => {
      return response
    },
    onError,
  },
)
