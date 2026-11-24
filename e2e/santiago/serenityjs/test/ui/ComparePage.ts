import { By, PageElement, PageElements } from '@serenity-js/web';

// Cada fila de la tabla empieza con el nombre del dato ("Product", "Price"...).
const cellsOf = (row: string) => `//div[@id='content']//table/tbody/tr[td[1][normalize-space()='${ row }']]/td[position() > 1]`;

/** index.php?route=product/compare — RF-10 */
export const ComparePage = {
  productNames: () => PageElements.located(By.xpath(`${ cellsOf('Product') }//strong`)).describedAs('productos comparados'),
  row: (name: string) => PageElements.located(By.xpath(cellsOf(name))).describedAs(`fila "${ name }" de la comparación`),
  removeLinkOf: (productId: number) =>
    PageElement.located(By.xpath(`//a[normalize-space()='Remove' and contains(@href, 'remove=${ productId }')]`)).describedAs('enlace Remove'),
  successMessage: () => PageElement.located(By.css('#product-compare > .alert-success')).describedAs('aviso de cambio en la comparación'),
};
