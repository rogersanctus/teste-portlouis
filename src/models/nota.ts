import { isInteger, isPositive, isValidNumber } from '../utils/dataValidators'
import { Pedido } from './pedido'

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

function validateNota(nota: Nota) {
  if (!isValidNumber(nota.id_pedido)) {
    return new Error(
      `The id_pedido the nota with id: ${nota.id} is not a valid number`
    )
  }

  if (
    !isValidNumber(nota.número_item) ||
    !isInteger(nota.número_item) ||
    nota.número_item < 0
  ) {
    return new Error(
      `The número_item of the nota with id ${nota.id} is not a valid positive and integer number`
    )
  }

  if (
    !isValidNumber(nota.quantidade_produto) ||
    !isInteger(nota.quantidade_produto) ||
    !isPositive(nota.quantidade_produto)
  ) {
    return new Error(
      `The quantidade_produto of the nota with id ${nota.id} is not a valid positive and integer number`
    )
  }

  return true
}

export function validateNotasItems(notas: Nota[], pedidos: Pedido[]) {
  for (const notaItem of notas) {
    const pedidoItem = pedidos.find(
      (pedido) =>
        pedido.id === notaItem.id_pedido &&
        pedido.número_item === notaItem.número_item
    )

    if (pedidoItem === undefined) {
      return new Error(
        `The Item, of the Nota with id: ${notaItem.id}, with the número_item: ${notaItem.número_item} was not found in the refered Pedido with id_pedido: ${notaItem.id_pedido}`
      )
    }
  }

  return true
}

export function processNotas(rawNotas: Nota[]) {
  return rawNotas.map((nota) => {
    const error = validateNota(nota)

    if (error instanceof Error) {
      throw error
    }

    return nota
  })
}
