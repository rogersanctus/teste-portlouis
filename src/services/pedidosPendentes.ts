import { NotaPedido } from '../models/notaPedido'
import { PedidoPendente } from '../models/pedidoPendente'

export function makePedidosPendentes(notasPedidos: NotaPedido[]) {
  return notasPedidos.map((pedidoPendente) => {
    const brief = pedidoPendente.itemsPedidoNotas.reduce(
      (accum, itemPedidoNotas, idx) => {
        if (!itemPedidoNotas) {
          return accum
        }

        if (idx === 0) {
          accum.valor_total_pedido = accum.valor_total_pendente = 0
          accum.items_pendentes = []
        }

        accum.valor_total_pedido += itemPedidoNotas.valor_total_item_pedido

        accum.valor_total_pendente +=
          itemPedidoNotas.quantidade_pendente * itemPedidoNotas.valor_unitário

        accum.items_pendentes.push({
          número_item: itemPedidoNotas.número_item,
          quantidade_pendente: itemPedidoNotas.quantidade_pendente,
        })
        return accum
      },
      {} as PedidoPendente
    )

    return {
      id_pedido: pedidoPendente.id_pedido,
      ...brief,
    }
  })
}
