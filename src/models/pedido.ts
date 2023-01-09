import { Produto, RawProduto } from './produto'

export interface Pedido extends Produto {
  id: number
}

interface RawPedido extends RawProduto {
  id: number
}

export function processPedidos(rawPedidos: RawPedido[]) {
  return rawPedidos.map((rawPedido) => {
    const valorUnitario = Number(
      rawPedido.valor_unitário_produto.replace(',', '.')
    )

    return {
      ...rawPedido,
      valor_unitário_produto: valorUnitario,
    } as Pedido
  })
}
