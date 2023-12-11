import styles from 'ansi-styles'
import { spawn } from 'child_process'
import electron from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { readdir, rmdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { build, createServer, splitVendorChunkPlugin } from 'vite'
import { paths } from './paths.mjs'

const args = process.argv
const command = args[2]
const restart = args.includes('--restart')
const isDebug = args.includes('--debug')
const sourceMap = args.includes('--source-map')
const isDev = args.includes('--dev')
const minify = args.includes('--minify')
const electronPath = electron.toString()

const excludeModules = [
  'electron',
  'fs',
  'path',
  'os',
  'url',
  'child_process',
  'crypto',
  'events',
  'http',
  'https',
  'net',
  'stream',
  'tty',
  'util',
  'zlib',
  'assert',
  'buffer',
]

function log(...args) {
  console.log(`${styles.blue.open}[cli]${styles.blue.close}`, ...args)
}

/**
 * @typedef {Object} DevMainHooks
 * @property {Function} onReBuildEnd - runs only on `watch === true`
 */
/**
 * @typedef {Object} buildMainOptions
 * @property {boolean | undefined} minify
 * @property {boolean | undefined} isDev
 * @property {boolean | undefined} isDebug
 * @property {string | undefined} devUrl
 * @property {boolean | undefined} sourceMap
 * @property {boolean | undefined} watch
 * @property {string | undefined} outDir
 * @property {DevMainHooks | undefined} hooks
 */
/**
 * @function buildMain
 * @param {buildMainOptions} options
 */
async function buildMain(options) {
  const {
    minify = false,
    isDev = true,
    isDebug = true,
    devUrl = '',
    watch = false,
    hooks = {},
    sourceMap = isDev,
    outDir = paths.distPath,
  } = options ?? {}
  const envStr = isDev ? 'development' : 'production'
  let buildCount = 0
  let buildPayloadCount = 0
  const define =  {
    'process.env.NODE_ENV': `'${envStr}'`,
    'process.env.DEBUG': `'${isDebug}'`,
    'process.env.DEV_URL': `'${devUrl}'`,
    'process.env.ROOT_PATH': JSON.stringify(paths.rootPath)
  }

  const buildPromise = new Promise((resolve) => {
    build({
      define,
      build: {
        minify,
        watch,
        outDir,
        emptyOutDir: false,
        sourcemap: sourceMap,
        rollupOptions: {
          input: {
            main: paths.mainEntry,
          },
          external: excludeModules,
          output: {
            entryFileNames: '[name].js',
            assetFileNames: 'renderer/assets/[name].[ext]',
            format: 'commonjs',
          },
          plugins: [
            {
              name: 'dev-main',
              closeBundle() {
                buildCount++
                if (buildCount > 1 && watch) {
                  hooks?.onReBuildEnd?.()
                }
                log(`Main Process built successful`)
                resolve()
              },
            },
          ],
        },
      },
    })
  })
  
  const preloadPromise = new Promise((resolve) => {
    build({
      define,
      build: {
        minify,
        watch,
        outDir,
        emptyOutDir: false,
        sourcemap: sourceMap,
        rollupOptions: {
          input: {
            preload_service: paths.preloadServiceEntry,
          },
          external: ['fs', 'path', 'os', 'electron', 'url'],
          output: {
            entryFileNames: '[name].js',
            assetFileNames: 'renderer/assets/[name].[ext]',
            format: 'commonjs',
          },
          plugins: [
            {
              name: 'dev-preload',
              closeBundle() {
                buildPayloadCount++
                if (buildPayloadCount > 1 && watch) {
                  hooks?.onReBuildEnd?.()
                }
                log(`Preload Process built successful`)
                resolve()
              },
            },
          ],
        },
      },
    })
  })
  
  await Promise.all([buildPromise, preloadPromise])

  return outDir
   
}

function electronRun(mainPath) {
  return spawn(electronPath, [mainPath, '--enable-source-maps'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: true,
    },
  })
}

const devConfig = {
  port: 4329,
  root: paths.rendererPath,
}

async function runDev(restart = false) {
  const _server = await createServer({
    root: devConfig.root,
    base: './',
    resolve: {
      alias: {
        '@style': paths.pandaCssPath,
        '@': paths.srcPath,
      },
    },
  })

  const server = await _server.listen(devConfig.port)
  const local = server.resolvedUrls.local
  /**
   * @type {ChildProcess}
   */
  let electronProcess = null
  await buildMain({
    devUrl: local,
    watch: restart,
    hooks: {
      onReBuildEnd() {
        if (electronProcess) {
          electronProcess.kill()
          electronProcess = electronRun(join(paths.distPath, 'main.js'))
        }
      },
    },
  })
  const outpath = join(paths.distPath, 'main.js')
  electronProcess = electronRun(outpath)
  listeningProcessClose(() => {
    if (electronProcess) {
      electronProcess.kill()
      server.close()
    }
  })
}

/**
 * @param {string} dir
 * @param {CleanDirFilter} filter (path,'file'|'dir')=>boolean
 */
async function clearDir(dir, filter = () => false) {
  try {
    const files = await readdir(dir)
    for (const file of files) {
      const path = join(dir, file)
      const stats = await stat(path)
      if (stats.isFile()) {
        if (!filter(path, 'file')) {
          await unlink(path)
        }
      }
      if (stats.isDirectory()) {
        if (!filter(path, 'dir')) {
          await clearDir(path, filter)
          await rmdir(path)
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

async function buildRenderer() {
  await build({
    root: devConfig.root,
    base: './',
    plugins: [splitVendorChunkPlugin()],
    optimizeDeps: {
      exclude: excludeModules,
    },
    resolve: {
      alias: {
        '@style': paths.pandaCssPath,
        '@': paths.srcPath,
      },
    },
    build: {
      outDir: paths.releaseRendererPath,
      emptyOutDir: false,
      sourcemap: sourceMap,
      minify,
      rollupOptions: {
        external: excludeModules,
        output: {
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  })
}

/**
 * Double packageJson structure is adopted。
 * Here you can synchronize the description field from the root
 */
function mergePkgJson() {
  const root_pkg = JSON.parse(readFileSync(paths.rootPkgPath))
  const app_pkg = JSON.parse(readFileSync(paths.appPkgPath))
  const { name, author, version, description } = root_pkg
  const newAppPkg = {
    ...app_pkg,
    name,
    author,
    version,
    description,
  }
  return { newAppPkg, isChange: JSON.stringify(newAppPkg) !== JSON.stringify(app_pkg) }
}

async function runBuild() {
  clearDir(paths.releaseAppPath, (path) => {
    if (path.includes('package.json')) {
      return true
    }
    return false
  })
  const { newAppPkg, isChange } = mergePkgJson()
  if (isChange) {
    log('update releaseAppPackageJson', newAppPkg)
    writeFileSync(paths.appPkgPath, JSON.stringify(newAppPkg, null, 2))
  }
  await buildRenderer()
  await buildMain({
    isDev,
    isDebug,
    minify,
    sourceMap,
    outDir: paths.releaseAppDistPath,
    clean: false,
  })
}

try {
  switch (command) {
    case 'dev':
      runDev(restart)
      break
    case 'build':
      runBuild()
      break
    default:
      log('Command not found')
      break
  }
} catch (error) {
  console.error(error)
}

function listeningProcessClose(call) {
  let callCount = 0
  const realCall = () => {
    if (callCount === 0) {
      callCount++
      call()
    }
  }
  process.once('exit', () => {
    realCall()
  })
  process.once('SIGINT', () => {
    realCall()
  })
  process.once('beforeExit', () => {
    realCall()
  })
  process.once('SIGTERM', () => {
    realCall()
  })
}
