import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { Logs } from '../../test/support/logs';
import { ClearErrorLog, ErrorLogInThePanel, OpenErrorLog } from '../../test/tasks/admin/Logs';

const administrator = () => actorCalled('Ana');

Given('el registro contiene la entrada {string}', async (message: string) => {
  await Logs.append(message);
});

When('la administradora abre el registro de errores', async () => {
  await administrator().attemptsTo(OpenErrorLog.now());
});

When('la administradora vacía el registro de errores', async () => {
  await administrator().attemptsTo(ClearErrorLog.now());
});

Then('ella ve la entrada {string}', async (message: string) => {
  await administrator().attemptsTo(Ensure.that(ErrorLogInThePanel.has(message), equals(true)));
});

Then('la entrada {string} tiene fecha y hora', async (message: string) => {
  await administrator().attemptsTo(Ensure.that(ErrorLogInThePanel.entryHasTimestamp(message), equals(true)));
});

Then('la entrada {string} aparece antes que {string}', async (first: string, second: string) => {
  await administrator().attemptsTo(Ensure.that(ErrorLogInThePanel.comesBefore(first, second), equals(true)));
});

Then('el registro de errores está vacío', async () => {
  await administrator().attemptsTo(Ensure.that(ErrorLogInThePanel.isEmpty(), equals(true)));
});
