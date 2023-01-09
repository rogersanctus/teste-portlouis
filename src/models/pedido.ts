import {
  isAlphaNumeric,
  isFractionLike,
  isInteger,
  isPositive,
  isValidNumber,
} from '../utils/dataValidators'
import { Produto, RawProduto } from './produto'

export interface Pedido extends Produto {
  id: number
}

export interface RawPedido extends RawProduto {
  id: number
}

function validatePedido(pedido: RawPedido) {
  if (
    !isValidNumber(pedido.número_item) ||
    !isInteger(pedido.número_item) ||
    pedido.número_item < 0
  ) {
    return new Error(
      `The número_item of the pedido with id ${pedido.id} is not a valid positive and integer number`
    )
  }

  if (!isAlphaNumeric(pedido.código_produto)) {
    return new Error(
      `The código_produto of the pedido with id ${pedido.id} is not a valid alphanumeric value`
    )
  }

  if (
    !isValidNumber(pedido.quantidade_produto) ||
    !isInteger(pedido.quantidade_produto) ||
    !isPositive(pedido.quantidade_produto)
  ) {
    return new Error(
      `The quantidade_produto of the pedido with id ${pedido.id} is not a valid positive and integer number`
    )
  }

  if (!isFractionLike(pedido.valor_unitário_produto)) {
    return new Error(
      `The valor_unitário_produto of the pedido with id ${pedido.id} is not a valid decimal value`
    )
  }

  const valorUnitario = Number(pedido.valor_unitário_produto.replace(',', '.'))

  if (isNaN(valorUnitario) || !isPositive(valorUnitario)) {
    return new Error(
      `The valor_unitário_produto of the pedido with id ${pedido.id} is not a valid positive number`
    )
  }

  return { ...pedido, valorUnitario }
}

export function processPedidos(rawPedidos: RawPedido[]) {
  return rawPedidos.map((rawPedido) => {
    const result = validatePedido(rawPedido)

    if (result instanceof Error) {
      throw result
    }

    return {
      ...rawPedido,
      valor_unitário_produto: result.valorUnitario,
    } as Pedido
  })
}
