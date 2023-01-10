import { Dictionary } from 'lodash'
import groupBy from 'lodash/groupBy'
import { ItemNotasBrief, ItemPedidoNotas } from '../models/itemPedidoNota'
import { Nota } from '../models/nota'
import { NotaPedido } from '../models/notaPedido'
import { Pedido, validateItemsPedido } from '../models/pedido'

export function makeNotasPedidos(
  groupedPedidos: Dictionary<Pedido[]>,
  notas: Nota[]
) {
  return Object.keys(groupedPedidos)
    .map<NotaPedido | undefined>((groupKey) => {
      const id_pedido = Number(groupKey)

      if (isNaN(id_pedido)) {
        return undefined
      }

      const itemsPedido = groupedPedidos[groupKey]
      const itemsPedidoValidation = validateItemsPedido(itemsPedido)

      if (itemsPedidoValidation instanceof Error) {
        throw itemsPedidoValidation
      }

      const groupedNotas = groupBy(
        notas.filter((nota) => nota.id_pedido === id_pedido),
        'número_item'
      )

      const itemsPedidoNotas = Object.keys(groupedNotas)
        .map<ItemPedidoNotas | undefined>((key) => {
          const itemsNotas = groupedNotas[key]
          const itemNotasBrief = itemsNotas.reduce<ItemNotasBrief>(
            (accum, itemNotas, idx) => {
              if (idx === 0) {
                accum.quantidade_produto_notas = 0
                accum.número_item = itemNotas.número_item
                accum.notas_id = []
              }
              accum.quantidade_produto_notas += itemNotas.quantidade_produto
              accum.notas_id.push(itemNotas.id)

              return accum
            },
            {} as ItemNotasBrief
          )

          const itemPedido = itemsPedido.find(
            (itemPedido) =>
              itemPedido.número_item === itemNotasBrief.número_item
          )

          if (itemPedido) {
            const quantidade_pendente =
              itemPedido.quantidade_produto -
              itemNotasBrief.quantidade_produto_notas

            if (quantidade_pendente < 0) {
              throw new Error(
                `O item de número: ${itemPedido.número_item} do Pedido de id: ${itemPedido.id} teve sua quantidade de ${itemPedido.quantidade_produto} ultrapassada pelo somatório das quantidades de items nas notas relacionadas ao mesmo item neste pedido.`
              )
            }

            let valor_total_item_pedido = 0
            let valor_total_item_notas = 0

            if (!isNaN(itemPedido.valor_unitário_produto)) {
              valor_total_item_pedido =
                itemPedido.quantidade_produto *
                itemPedido.valor_unitário_produto
              valor_total_item_notas =
                itemNotasBrief.quantidade_produto_notas *
                itemPedido.valor_unitário_produto
            } else {
              throw new Error(
                `O valor_unitário_produto para o item de número: ${itemPedido.número_item} do Pedido de id: ${itemPedido.id} não é um valor decimal monetário correto.`
              )
            }

            return {
              ...itemNotasBrief,
              quantidade_produto_pedido: itemPedido.quantidade_produto,
              quantidade_pendente,
              valor_unitário: itemPedido.valor_unitário_produto,
              valor_total_item_pedido,
              valor_total_item_notas,
            }
          }

          return undefined
        })
        .filter<ItemPedidoNotas>(
          (itemPedidoNotas): itemPedidoNotas is ItemPedidoNotas =>
            itemPedidoNotas !== undefined
        )

      return {
        id_pedido,
        itemsPedidoNotas,
      }
    })
    .filter<NotaPedido>(
      (notaPedido): notaPedido is NotaPedido =>
        notaPedido !== undefined &&
        notaPedido.itemsPedidoNotas.some(
          (itemPedidoNotas) => itemPedidoNotas.quantidade_pendente > 0
        )
    )
}
