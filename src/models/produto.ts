export interface RawProduto {
  número_item: number
  código_produto: string
  quantidade_produto: number
  valor_unitário_produto: string
}

export interface Produto extends Omit<RawProduto, 'valor_unitário_produto'> {
  valor_unitário_produto: number
}
