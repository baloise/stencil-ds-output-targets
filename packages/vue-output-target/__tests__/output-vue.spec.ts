import { ComponentCompilerMeta, Config } from '@stencil/core/internal'
import { generateProxies } from '../src/output-vue'
import { PackageJSON, OutputTargetVue } from '../src/types'

describe('generateProxies', () => {
  const components: ComponentCompilerMeta[] = []
  const pkgData: PackageJSON = {
    types: 'dist/types/index.d.ts',
  }
  const rootDir: string = ''
  const config: Config = { outputTargets: [] }

  it('should include both polyfills and definCustomElements when both are true in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: true,
      includeDefineCustomElements: true,
    }

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir)
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineSetup } from './vue-component-lib/utils';
import * as Lib from 'component-library';
import { defineComponent, PropType } from 'vue';
import { applyPolyfills, defineCustomElements } from 'component-library/dist/loader';

applyPolyfills().then(() => defineCustomElements());

`,
    )
  })

  it('should include only defineCustomElements when includePolyfills is false in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: false,
      includeDefineCustomElements: true,
    }

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir)
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineSetup } from './vue-component-lib/utils';
import * as Lib from 'component-library';
import { defineComponent, PropType } from 'vue';
import { defineCustomElements } from 'component-library/dist/loader';

defineCustomElements();

`,
    )
  })

  it('should not include defineCustomElements or applyPolyfills if both are false in the outputTarget', () => {
    const outputTarget: OutputTargetVue = {
      componentCorePackage: 'component-library',
      proxiesFile: '../component-library-vue/src/proxies.ts',
      includePolyfills: false,
      includeDefineCustomElements: false,
    }

    const finalText = generateProxies(config, components, pkgData, outputTarget, rootDir)
    expect(finalText).toEqual(
      `/* eslint-disable */
/* tslint:disable */
/* auto-generated vue proxies */
import { defineSetup } from './vue-component-lib/utils';
import * as Lib from 'component-library';
import { defineComponent, PropType } from 'vue';



`,
    )
  })
})
