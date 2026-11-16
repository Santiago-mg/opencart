import { AnswersQuestions, Interaction, Question, Task, UsesAbilities } from '@serenity-js/core';

import { CurrencyFixture } from '../../support/testData';
import { AdminPanel, PanelListRow, StartAdminSession } from './AdminPanel';

type Actor = UsesAbilities & AnswersQuestions;

const fieldsOf = (currency: CurrencyFixture): Record<string, string | number> => ({
  currency_id: currency.id ?? 0,
  title: currency.title,
  code: currency.code,
  symbol_left: currency.symbolLeft,
  symbol_right: currency.symbolRight,
  decimal_place: currency.decimalPlace,
  value: currency.value,
  status: currency.status ? 1 : 0,
});

const saveCurrency = (description: string, currency: CurrencyFixture) =>
  Task.where(description,
    StartAdminSession.asAdministrator(),
    Interaction.where(description, async (actor: Actor) => {
      const answer = await AdminPanel.call(actor, 'localisation/currency.save', { fields: fieldsOf(currency) });

      if (answer.data?.error) throw new Error(`El panel no guardó la moneda: ${ JSON.stringify(answer.data) }`);
      if (answer.data?.currency_id) currency.id = answer.data.currency_id;
    }),
  );

/** RF-14: System > Localisation > Currencies. */
export const AddCurrency = {
  of: (currency: CurrencyFixture) => saveCurrency(`#actor agrega la moneda ${ currency.title }`, currency),
};

export const SaveCurrency = {
  of: (currency: CurrencyFixture) => saveCurrency(`#actor guarda la moneda ${ currency.title }`, currency),
};

export const SetCurrencyStatus = {
  of: (currency: CurrencyFixture, enabled: boolean) => Task.where(
    `#actor ${ enabled ? 'habilita' : 'deshabilita' } la moneda ${ currency.title }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor ${ enabled ? 'habilita' : 'deshabilita' } la moneda ${ currency.title }`, async (actor: Actor) => {
      if (!currency.id) throw new Error(`La moneda "${ currency.title }" todavía no existe en el panel`);

      const answer = await AdminPanel.call(actor, `localisation/currency.${ enabled ? 'enable' : 'disable' }`, {
        fields: { 'selected[]': [currency.id] },
      });
      if (answer.data?.error) throw new Error(`El panel no cambió el estado de la moneda: ${ JSON.stringify(answer.data) }`);

      currency.status = enabled;
    }),
  ),
};

export const DeleteCurrency = {
  of: (currency: CurrencyFixture) => Task.where(`#actor borra la moneda ${ currency.title }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor borra la moneda ${ currency.title }`, async (actor: Actor) => {
      if (!currency.id) throw new Error(`La moneda "${ currency.title }" todavía no existe en el panel`);

      const answer = await AdminPanel.call(actor, 'localisation/currency.delete', { fields: { 'selected[]': [currency.id] } });
      if (answer.data?.error) throw new Error(`El panel no borró la moneda: ${ JSON.stringify(answer.data) }`);
    }),
  ),
};

const rows = (actor: Actor): Promise<PanelListRow[]> => AdminPanel.list(actor, 'localisation/currency.list');

const currencyRow = async (actor: Actor, title: string): Promise<PanelListRow | undefined> => {
  const currencies = await rows(actor);
  return currencies.find((row) => row.cells[1] === title || row.cells[1]?.startsWith(`${ title }`));
};

/** Lo que la administradora ve en la lista de monedas. */
export const CurrenciesInThePanel = {
  titles: () => Question.about('los títulos de las monedas', async (actor: Actor) => (await rows(actor)).map((row) => row.cells[1] ?? '')),
  statusOf: (title: string) => Question.about(`el estado de la moneda ${ title }`, async (actor: Actor) => (await currencyRow(actor, title))?.cells[4] ?? 'No aparece'),
  codeOf: (title: string) => Question.about(`el código de la moneda ${ title }`, async (actor: Actor) => (await currencyRow(actor, title))?.cells[2] ?? ''),
  valueOf: (title: string) => Question.about(`el valor de la moneda ${ title }`, async (actor: Actor) => (await currencyRow(actor, title))?.cells[3] ?? ''),
  exists: (title: string) => Question.about(`si la moneda ${ title } aparece`, async (actor: Actor) => (await currencyRow(actor, title)) !== undefined),
};

/** El formulario de una moneda, para comprobar los campos que no muestra la lista. */
export const CurrencyForm = {
  valueOf: (currency: CurrencyFixture) => Question.about(`el valor guardado de ${ currency.title }`, async (actor: Actor) => {
    if (!currency.id) return '';

    const answer = await AdminPanel.call(actor, 'localisation/currency.form', { parameters: { currency_id: currency.id } });
    const value = String(answer.data).match(/name="value"[^>]*value="([^"]*)"/)?.[1] ?? '';
    return value ? Number(value).toFixed(2) : '';
  }),
  decimalPlaceOf: (currency: CurrencyFixture) => Question.about(`los decimales de ${ currency.title }`, async (actor: Actor) => {
    if (!currency.id) return '';

    const answer = await AdminPanel.call(actor, 'localisation/currency.form', { parameters: { currency_id: currency.id } });
    return String(answer.data).match(/name="decimal_place"[^>]*value="([^"]*)"/)?.[1] ?? '';
  }),
};
