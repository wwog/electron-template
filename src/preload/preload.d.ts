import { allConfig } from '../main/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
export { }
interface PreloadApi {
  /**
   * Fixed channel request and acceptance for easy processing
   * @param method
   * @param payload
   */
  callMainMethod<R = any>(method: string, payload?: any): Promise<R>
  allConfig: typeof allConfig
}
declare global {
  interface Window {
    api: PreloadApi
  }
}
