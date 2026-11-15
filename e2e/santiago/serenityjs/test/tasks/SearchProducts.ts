import { Task, Wait } from '@serenity-js/core';
import { includes } from '@serenity-js/assertions';
import { Clear, Click, Enter, Page, Select, Text } from '@serenity-js/web';

import { CATEGORIES } from '../support/testData';
import { SearchPage } from '../ui/SearchPage';
import { StorePage } from '../ui/StorePage';
import { OpenPage } from './OpenPage';

const typeAndSearch = (term: string) => [
  Clear.theValueOf(SearchPage.searchBox()),
  Enter.theValue(term).into(SearchPage.searchBox()),
];

// Al buscar, la tienda recarga la página con el término en el título: "Search - mac".
const waitForTheResultsOf = (term: string) => Wait.until(Text.of(StorePage.mainHeading()), includes(term));

/** RF-06: escribir en el buscador, elegir criterios y pulsar "Search". */
export const SearchProducts = {
  for: (term: string) => Task.where(`#actor busca "${ term }"`,
    OpenPage.search(),
    ...typeAndSearch(term),
    Click.on(SearchPage.searchButton()),
    waitForTheResultsOf(term),
  ),
  inDescriptionsFor: (term: string) => Task.where(`#actor busca "${ term }" también en las descripciones`,
    OpenPage.search(),
    ...typeAndSearch(term),
    Click.on(SearchPage.searchInDescription()),
    Click.on(SearchPage.searchButton()),
    waitForTheResultsOf(term),
  ),
  inCategory: (term: string, category: string, includingSubcategories: boolean) =>
    Task.where(`#actor busca "${ term }" en ${ category }${ includingSubcategories ? ' y sus subcategorías' : '' }`,
      OpenPage.search(),
      ...typeAndSearch(term),
      Select.value(CATEGORIES[category]).from(SearchPage.category()),
      ...(includingSubcategories ? [Click.on(SearchPage.includeSubcategories())] : []),
      Click.on(SearchPage.searchButton()),
      waitForTheResultsOf(term),
    ),
};

/** RF-06: la lista "Sort By" recarga la página con el orden elegido. */
export const SortResults = {
  by: (option: string) => Task.where(`#actor ordena los resultados por "${ option }"`,
    Select.option(option).from(SearchPage.sortBy()),
    Wait.until(Page.current().url().href, includes('sort=')),
  ),
};
