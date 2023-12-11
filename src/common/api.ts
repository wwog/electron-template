import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios'

interface MakeAxiosInsHook {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReq?: (value: InternalAxiosRequestConfig<any>) => InternalAxiosRequestConfig<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRes?: (response: AxiosResponse<any, any>) => AxiosResponse<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any, type: 'req' | 'res') => any
}

function makeAxiosIns(config?: CreateAxiosDefaults, hooks: MakeAxiosInsHook = {}) {
  const { onReq, onRes, onError } = hooks
  const abortController = new AbortController()
  const instance = axios.create({
    timeout: 10_000,
    signal: abortController.signal,
    ...config,
  })

  instance.interceptors.request.use(onReq, (error) => onError(error, 'req'))

  instance.interceptors.response.use(onRes, (error) => onError(error, 'res'))

  return {
    instance,
    abortController,
  }
}

export class Api {
  instance: AxiosInstance
  abortController: AbortController
  constructor(config?: CreateAxiosDefaults, hooks: MakeAxiosInsHook = {}) {
    const { abortController, instance } = makeAxiosIns(config, hooks)
    this.instance = instance
    this.abortController = abortController
  }

  setBaseUrl(url: string) {
    this.instance.defaults.baseURL = url
  }

  setHeaders(headers: { [key: string]: string }) {
    this.instance.defaults.headers = {
      ...this.instance.defaults.headers,
      ...headers,
    }
  }

  cancelAllRequest() {
    this.abortController.abort()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestNosignal<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig) {
    return this.instance<T, R, D>({ ...config, signal: null, cancelToken: null })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig) {
    return this.instance<T, R, D>(config)
  }
}
