import { BrowserWindow } from 'electron'
import { join } from 'path'
import { debounce } from '../../common'
import { store } from '../../common/store'
import { log } from '../log'
import { appendDragElement } from '../utils'

const servicePreload = join(__dirname, 'preload_service.js')

export function createMainWindow(url: string) {
  const mainWindowBounds = store.get('mainWindowBounds', {
    width: 460,
    height: 500,
  })

  const win = new BrowserWindow({
    minWidth: 460,
    minHeight: 500,
    width: mainWindowBounds.width,
    height: mainWindowBounds.height,
    x: mainWindowBounds.x,
    y: mainWindowBounds.y,
    center: true,
    show: false,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: servicePreload,
      scrollBounce: true,
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on(
    'resize',
    debounce(() => {
      store.set('mainWindowBounds', win.getBounds())
      log('Main window size and location changes are logged')
    }),
  )

  win.webContents.once('did-finish-load', () => {
    appendDragElement(win.webContents)
  })

  win.loadURL(url)
  //win.webContents.openDevTools()
  return win
}
