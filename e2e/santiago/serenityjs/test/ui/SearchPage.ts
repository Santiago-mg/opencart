import { By, PageElement, PageElements } from '@serenity-js/web';

const PRODUCT_CARDS = "//div[contains(@class, 'product-thumb')]";

/** index.php?route=product/search — RF-06 */
export const SearchPage = {
  searchBox: () => PageElement.located(By.css('#input-search')).describedAs('buscador'),
  searchButton: () => PageElement.located(By.css('#button-search')).describedAs('botón Search'),
  searchInDescription: () => PageElement.located(By.css('#input-description')).describedAs('casilla "Search in product descriptions"'),
  category: () => PageElement.located(By.css('#input-category')).describedAs('lista de categorías'),
  includeSubcategories: () => PageElement.located(By.css('#input-sub-category')).describedAs('casilla "Search in subcategories"'),
  sortBy: () => PageElement.located(By.css('#input-sort')).describedAs('lista "Sort By"'),
  productNames: () => PageElements.located(By.xpath(`${ PRODUCT_CARDS }//h4/a`)).describedAs('nombres de los productos encontrados'),
  // El botón "Compare this Product" de la tarjeta de un producto.
  compareButtonOf: (product: string) =>
    PageElement.located(By.xpath(`${ PRODUCT_CARDS }[.//h4/a[normalize-space()='${ product }']]//button[contains(@formaction, 'product/compare.add')]`))
      .describedAs(`botón "Compare this Product" de ${ product }`),
};
