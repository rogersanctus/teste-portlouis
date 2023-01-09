import { initDB } from './utils/dbReader'
import { Pedido } from './models/pedido'
import { Nota } from './models/nota'
import groupBy from 'lodash/groupBy'
import { processDB } from './utils/dbProcessor'

interface ItemPedidoPendente {
  número_item: number
  quantidade_pendente: number
}

interface PedidoPendente {
  valor_total_pedido: number
  valor_total_pendente: number
  items: Pedido[]
  items_pendentes: ItemPedidoPendente[]
}

interface ItemNotasBrief {
  notas_id: number[]
  número_item: number
  quantidade_produto_notas: number
}

interface ItemsPedidoNotas extends ItemNotasBrief {
  quantidade_produto_pedido: number
  quantidade_pendente: number
  valor_unitário: number
  valor_total_item_pedido: number
  valor_total_item_notas: number
}

interface NotaPedido {
  id_pedido: number
  itemsPedidoNotas: ItemsPedidoNotas[]
}

initDB('./assets/db').then((db) => {
  db = processDB(db)
  const pedidos = db.Pedidos as Pedido[]
  const notas = db.Notas as Nota[]

  const groupedPedidos = groupBy(pedidos, 'id')
  const notasPedidos = Object.keys(groupedPedidos).map<NotaPedido | undefined>(
    (groupKey) => {
      const id_pedido = Number(groupKey)

      if (isNaN(id_pedido)) {
        return undefined
      }

      const itemsPedido = groupedPedidos[groupKey]
      const groupedNotas = groupBy(
        notas.filter((nota) => nota.id_pedido === id_pedido),
        'número_item'
      )

      const itemsPedidoNotas = Object.keys(groupedNotas)
        .map<ItemsPedidoNotas | undefined>((key) => {
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
        .filter<ItemsPedidoNotas>(
          (itemPedidoNotas): itemPedidoNotas is ItemsPedidoNotas =>
            itemPedidoNotas !== undefined
        )

      return {
        id_pedido,
        itemsPedidoNotas,
      }
    }
  )

  const pedidosPendentes = notasPedidos
    .filter<NotaPedido>(
      (notaPedido): notaPedido is NotaPedido =>
        notaPedido !== undefined &&
        notaPedido.itemsPedidoNotas.some(
          (itemPedidoNotas) => itemPedidoNotas.quantidade_pendente > 0
        )
    )
    .map((pedidoPendente) => {
      const brief = pedidoPendente.itemsPedidoNotas.reduce(
        (accum, itemPedidoNotas, idx) => {
          if (!itemPedidoNotas) {
            return accum
          }

          if (idx === 0) {
            accum.valor_total_pedido = accum.valor_total_pendente = 0
            accum.items = [...groupedPedidos[pedidoPendente.id_pedido]]
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

  console.dir(pedidosPendentes, { depth: Infinity })
})
