import { By, PageElement, PageElements } from '@serenity-js/web';

/** Lo que se repite en todas las páginas de la tienda. */
export const StorePage = {
  // Los avisos que la tienda agrega arriba de la página después de una acción.
  alerts: () => PageElements.located(By.css('#alert .alert')).describedAs('avisos de la página'),
  mainHeading: () => PageElement.located(By.css('#content h1')).describedAs('título de la página'),
  contentParagraphs: () => PageElements.located(By.css('#content p')).describedAs('párrafos del contenido'),
};
