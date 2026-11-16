import { Then, When } from '@cucumber/cucumber';
import { containAtLeastOneItemThat, Ensure, equals, includes, not } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';

import { Messages } from '../../test/questions/StoreQuestions';
import { OpenPage } from '../../test/tasks/OpenPage';

When('{actor} abre el carrito', async (actor: Actor) => {
  await actor.attemptsTo(OpenPage.cart());
});

When('{pronoun} abre el carrito', async (actor: Actor) => {
  await actor.attemptsTo(OpenPage.cart());
});

Then('{pronoun} ve el aviso {string}', async (actor: Actor, message: string) => {
  await actor.attemptsTo(Ensure.eventually(Messages.latestAlert(), equals(message)));
});

Then('{pronoun} no ve el aviso {string}', async (actor: Actor, message: string) => {
  await actor.attemptsTo(Ensure.eventually(Messages.latestAlert(), not(equals(message))));
});

Then('{pronoun} ve el texto {string}', async (actor: Actor, text: string) => {
  await actor.attemptsTo(Ensure.eventually(Messages.paragraphs(), containAtLeastOneItemThat(includes(text))));
});
