import Store, { Schema } from 'electron-store';

const schema: Schema<{
  mainWindowBounds: { width: number; height: number; x?: number; y?: number }
}> = {
  mainWindowBounds: {
    type: 'object',
    properties: {
      width: { type: 'number', default: 500 },
      height: { type: 'number', default: 400 },
      x: { type: 'number' },
      y: { type: 'number' },
    },
  },
}

export const store = new Store({
  schema,
})
