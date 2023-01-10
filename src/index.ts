import { initDB } from './utils/dbReader'
import { Pedido } from './models/pedido'
import { Nota, validateNotasItems } from './models/nota'
import groupBy from 'lodash/groupBy'
import { processDB } from './utils/dbProcessor'
import { makeNotasPedidos } from './services/notasPedidos'
import { makePedidosPendentes } from './services/pedidosPendentes'
import { writeToDB } from './utils/dbWriter'

const DB_PATH = './assets/db'

initDB(DB_PATH).then((db) => {
  db = processDB(db)
  const pedidos = db.Pedidos as Pedido[]
  const notas = db.Notas as Nota[]

  const notasItemsValidation = validateNotasItems(notas, pedidos)

  if (notasItemsValidation instanceof Error) {
    throw notasItemsValidation
  }

  const groupedPedidos = groupBy(pedidos, 'id')
  const notasPedidos = makeNotasPedidos(groupedPedidos, notas)
  const pedidosPendentes = makePedidosPendentes(notasPedidos)
  const pedidosPendentesFormatted = pedidosPendentes.map(
    (itemPedidoPendente) => {
      const formatter = Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false,
      })

      return {
        ...itemPedidoPendente,
        valor_total_pedido: formatter.format(
          itemPedidoPendente.valor_total_pedido
        ),
        valor_total_pendente: formatter.format(
          itemPedidoPendente.valor_total_pendente
        ),
      }
    }
  )

  console.dir(pedidosPendentes, { depth: Infinity })
  writeToDB(
    DB_PATH,
    'PedidosPendentes',
    'Itens_Pendentes.txt',
    pedidosPendentesFormatted
  )
})
