import { BrowserWindow, app, session, shell } from 'electron'
import { resolve } from 'path'
import { initMethods } from './ipcMethods'
import './preInit'
import { getAllConfig } from './utils'
import { createMainWindow } from './windows/mainWindow'


const { appName, isDev, isDebug, rootPath } = getAllConfig()

initMethods()

// TODO  need update handler func by product
process.on('uncaughtException', console.log)

// If you need multiple examples, you can do so here
const allWins: {
  [key: string]: BrowserWindow[]
} = {
  main: [],
}

app.setName(appName)

app.whenReady().then(async () => {
  if (isDev && isDebug) {
    if (app.isPackaged === false) {
      const reactDevToolsPath = resolve(
        rootPath,
        './src/main/extenstions/fmkadmapgofadopljbjfkapdkoienihi/5.0.0_0',
      )
      await session.defaultSession.loadExtension(reactDevToolsPath)
    }
  }
  allWins.main.push(createMainWindow('https://ai.xiabb.chat/'))
})

if (app.requestSingleInstanceLock() === false) {
  console.log('Another instance of this app is already running')
  app.quit()
}

app.on('second-instance', () => {
  const mainWin = allWins.main[0]
  if (mainWin) {
    if (mainWin.isMinimized()) {
      mainWin.restore()
    }
    mainWin.focus()
    mainWin.show()
  }
})

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('web-contents-created', (_e, webContents) => {
  webContents.setWindowOpenHandler((details) => {
    const { url } = details
    console.log('onWindowOpen', url)
    // This is used for React-Inspector to quickly lock source code
    if (url.startsWith('vscode') && isDev) {
      shell.openExternal(url)
      return {
        action: 'deny',
      }
    }
    return {
      action: 'allow',
    }
  })
})
