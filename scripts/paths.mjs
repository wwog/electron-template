import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const dirName = dirname(fileURLToPath(import.meta.url))

const rootPath = resolve(dirName, '../')
const pandaCssPath = resolve(rootPath, 'styled-system')
const prebuildConfigPath = resolve(rootPath, 'electronbuilder.json')
const buildConfigPath = resolve(rootPath, 'electron-builder.json')
const rootPkgPath = resolve(rootPath, 'package.json')
const srcPath = resolve(rootPath, 'src')
const distPath = resolve(rootPath, 'node_modules/.main')
const releasePath = resolve(rootPath, 'release')
const releaseAppPath = resolve(releasePath, 'app')
const releaseAppDistPath = resolve(releaseAppPath, 'dist')
const appPkgPath = resolve(releaseAppPath, 'package.json')
const releaseRendererPath = resolve(releaseAppDistPath, 'renderer')

const mainPath = resolve(srcPath, 'main')
const preloadPath = resolve(srcPath, 'preload')
const mainEntry = resolve(mainPath, 'main.ts')
const preloadServiceEntry = resolve(preloadPath, 'service.ts')
const rendererPath = resolve(srcPath, 'renderer')

export const paths = {
  rootPath,
  rootPkgPath,
  srcPath,
  mainPath,
  rendererPath,
  distPath,
  mainEntry,
  releaseAppPath,
  releasePath,
  releaseRendererPath,
  releaseAppDistPath,
  appPkgPath,
  preloadServiceEntry,
  buildConfigPath,
  prebuildConfigPath,
  pandaCssPath,
}
