import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';

import { ReturnRequest } from '../support/testData';
import { ReturnsPage } from '../ui/ReturnsPage';
import { OpenPage } from './OpenPage';

/** RF-11: llenar el formulario "Product Returns" y pulsar "Submit". */
export const RequestReturn = {
  of: (request: ReturnRequest) => Task.where(`#actor solicita la devolución de ${ request.product } del pedido ${ request.orderId }`,
    OpenPage.returnForm(),
    Enter.theValue(request.orderId).into(ReturnsPage.orderId()),
    Enter.theValue(request.firstName).into(ReturnsPage.firstName()),
    Enter.theValue(request.lastName).into(ReturnsPage.lastName()),
    Enter.theValue(request.email).into(ReturnsPage.email()),
    Enter.theValue(request.product).into(ReturnsPage.product()),
    Enter.theValue(request.model).into(ReturnsPage.model()),
    // Motivo 1: "Dead On Arrival"
    Click.on(ReturnsPage.reason(1)),
    Click.on(ReturnsPage.submit()),
  ),
};

export const SubmitTheReturnForm = {
  empty: () => Task.where('#actor envía el formulario de devoluciones vacío',
    OpenPage.returnForm(),
    Click.on(ReturnsPage.submit()),
  ),
};
