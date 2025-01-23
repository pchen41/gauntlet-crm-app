import { Extension } from '@tiptap/core'

export const TextSize = Extension.create({
  name: 'textSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: 'text-sm',
            parseHTML: element => element.getAttribute('data-size'),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                'data-size': attributes.fontSize,
                class: attributes.fontSize,
              }
            },
          },
        },
      },
    ]
  },
}) 