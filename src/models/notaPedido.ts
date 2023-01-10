import { ItemPedidoNotas } from './itemPedidoNota'

export interface NotaPedido {
  id_pedido: number
  itemsPedidoNotas: ItemPedidoNotas[]
}
