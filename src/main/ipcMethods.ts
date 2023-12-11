import { ipcMain } from 'electron'
import { channels } from '../common/channels'
import { err, log } from './log'

let mainMethods = {}

export function registeIpcMethod(
  methodName: string,
  callback: (event: Electron.IpcMainInvokeEvent, payload: unknown) => unknown,
) {
  if (mainMethods[methodName] !== undefined) {
    err(`method is already registered: ${methodName}`)
    return
  }
  mainMethods[methodName] = callback
}

/**
 * Methods that are not computationally intensive can be registered through this method
 * and the rest use worker
 */
export function initMethods() {
  log('preparing the main process method registration')
  ipcMain.handle(channels.callMain, async (event, args) => {
    log('calling main process method', args)
    const { methodName, payload } = args ?? {}
    const result = {
      success: true,
      data: null,
    }
    if (typeof methodName !== 'string' || methodName.length < 1) {
      err(`invalid method name : ${methodName}`, '\n  caller is ', {
        title: event.sender.getTitle(),
        id: event.sender.id,
      })
      result.success = false
    } else if (mainMethods[methodName] === undefined) {
      err(`method is not currently registered: ${methodName}`, '\n  caller is ', {
        title: event.sender.getTitle(),
        id: event.sender.id,
      })
      result.success = false
    }

    if (result.success === false) {
      return result
    }

    try {
      result.data = await mainMethods[methodName](event, payload)

      //log(`call method success: ${methodName}, result:`, result.data)
    } catch (error) {
      err(`call method go wrong: ${methodName}`, '\n  caller is ', {
        title: event.sender.getTitle(),
        id: event.sender.id,
      })
      result.success = false
      result.data = null
    }
    return result
  })

  log('main process method registration is completed')
}

export function freeMethods() {
  log('The main process method is released')
  mainMethods = {}
}
