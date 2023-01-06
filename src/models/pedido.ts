import groupBy from 'lodash/groupBy'
import { Produto } from './produto'

export interface Pedido extends Produto {
  id: number
}

export interface FinalPedido {
  id: number
  produtos: Produto[]
}

export function processPedidos(rawPedidos: Pedido[]) {
  const groupedPedidos = groupBy(rawPedidos, 'id')

  const processGroup = (group: Pedido[]) =>
    group.reduce<FinalPedido>((accum, pedido, idx) => {
      if (idx === 0) {
        accum.id = pedido.id
        accum.produtos = []
      }

      const produto = { ...pedido }
      delete (produto as any).id

      accum.produtos.push(produto)
      return accum
    }, {} as FinalPedido)

  return Object.keys(groupedPedidos).map<FinalPedido>((key) => {
    return processGroup(groupedPedidos[key])
  })
}
