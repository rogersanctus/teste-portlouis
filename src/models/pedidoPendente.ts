export interface ItemPedidoPendente {
  número_item: number
  quantidade_pendente: number
}

export interface PedidoPendente {
  valor_total_pedido: number
  valor_total_pendente: number
  items_pendentes: ItemPedidoPendente[]
}
