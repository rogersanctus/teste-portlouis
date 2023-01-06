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
  const groupedNotas = groupBy(rawNotas, 'id')

  const processGroup = (group: Nota[]) =>
    group.reduce<FinalNota>((accum, nota, idx) => {
      if (idx === 0) {
        accum.id = nota.id
        accum.items = []
      }

      const item = { ...nota }
      delete (item as any).id

      accum.items.push(item)
      return accum
    }, {} as FinalNota)

  return Object.keys(groupedNotas).map<FinalNota>((key) => {
    return processGroup(groupedNotas[key])
  })
}
