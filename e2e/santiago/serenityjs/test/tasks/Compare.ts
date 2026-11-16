import { Task, Wait } from '@serenity-js/core';
import { isPresent } from '@serenity-js/assertions';
import { Click, isVisible } from '@serenity-js/web';

import { productId } from '../support/testData';
import { ComparePage } from '../ui/ComparePage';
import { ProductPage } from '../ui/ProductPage';
import { StorePage } from '../ui/StorePage';
import { OpenPage } from './OpenPage';

/** RF-10: el botón "Compare this Product" de la ficha. */
export const AddToComparison = {
  product: (product: string) => Task.where(`#actor agrega ${ product } a la comparación`,
    OpenPage.productDetail(product),
    Click.on(ProductPage.compareButton()),
    Wait.until(StorePage.alerts().first(), isPresent()),
  ),
};

/** RF-10: el enlace "Remove" de la columna del producto. */
export const RemoveFromComparison = {
  product: (product: string) => Task.where(`#actor quita ${ product } de la comparación`,
    OpenPage.comparison(),
    Click.on(ComparePage.removeLinkOf(productId(product))),
    Wait.until(ComparePage.successMessage(), isVisible()),
  ),
};
