import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { TestData } from '../../test/support/testData';
import {
  AddCurrency,
  CurrencyForm,
  CurrenciesInThePanel,
  DeleteCurrency,
  SaveCurrency,
  SetCurrencyStatus,
} from '../../test/tasks/admin/Currencies';

const administrator = () => actorCalled('Ana');

const addCurrency = async (base: string, value: string) => {
  const currency = TestData.currency(base, { value, decimalPlace: 2 });
  await administrator().attemptsTo(AddCurrency.of(currency));
};

When('la administradora agrega la moneda {string} con valor {string} y dos decimales', async (base: string, value: string) => {
  await addCurrency(base, value);
});

Given('la administradora agregó la moneda {string} con valor {string} y dos decimales', async (base: string, value: string) => {
  await addCurrency(base, value);
});

When('la administradora cambia el valor de la moneda {string} a {string}', async (base: string, value: string) => {
  const currency = TestData.currencyNamed(base);
  currency.value = value;
  await administrator().attemptsTo(SaveCurrency.of(currency));
});

When('la administradora cambia el estado de la moneda {string} a {string}', async (base: string, status: string) => {
  const currency = TestData.currencyNamed(base);
  currency.status = status === 'habilitada';
  await administrator().attemptsTo(SaveCurrency.of(currency));
});

When('la administradora deshabilita la moneda {string}', async (base: string) => {
  await administrator().attemptsTo(SetCurrencyStatus.of(TestData.currencyNamed(base), false));
});

When('la administradora habilita la moneda {string}', async (base: string) => {
  await administrator().attemptsTo(SetCurrencyStatus.of(TestData.currencyNamed(base), true));
});

When('la administradora borra la moneda {string}', async (base: string) => {
  await administrator().attemptsTo(DeleteCurrency.of(TestData.currencyNamed(base)));
});

Then('la moneda {string} aparece habilitada', async (base: string) => {
  const currency = TestData.currencyNamed(base);
  await administrator().attemptsTo(Ensure.that(CurrenciesInThePanel.statusOf(currency.title), equals('Enabled')));
});

Then('la moneda {string} aparece deshabilitada', async (base: string) => {
  const currency = TestData.currencyNamed(base);
  await administrator().attemptsTo(Ensure.that(CurrenciesInThePanel.statusOf(currency.title), equals('Disabled')));
});

Then('la moneda {string} ya no aparece', async (base: string) => {
  const currency = TestData.currencyNamed(base);
  await administrator().attemptsTo(Ensure.that(CurrenciesInThePanel.exists(currency.title), equals(false)));
});

Then('el código de la moneda {string} tiene 3 caracteres', async (base: string) => {
  const currency = TestData.currencyNamed(base);
  const code = await CurrenciesInThePanel.codeOf(currency.title).answeredBy(administrator());

  if (code.length !== 3) throw new Error(`El código "${ code }" de ${ currency.title } no tiene 3 caracteres`);
});

Then('el valor guardado de la moneda {string} es {string}', async (base: string, value: string) => {
  await administrator().attemptsTo(Ensure.that(CurrencyForm.valueOf(TestData.currencyNamed(base)), equals(value)));
});

Then('el valor de la moneda {string} es {string}', async (base: string, value: string) => {
  await administrator().attemptsTo(Ensure.that(CurrencyForm.valueOf(TestData.currencyNamed(base)), equals(value)));
});

Then('la moneda {string} guarda {int} decimales', async (base: string, decimalPlace: number) => {
  await administrator().attemptsTo(Ensure.that(CurrencyForm.decimalPlaceOf(TestData.currencyNamed(base)), equals(String(decimalPlace))));
});
