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

/**
 *
 * @param items is a subset of Pedidos where all their Pedido id is the same
 */
export function validateItemsPedido(items: Pedido[]) {
  const id_pedido = items[0].id
  const firstNumeroItem = items[0].número_item
  let minNumeroItem = firstNumeroItem,
    maxNumeroItem = firstNumeroItem

  const duplicatedCheckingList = [...items].map((checkingItem, idx) => ({
    idx,
    ...checkingItem,
  }))
  let hasDuplicated = false

  items.forEach((item, idx) => {
    if (item.número_item > maxNumeroItem) maxNumeroItem = item.número_item
    if (item.número_item < minNumeroItem) minNumeroItem = item.número_item

    if (
      duplicatedCheckingList.find(
        (checkingItem) =>
          idx !== checkingItem.idx &&
          checkingItem.número_item === item.número_item
      )
    ) {
      hasDuplicated = true
      duplicatedCheckingList.splice(0, duplicatedCheckingList.length)
    } else {
      const toDeleteIdx = duplicatedCheckingList.findIndex(
        (checkingItem) => checkingItem.idx === idx
      )

      if (toDeleteIdx !== -1) {
        duplicatedCheckingList.splice(toDeleteIdx, 1)
      }
    }
  })

  let haveAll = true
  const copy = [...items]

  for (let num = minNumeroItem; num <= maxNumeroItem; num++) {
    const found = copy.findIndex((item) => item.número_item === num)

    if (found === -1) {
      haveAll = false
      break
    }

    copy.splice(found, 1)
  }

  if (!haveAll) {
    return new Error(
      `The Pedido with id: ${id_pedido} has not all the número_item inside de sequence between ${minNumeroItem} and ${maxNumeroItem}.`
    )
  }

  if (hasDuplicated) {
    return new Error(
      `The Pedido with id: ${id_pedido} has items with duplicated número_item.`
    )
  }

  return true
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
