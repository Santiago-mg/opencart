import { defineParameterType } from '@cucumber/cucumber';
import { actorCalled, actorInTheSpotlight } from '@serenity-js/core';

// Quien hace la acción: "Carlos busca...", "Bruno abre...".
defineParameterType({
  name: 'actor',
  regexp: /[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/,
  transformer: (name: string) => actorCalled(name),
});

// "él" / "ella": el último actor que habló en el escenario.
defineParameterType({
  name: 'pronoun',
  regexp: /él|ella/,
  transformer: () => actorInTheSpotlight(),
});

// Una lista escrita en el escenario: "iMac, MacBook, MacBook Air".
defineParameterType({
  name: 'list',
  regexp: /"([^"]*)"/,
  transformer: (text: string): string[] => text.split(',').map((item) => item.trim()).filter(Boolean),
  useForSnippets: false,
});
