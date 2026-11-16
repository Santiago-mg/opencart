import type { Task } from '../../screenplay/actor'
import { productId } from '../../screenplay/testData'
import { send } from './StoreRequest'

/** RF-06: la página de resultados, pedida directamente (responde HTML). */
export const SearchViaHttp = {
  for:
    (term: string, extra: Record<string, string | number> = {}): Task =>
    (actor) => {
      send(actor, 'product/search', { parameters: { search: term, ...extra } })
    },
}

/** RF-10: la acción que llama el botón "Compare this Product". */
export const CompareViaApi = {
  product: (product: string): Task => (actor) => {
    send(actor, 'product/compare.add', { fields: { product_id: productId(product) } })
  },
  productWithId: (id: number): Task => (actor) => {
    send(actor, 'product/compare.add', { fields: { product_id: id } })
  },
}
