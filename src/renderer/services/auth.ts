import { apiNoToken } from './apiIns'

export interface ResponseData {
  url_pre: string
  value: []
  expire: null
}

export async function generateLoginQrCodeV2() {
  const res = await apiNoToken.request<ResponseData>({
    url: '/generateLoginQrCodeV2',
    method: 'post',
    data: {},
    headers: {
      'device-name': window.api.allConfig?.deviceName,
    },
  })
  return res.data
}
