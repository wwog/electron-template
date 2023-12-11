import { WebContents, app } from 'electron'
import os from 'os'
import path from 'path'
import { URL } from 'url'
import pkg from '../../package.json'
import { formatLocal } from '../common/format'
import { DefaultLang } from '../config'
import { warn } from './log'

const isDev = process.env.NODE_ENV === 'development'
const isDebug = process.env.DEBUG === 'true'
const rootPath = process.env.ROOT_PATH
const devUrl = process.env.DEV_URL
const appName = pkg.name
const appVersion = pkg.version
const platform = process.platform

let allConfig = null

type ALLCONFIG = {
  isDev: boolean
  isDebug: boolean
  devUrl: string
  appName: string
  appVersion: string
  platform: NodeJS.Platform
  local: string
  deviceName: string
  os: string
  release: string
  rootPath: string
}

export const getAllConfig = () => {
  if (allConfig) {
    return allConfig as ALLCONFIG
  } else {
    allConfig = {
      isDev,
      isDebug,
      devUrl,
      appName,
      appVersion,
      platform,
      local: getLocal(),
      deviceName: os.hostname(),
      os: platform === 'darwin' ? 'mac' : 'win',
      release: os.release(),
      rootPath,
    }
    return allConfig as ALLCONFIG
  }
}

export function resolveHtmlPath(htmlFileName: string = 'index.html') {
  if (isDev && devUrl) {
    const url = new URL(devUrl)
    url.pathname = htmlFileName
    return url.href
  }
  return `file://${path.resolve(__dirname, './renderer/', htmlFileName)}`
}

export function getLocal() {
  const sysLangs = app.getPreferredSystemLanguages()
  sysLangs.push(DefaultLang)
  const lang = sysLangs[0]
  return formatLocal(lang)
}

export function appendDragElement(webContents: WebContents) {
  let titleBarHeight = 40
  switch (process.platform) {
    case 'darwin':
      titleBarHeight = 22
      break
    case 'win32':
      titleBarHeight = 40
      break
    default:
      warn('Unknown platform: title bar height is set to 40px, please check this is correct')
      break
  }
  webContents.insertCSS(
    `div#drag_main_process_inset {
        -webkit-app-region: drag;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: ${titleBarHeight}px;
        z-index: 999;
      }`,
  )
  webContents.executeJavaScript(
    `const div = document.createElement('div');
      div.id = 'drag_main_process_inset';
      document.body.appendChild(div);`,
  )
}
