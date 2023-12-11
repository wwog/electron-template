import { app, crashReporter, ipcMain } from 'electron'
import { payloadChannels } from '../preload/payloadChannels'
import { log } from './log'
import { getAllConfig } from './utils'

crashReporter.start({
  uploadToServer: false,
})
if (app.isPackaged) {
  log('appPath', app.getAppPath())
  log('process', process)
  log('commandLine', app.commandLine)
  log('exe', app.getPath('exe'))
}

ipcMain.on(payloadChannels.GETCONFIG, (e) => {
  e.returnValue = getAllConfig()
})
