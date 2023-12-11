import { WebContents, app } from 'electron'
import os from 'os'
import path from 'path'
import { URL } from 'url'
import pkg from '../../package.json'
import { formatLocal } from '../common/format'
import { DefaultLang } from '../config'

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


export function appendLoadFailedPage(webContents: WebContents) {
  const currentUrl = webContents.getURL()
  if(isDebug){
    webContents.openDevTools()
  }
  webContents.executeJavaScript(`
    const div = document.createElement('div')
    div.style.width = '100vw'
    div.style.height = '100vh'
    div.style.display = 'flex'
    div.style.justifyContent = 'center'
    div.style.alignItems = 'center'
    div.style.flexDirection = 'column'
    div.style.fontSize = '20px'
    div.style.color = '#000'
    div.style.fontWeight = 'bold'
    div.style.fontFamily = 'sans-serif'
    div.style.background = '#fff'
    div.innerHTML = '${currentUrl} load failed,pelease contact admin'
    document.body.appendChild(div)
  `)
}
