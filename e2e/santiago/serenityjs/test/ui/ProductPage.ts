import { By, PageElement, PageElements } from '@serenity-js/web';

/** index.php?route=product/product&product_id=… — RF-07, RF-09 y RF-10 */
export const ProductPage = {
  quantity: () => PageElement.located(By.css('#input-quantity')).describedAs('cantidad'),
  addToCartButton: () => PageElement.located(By.css('#button-cart')).describedAs('botón Add to Cart'),
  compareButton: () => PageElement.located(By.css("button.btn-lg[formaction*='product/compare.add']")).describedAs('botón "Compare this Product" del producto'),

  // Pestaña "Reviews" y formulario "Write a review"
  reviewsTab: () => PageElement.located(By.css("a[href='#tab-review']")).describedAs('pestaña Reviews'),
  reviewAuthor: () => PageElement.located(By.css('#input-author')).describedAs('campo Your Name'),
  reviewText: () => PageElement.located(By.css('#input-text')).describedAs('campo Your Review'),
  reviewRating: (stars: number) => PageElement.located(By.css(`#form-review input[name='rating'][value='${ stars }']`))
    .describedAs(`calificación de ${ stars } estrellas`),
  reviewSubmit: () => PageElement.located(By.css('#button-review')).describedAs('botón Continue de la reseña'),
  reviewError: (field: 'author' | 'text' | 'rating') => PageElement.located(By.css(`#error-${ field }`)).describedAs(`error del campo ${ field }`),

  // Las reseñas publicadas: cada una es una tabla con el autor en negrita y las estrellas.
  publishedReviewAuthors: () => PageElements.located(By.css('#review table strong')).describedAs('autores de las reseñas publicadas'),
  starsOfReviewBy: (author: string) =>
    PageElements.located(By.xpath(`//div[@id='review']//table[.//strong[normalize-space()='${ author }']]//i[contains(@class, 'fa-solid') and contains(@class, 'fa-star')]`))
      .describedAs(`estrellas de la reseña de ${ author }`),
};
