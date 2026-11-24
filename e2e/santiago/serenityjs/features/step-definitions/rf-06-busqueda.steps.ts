import { Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';

import { SearchResults } from '../../test/questions/StoreQuestions';
import { SearchProducts, SortResults } from '../../test/tasks/SearchProducts';

When('{actor} busca {string}', async (actor: Actor, term: string) => {
  await actor.attemptsTo(SearchProducts.for(term));
});

When('{actor} busca {string} también en las descripciones', async (actor: Actor, term: string) => {
  await actor.attemptsTo(SearchProducts.inDescriptionsFor(term));
});

When('{actor} busca {string} en la categoría {string} sin subcategorías', async (actor: Actor, term: string, category: string) => {
  await actor.attemptsTo(SearchProducts.inCategory(term, category, false));
});

When('{actor} busca {string} en la categoría {string} incluyendo subcategorías', async (actor: Actor, term: string, category: string) => {
  await actor.attemptsTo(SearchProducts.inCategory(term, category, true));
});

When('{pronoun} ordena los resultados por {string}', async (actor: Actor, option: string) => {
  await actor.attemptsTo(SortResults.by(option));
});

Then('{pronoun} ve los productos {list}', async (actor: Actor, products: string[]) => {
  await actor.attemptsTo(Ensure.eventually(SearchResults.inAnyOrder(), equals([...products].sort())));
});

Then('{pronoun} ve los productos en este orden: {list}', async (actor: Actor, products: string[]) => {
  await actor.attemptsTo(Ensure.eventually(SearchResults.inOrder(), equals(products)));
});
