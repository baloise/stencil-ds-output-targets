import { dashToPascalCase } from './utils'
import type { ComponentCompilerMeta } from '@stencil/core/internal'
import type { ComponentModelConfig } from './types'
import { parseProp, parseEmits } from './vue-utils'

const UPDATE_VALUE_EVENT = 'update:modelValue'
const MODEL_VALUE = 'modelValue'

export const createComponentDefinition = (
  importTypes: string,
  componentModelConfigs: ComponentModelConfig[] | undefined,
) => (cmpMeta: Pick<ComponentCompilerMeta, 'properties' | 'tagName' | 'methods' | 'events'>) => {
  const tagNameAsPascal = dashToPascalCase(cmpMeta.tagName)
  let props = ''
  let emits = ''
  let events = '[],\n'
  let model = 'undefined'
  let relevantModelConfig: ComponentModelConfig | undefined

  if (componentModelConfigs !== undefined && Array.isArray(componentModelConfigs)) {
    relevantModelConfig = componentModelConfigs.find(modelConfig => {
      if (Array.isArray(modelConfig.elements)) {
        return modelConfig.elements.includes(cmpMeta.tagName)
      }

      return modelConfig.elements === cmpMeta.tagName
    })
  }

  if (Array.isArray(cmpMeta.properties) && cmpMeta.properties.length > 0) {
    const propList = cmpMeta.properties.map(parseProp)
    if (relevantModelConfig) {
      propList.push(`    ${MODEL_VALUE}: {
      default: undefined,
    },`)
    }
    props = propList.join('\n')
  }

  if (Array.isArray(cmpMeta.events) && cmpMeta.events.length > 0) {
    const emitList = cmpMeta.events.map(parseEmits)
    const eventList = cmpMeta.events.map(event => `'${event.name}'`)
    if (relevantModelConfig) {
      eventList.push(`'${UPDATE_VALUE_EVENT}'`)
      emitList.push(`    '${UPDATE_VALUE_EVENT}': (value: any) => true,`)
    }
    emits = emitList.join('\n')
    events = `[${eventList.join(',')}],`
  }

  if (relevantModelConfig) {
    model = `{
    modelProp: '${relevantModelConfig.targetAttr}',
    modelUpdateEvent: '${relevantModelConfig.event}'
  }`
  }

  return `export const ${tagNameAsPascal} = /*@__PURE__*/ defineComponent({
  name: '${cmpMeta.tagName}',
  props: {
${props}
  },
  emits: {
${emits}
  },
  setup: defineSetup('${cmpMeta.tagName}', ${events.trim()} ${model.trim()})
})\n`
}
