import type { Task } from '../../screenplay/actor'
import { send } from './StoreRequest'

/** RF-07: la acción que llama el botón "Add to Cart". */
export const AddToCartViaApi = {
  units: (quantity: number | string, productId: number): Task => (actor) => {
    send(actor, 'checkout/cart.add', { fields: { product_id: productId, quantity } })
  },
}

/** RF-08: las acciones del acordeón "Use Coupon Code". */
export const ApplyCouponViaApi = {
  withCode: (code: string): Task => (actor) => {
    send(actor, 'extension/opencart/checkout/coupon.save', { fields: { coupon: code } })
  },
}

export const RemoveCouponViaApi = {
  fromTheCart: (): Task => (actor) => {
    send(actor, 'extension/opencart/checkout/coupon.remove', { fields: {} })
  },
}
