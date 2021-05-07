import path from 'path'
import type { OutputTargetVue, PackageJSON } from './types'
import type { CompilerCtx, ComponentCompilerMeta, Config, OutputTargetDist } from '@stencil/core/internal'
import { createComponentDefinition } from './generate-vue-component'
import { normalizePath, readPackageJson, sortBy } from './utils'

export async function vueProxyOutput(
  config: Config,
  compilerCtx: CompilerCtx,
  outputTarget: OutputTargetVue,
  components: ComponentCompilerMeta[],
) {
  const filteredComponents = getFilteredComponents(outputTarget.excludeComponents, components)
  const rootDir = config.rootDir as string
  const pkgData = await readPackageJson(rootDir)

  const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir)
  await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText)
  await copyResources(config, outputTarget)
}

function getFilteredComponents(excludeComponents: string[] = [], cmps: ComponentCompilerMeta[]) {
  return sortBy<ComponentCompilerMeta>(cmps, (cmp: ComponentCompilerMeta) => cmp.tagName).filter(
    (c: ComponentCompilerMeta) => !excludeComponents.includes(c.tagName) && !c.internal,
  )
}

export function generateProxies(
  config: Config,
  components: ComponentCompilerMeta[],
  pkgData: PackageJSON,
  outputTarget: OutputTargetVue,
  rootDir: string,
) {
  const pathToCorePackageLoader = getPathToCorePackageLoader(config, outputTarget)

  const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineSetup } from './vue-component-lib/utils';
import * as Lib from '${normalizePath(outputTarget.componentCorePackage || '')}';
import { defineComponent, PropType } from 'vue';`

  let sourceImports = ''
  let registerCustomElements = ''

  if (outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${APPLY_POLYFILLS}, ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`
    registerCustomElements = `${APPLY_POLYFILLS}().then(() => ${REGISTER_CUSTOM_ELEMENTS}());`
  } else if (!outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
    sourceImports = `import { ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`
    registerCustomElements = `${REGISTER_CUSTOM_ELEMENTS}();`
  }

  const final: string[] = [
    imports,
    sourceImports,
    registerCustomElements,
    components.map(createComponentDefinition(IMPORT_TYPES, outputTarget.componentModels)).join('\n'),
  ]

  return final.join('\n') + '\n'
}

async function copyResources(config: Config, outputTarget: OutputTargetVue) {
  if (!config.sys || !config.sys.copy || !config.sys.glob) {
    throw new Error('stencil is not properly initialized at this step. Notify the developer')
  }
  const srcDirectory = path.join(__dirname, '..', 'vue-component-lib')
  const destDirectory = path.join(path.dirname(outputTarget.proxiesFile), 'vue-component-lib')

  return config.sys.copy(
    [
      {
        src: srcDirectory,
        dest: destDirectory,
        keepDirStructure: false,
        warn: false,
      },
    ],
    srcDirectory,
  )
}

export function getPathToCorePackageLoader(config: Config, outputTarget: OutputTargetVue) {
  const basePkg = outputTarget.componentCorePackage || ''
  const distOutputTarget = config.outputTargets?.find(o => o.type === 'dist') as OutputTargetDist

  const distAbsEsmLoaderPath =
    distOutputTarget?.esmLoaderPath && path.isAbsolute(distOutputTarget.esmLoaderPath)
      ? distOutputTarget.esmLoaderPath
      : null

  const distRelEsmLoaderPath =
    config.rootDir && distAbsEsmLoaderPath ? path.relative(config.rootDir, distAbsEsmLoaderPath) : null

  const loaderDir = outputTarget.loaderDir || distRelEsmLoaderPath || DEFAULT_LOADER_DIR
  return normalizePath(path.join(basePkg, loaderDir))
}

export const GENERATED_DTS = 'components.d.ts'
const IMPORT_TYPES = 'JSX'
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements'
const APPLY_POLYFILLS = 'applyPolyfills'
const DEFAULT_LOADER_DIR = '/dist/loader'
