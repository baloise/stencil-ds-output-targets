import { createComponentDefinition } from '../src/generate-vue-component'

describe('createComponentDefinition', () => {
  it('should create a Vue component with the render method using createCommonRender', () => {
    const output = createComponentDefinition(
      'Components',
      [],
    )({
      properties: [],
      tagName: 'my-component',
      methods: [],
      events: [],
    })

    expect(output).toEqual(`export const MyComponent = /*@__PURE__*/ defineComponent({
  name: 'my-component',
  props: {

  },
  emits: {

  },
  setup: defineSetup('my-component', [], undefined)
})
`)
  })

  it('should pass event references to the createCommonRender function', () => {
    const output = createComponentDefinition(
      'Components',
      [],
    )({
      properties: [],
      tagName: 'my-component',
      methods: [],
      events: [
        {
          internal: false,
          name: 'my-event',
          method: '',
          bubbles: true,
          cancelable: true,
          composed: false,
          docs: {
            text: '',
            tags: [],
          },
          complexType: {
            original: '',
            resolved: '',
            references: {},
          },
        },
      ],
    })

    expect(output).toEqual(`export const MyComponent = /*@__PURE__*/ defineComponent({
  name: 'my-component',
  props: {

  },
  emits: {
    my-event: (value: ) => true,
  },
  setup: defineSetup('my-component', ['my-event'], undefined)
})
`)
  })

  it('should add a prop with Reference to the original component library prop type', () => {
    const output = createComponentDefinition(
      'Components',
      [],
    )({
      properties: [
        {
          name: 'myProp',
          internal: false,
          mutable: false,
          optional: false,
          required: false,
          type: 'string',
          complexType: {
            original: '',
            resolved: '',
            references: {},
          },
          docs: {
            text: '',
            tags: [],
          },
        },
      ],
      tagName: 'my-component',
      methods: [],
      events: [],
    })

    expect(output).toEqual(`export const MyComponent = /*@__PURE__*/ defineComponent({
  name: 'my-component',
  props: {
    myProp: {
      type: String,
      default: undefined,
      required: false,
    },
  },
  emits: {

  },
  setup: defineSetup('my-component', [], undefined)
})
`)
  })

  it('should add a method with Reference to the original component library prop type', () => {
    const output = createComponentDefinition('Components', [
      {
        event: 'myChange',
        targetAttr: 'myProp',
        elements: 'my-component',
      },
    ])({
      properties: [
        {
          name: 'myProp',
          internal: false,
          mutable: false,
          optional: false,
          required: false,
          type: 'string',
          complexType: {
            original: '',
            resolved: '',
            references: {},
          },
          docs: {
            text: '',
            tags: [],
          },
        },
      ],
      tagName: 'my-component',
      methods: [],
      events: [
        {
          internal: false,
          name: 'myChange',
          method: '',
          bubbles: true,
          cancelable: true,
          composed: false,
          docs: {
            text: '',
            tags: [],
          },
          complexType: {
            original: '',
            resolved: '',
            references: {},
          },
        },
      ],
    })

    expect(output).toEqual(`export const MyComponent = /*@__PURE__*/ defineComponent({
  name: 'my-component',
  props: {
    myProp: {
      type: String,
      default: undefined,
      required: false,
    },
    modelValue: {
      default: undefined,
    },
  },
  emits: {
    myChange: (value: ) => true,
    'update:modelValue': (value: any) => true,
  },
  setup: defineSetup('my-component', ['myChange','update:modelValue'], {
    modelProp: 'myProp',
    modelUpdateEvent: 'myChange'
  })
})
`)
  })
})
