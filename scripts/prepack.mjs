import { readFileSync, writeFileSync } from 'fs'
import { paths } from './paths.mjs'

const prefix = process.env.CONFIG_PREFIX

const { prebuildConfigPath, buildConfigPath } = paths

const preBuildContent = readFileSync(prebuildConfigPath, 'utf-8')
const preBuildConfig = JSON.parse(preBuildContent)

function generateBuildConfig(preBuildConfig, ENVprefix) {
  const buildConfig = {}
  for (const key in preBuildConfig) {
    let realKey = key
    const value = preBuildConfig[key]
    if (key.includes('__')) {
      if (key.startsWith(ENVprefix) === false) {
        continue
      } else {
        realKey = key.replace(`${ENVprefix}__`, '')
      }
    }
    if (Array.isArray(value)) {
      buildConfig[realKey] = value
    } else if (typeof value === 'object') {
      buildConfig[realKey] = generateBuildConfig(value, ENVprefix)
    } else {
      buildConfig[realKey] = value
    }
  }
  return buildConfig
}

const buildConfig = generateBuildConfig(preBuildConfig, prefix)
writeFileSync(buildConfigPath, JSON.stringify(buildConfig, null, 2))
