import { initDB } from './utils/dbReader'
import { FinalPedido } from './models/pedido'
import { FinalNota, NotaItem } from './models/nota'
import { processDB } from './utils/dbProcessor'
import cloneDeep from 'lodash/cloneDeep'

initDB('./assets/db').then((db) => {
  db = processDB(db)
  const pedidos = db.Pedidos as FinalPedido[]
  const notas = db.Notas as FinalNota[]

  const pedidosNotas = pedidos.map((pedido) => {
    const notasPedido: FinalNota[] = []

    notas.forEach((nota) => {
      const newItems = nota.items.filter(
        (notaItem) => notaItem.id_pedido === pedido.id
      )

      if (newItems.length > 0) {
        notasPedido.push({ ...nota, items: newItems })
      }
    })

    return {
      pedido,
      notas: notasPedido,
    }
  })

  const totaisPedidosNotas = pedidosNotas.map((pedidoNota) => {
    const notasCopy = cloneDeep(pedidoNota.notas)
    const sameItems: { [key: number]: NotaItem & { itemsNota?: NotaItem[] } } =
      {}

    const notas = notasCopy.reduce((accum, nota) => {
      nota.items.forEach((notaItem) => {
        accum[notaItem.número_item] = {
          id_pedido: notaItem.id_pedido,
          número_item: notaItem.número_item,
          quantidade_produto: notaItem.quantidade_produto,
          itemsNota: [notaItem],
        }

        notasCopy.forEach((otherNota, otherNotaIdx) => {
          if (otherNota !== nota) {
            otherNota.items.forEach((otherNotaItem, idx) => {
              if (notaItem.número_item === otherNotaItem.número_item) {
                accum[notaItem.número_item].quantidade_produto +=
                  otherNotaItem.quantidade_produto
                accum[notaItem.número_item].itemsNota?.push(otherNotaItem)

                otherNota.items.splice(idx, 1)

                if (otherNota.items.length === 0) {
                  notasCopy.splice(otherNotaIdx, 1)
                }
              }
            })
          }
        })
      })

      return accum
    }, sameItems)

    return {
      ...pedidoNota,
      notas,
    }
  })

  console.dir(totaisPedidosNotas, { depth: Infinity })
})
