import { initDB } from './utils/dbReader'
import { Pedido } from './models/pedido'
import { Nota, validateNotasItems } from './models/nota'
import groupBy from 'lodash/groupBy'
import { processDB } from './utils/dbProcessor'
import { makeNotasPedidos } from './services/notasPedidos'
import { makePedidosPendentes } from './services/pedidosPendentes'

initDB('./assets/db').then((db) => {
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

  console.dir(pedidosPendentes, { depth: Infinity })
})
