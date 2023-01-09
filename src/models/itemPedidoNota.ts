export interface ItemNotasBrief {
  notas_id: number[]
  número_item: number
  quantidade_produto_notas: number
}

export interface ItemPedidoNotas extends ItemNotasBrief {
  quantidade_produto_pedido: number
  quantidade_pendente: number
  valor_unitário: number
  valor_total_item_pedido: number
  valor_total_item_notas: number
}
