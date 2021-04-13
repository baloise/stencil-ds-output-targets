import { ComponentCompilerEvent, ComponentCompilerProperty } from '@stencil/core/internal'
import { parseProp, parseEmits } from '../src/vue-utils'

describe('vue-utils', () => {
  const defaultProp: ComponentCompilerProperty = {
    name: 'color',
    type: 'string',
    attribute: 'color',
    reflect: false,
    mutable: false,
    required: false,
    optional: false,
    defaultValue: '0',
    complexType: { original: 'string', resolved: 'string', references: {} },
    docs: { tags: [], text: 'Readme' },
    internal: false,
  }

  const defaultEvent: ComponentCompilerEvent = {
    name: 'balClose',
    method: 'balClose',
    bubbles: true,
    cancelable: true,
    composed: true,
    docs: { tags: [], text: 'Emitted when toast is closed' },
    complexType: { original: 'string', resolved: 'string', references: {} },
    internal: false,
  }

  describe('parseProp', () => {
    it('should parse a string prop', () => {
      const result = parseProp({ ...defaultProp, required: true, defaultValue: 'this.inputId' })
      expect(result).toBe(`    color: {
      type: String,
      default: undefined,
      required: true,
    },`)
    })

    it('should parse a function prop', () => {
      const result = parseProp({
        ...defaultProp,
        type: 'unknown',
        defaultValue: '_ => true',
        complexType: {
          original: 'BalDateCallback',
          resolved: '(datestring: string) => boolean',
          references: {
            BalDateCallback: { location: 'import', path: './bal-datepicker.type' },
          },
        },
      })
      expect(result).toBe(`    color: {
      type: Function as PropType<(datestring: string) => boolean>,
      default: undefined,
      required: false,
    },`)
    })

    it('should parse a any prop', () => {
      const result = parseProp({
        ...defaultProp,
        type: 'any',
        complexType: {
          original: 'string | number',
          resolved: 'number | string | undefined',
          references: {},
        },
      })
      expect(result).toBe(`    color: {
      type: [String, Number],
      default: 0,
      required: false,
    },`)
    })

    it('should parse an array prop', () => {
      const result = parseProp({
        ...defaultProp,
        type: 'unknown',
        complexType: { original: 'string[]', resolved: 'string[]', references: {} },
      })
      expect(result).toBe(`    color: {
      type: Array as PropType<Array<string>>,
      default: 0,
      required: false,
    },`)
    })

    it('should parse a string prop', () => {
      const template = (defaultValue: string) => `    color: {
      type: String,
      default: ${defaultValue},
      required: false,
    },`
      expect(parseProp({ ...defaultProp })).toBe(template('0'))
      expect(parseProp({ ...defaultProp, defaultValue: undefined })).toBe(template(`undefined`))
      expect(parseProp({ ...defaultProp, defaultValue: null })).toBe(template(`null`))
      expect(parseProp({ ...defaultProp, defaultValue: "''" })).toBe(template(`''`))
      expect(parseProp({ ...defaultProp, defaultValue: '0' })).toBe(template(`0`))
      expect(parseProp({ ...defaultProp, defaultValue: 'false' })).toBe(template(`false`))
      expect(parseProp({ ...defaultProp, defaultValue: 'true' })).toBe(template(`true`))
    })
  })

  describe('parseEmits', () => {
    it('should create default event emit', () => {
      const result = parseEmits({ ...defaultEvent })
      expect(result).toBe(`    balClose: (value: string) => true,`)
    })
    it('should parser user event like mouse event', () => {
      const result = parseEmits({
        ...defaultEvent,
        complexType: {
          original: 'FocusEvent',
          resolved: 'FocusEvent',
          references: {
            FocusEvent: {
              location: 'global',
            },
          },
        },
      })
      expect(result).toBe(`    balClose: (value: FocusEvent) => true,`)
    })
    it('should parser user event like mouse event', () => {
      const result = parseEmits({
        ...defaultEvent,
        complexType: {
          original: 'BalTeaserStepOption',
          resolved: 'BalTeaserStepOption',
          references: {
            BalTeaserStepOption: {
              location: 'import',
              path: '../bal-teaser-step/bal-teaser-step.type',
            },
          },
        },
      })
      expect(result).toBe(`    balClose: (value: Lib.BalTeaserStepOption) => true,`)
    })
  })
})
