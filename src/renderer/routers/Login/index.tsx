import { generateLoginQrCodeV2 } from '@/renderer/services/auth'
import { useRequest } from 'ahooks'
import { FC } from 'react'

//#region component Types
export interface LoginProps {}
//#endregion component Types

//#region component
export const Login: FC<LoginProps> = () => {
  const { data } = useRequest(generateLoginQrCodeV2, {})
  console.log(data)
  return <div className="login-contaienr"></div>
}
//#endregion component
