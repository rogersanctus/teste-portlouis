import groupBy from 'lodash/groupBy'

export interface NotaItem {
  id_pedido: number
  número_item: number
  quantidade_produto: number
}

export interface Nota extends NotaItem {
  id: number
}

export interface FinalNota {
  id: number
  items: NotaItem[]
}

export function processNotas(rawNotas: Nota[]) {
  return [...rawNotas]
}
