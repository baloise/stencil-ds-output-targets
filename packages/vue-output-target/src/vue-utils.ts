import { ComponentCompilerEvent, ComponentCompilerProperty } from '@stencil/core/internal'

export const parseProp = (prop: ComponentCompilerProperty): string => {
  return `    ${prop.name}: {
      type: ${mapType(prop)},
      default: ${mapDefaultValue(prop)},
      required: ${prop.required},
    },`
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

const mapDefaultValue = (prop: ComponentCompilerProperty): string => {
  if (prop.defaultValue !== undefined && prop.defaultValue !== null) {
    if (prop.defaultValue.startsWith('this.') || prop.defaultValue.startsWith('_ ')) {
      return 'undefined'
    }
  }
  return `${prop.defaultValue}`
}

const mapType = (prop: ComponentCompilerProperty): string => {
  const propType = prop.type
  if (['string', 'boolean', 'number'].includes(propType)) {
    return capitalize(propType)
  }

  if (propType === 'unknown') {
    if (prop.complexType.resolved.startsWith('(')) {
      return `Function as PropType<${prop.complexType.resolved}>`
    }
    if (prop.complexType.resolved.includes('[]')) {
      return `Array as PropType<Array<${prop.complexType.resolved.replace('[]', '')}>>`
    }
  }

  if (propType === 'any') {
    return `[${prop.complexType.original
      .split('|')
      .map(t => t.trim())
      .map(capitalize)
      .join(', ')}]`
  }

  return ''
}

export const parseEmits = (event: ComponentCompilerEvent): string => {
  return `    ${event.name}: (value: ${mapEventType(event)}) => true,`
}

const mapEventType = (event: ComponentCompilerEvent) => {
  if (Object.keys(event.complexType.references).length > 0) {
    const ref = event.complexType.references[event.complexType.resolved]
    if (ref !== undefined && ref.location !== undefined && ref.location === 'import') {
      return 'Lib.' + event.complexType.original
    }
  }
  return event.complexType.original
}
