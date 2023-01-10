import { processNotas } from '../models/nota'
import { processPedidos } from '../models/pedido'
import { DB } from './dbReader'

const processors = {
  processPedidos,
  processNotas,
}

type Processors = typeof processors

export function processDB(db: DB) {
  const keys = Object.keys(db)

  return keys.reduce<DB>((accum, key) => {
    const entry = db[key]

    if (Array.isArray(entry)) {
      const funcKey = ('process' + key) as keyof Processors
      const processor = processors[funcKey]

      if (typeof processor === 'function') {
        accum[key] = processor(entry)
      }
    }

    return accum
  }, {})
}
