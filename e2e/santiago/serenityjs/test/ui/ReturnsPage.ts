import { By, PageElement } from '@serenity-js/web';

/** index.php?route=account/returns.add — RF-11 */
export const ReturnsPage = {
  orderId: () => PageElement.located(By.css('#input-order-id')).describedAs('campo Order ID'),
  firstName: () => PageElement.located(By.css('#input-firstname')).describedAs('campo First Name'),
  lastName: () => PageElement.located(By.css('#input-lastname')).describedAs('campo Last Name'),
  email: () => PageElement.located(By.css('#input-email')).describedAs('campo E-Mail'),
  product: () => PageElement.located(By.css('#input-product')).describedAs('campo Product Name'),
  model: () => PageElement.located(By.css('#input-model')).describedAs('campo Product Code'),
  reason: (reasonId: number) => PageElement.located(By.css(`#input-return-reason-${ reasonId }`)).describedAs('motivo de la devolución'),
  submit: () => PageElement.located(By.css('#form-return button[type=submit]')).describedAs('botón Submit'),
  error: (field: string) => PageElement.located(By.css(`#error-${ field }`)).describedAs(`error del campo ${ field }`),
};
