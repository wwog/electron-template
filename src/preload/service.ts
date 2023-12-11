/**
 * do not export anything from this file.
 */
import { contextBridge, ipcRenderer } from 'electron'
import { channels } from '../common/channels'
import { payloadChannels } from './payloadChannels'

const allConfig = ipcRenderer.sendSync(payloadChannels.GETCONFIG)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callMainMethod<R = any>(methodName: string, payload?: any): Promise<R> {
  const { success, data } = await ipcRenderer.invoke(channels.callMain, {
    methodName,
    payload,
  })
  if (success === false) {
    throw new Error('call main method failed')
  }
  return data
}

const apiKey = 'api'
const api = {
  callMainMethod,
  allConfig,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld(apiKey, api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
