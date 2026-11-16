import { AnswersQuestions, Interaction, Question, Task, UsesAbilities } from '@serenity-js/core';

import { GeoZoneFixture, TaxClassFixture, TaxRateFixture } from '../../support/testData';
import { AdminPanel, PanelListRow, StartAdminSession } from './AdminPanel';

type Actor = UsesAbilities & AnswersQuestions;

const savedWith = async (actor: Actor, route: string, fields: Record<string, string | number | Array<string | number>>, key: string): Promise<number> => {
  const answer = await AdminPanel.call(actor, route, { fields });
  if (answer.data?.error) throw new Error(`El panel no guardó el registro: ${ JSON.stringify(answer.data) }`);
  return Number(answer.data?.[key]);
};

const saveGeoZone = (description: string, geoZone: GeoZoneFixture) =>
  Task.where(description,
    StartAdminSession.asAdministrator(),
    Interaction.where(description, async (actor: Actor) => {
      const id = await savedWith(actor, 'localisation/geo_zone.save', {
        geo_zone_id: geoZone.id ?? 0,
        name: geoZone.name,
        description: geoZone.description,
        'zone_to_geo_zone[0][country_id]': geoZone.countryId,
        'zone_to_geo_zone[0][zone_id]': geoZone.zoneId,
      }, 'geo_zone_id');

      if (id) geoZone.id = id;
    }),
  );

export const AddGeoZone = {
  of: (geoZone: GeoZoneFixture) => saveGeoZone(`#actor agrega la zona geográfica ${ geoZone.name }`, geoZone),
};

export const SaveGeoZone = {
  of: (geoZone: GeoZoneFixture) => saveGeoZone(`#actor guarda la zona geográfica ${ geoZone.name }`, geoZone),
};

export const DeleteGeoZone = {
  of: (geoZone: GeoZoneFixture) => Task.where(`#actor borra la zona geográfica ${ geoZone.name }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor borra la zona geográfica ${ geoZone.name }`, async (actor: Actor) => {
      if (!geoZone.id) throw new Error(`La zona "${ geoZone.name }" todavía no existe en el panel`);

      const answer = await AdminPanel.call(actor, 'localisation/geo_zone.delete', { fields: { 'selected[]': [geoZone.id] } });
      if (answer.data?.error) throw new Error(`El panel no borró la zona geográfica: ${ JSON.stringify(answer.data) }`);
    }),
  ),
};

export const AddTaxRate = {
  of: (taxRate: TaxRateFixture) => Task.where(`#actor agrega la tasa de impuesto ${ taxRate.name }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor agrega la tasa de impuesto ${ taxRate.name }`, async (actor: Actor) => {
      const answer = await AdminPanel.call(actor, 'localisation/tax_rate.save', {
        fields: {
          tax_rate_id: taxRate.id ?? 0,
          name: taxRate.name,
          rate: taxRate.rate,
          type: taxRate.type,
          geo_zone_id: taxRate.geoZoneId,
          'tax_rate_customer_group[]': [taxRate.customerGroupId],
        },
      });

      // En esta versión el evento de la tasa falla después de insertarla y el
      // panel responde con un error en texto plano. La fila queda en la lista:
      // se recupera su id para poder borrarla al terminar el escenario.
      const saved = answer.data as { tax_rate_id?: number; error?: unknown } | string;
      if (typeof saved === 'string' || !saved?.tax_rate_id) {
        const rows = await AdminPanel.list(actor, 'localisation/tax_rate.list');
        const row = rows.find((candidate) => candidate.cells[1]?.startsWith(`${ taxRate.name }`));
        if (row) taxRate.id = row.id;

        throw new Error(`El panel no guardó la tasa de impuesto: ${ typeof saved === 'string' ? saved : JSON.stringify(saved) }`);
      }

      taxRate.id = Number(saved.tax_rate_id);
    }),
  ),
};

export const SaveTaxClass = {
  of: (taxClass: TaxClassFixture) => Task.where(`#actor guarda la clase de impuesto ${ taxClass.title }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor guarda la clase de impuesto ${ taxClass.title }`, async (actor: Actor) => {
      const fields: Record<string, string | number> = {
        tax_class_id: taxClass.id ?? 0,
        title: taxClass.title,
        description: taxClass.description,
      };

      taxClass.rules.forEach((rule, index) => {
        fields[`tax_rule[${ index }][tax_rate_id]`] = rule.taxRateId;
        fields[`tax_rule[${ index }][based]`] = rule.based;
        fields[`tax_rule[${ index }][priority]`] = rule.priority;
      });

      const id = await savedWith(actor, 'localisation/tax_class.save', fields, 'tax_class_id');
      if (id) taxClass.id = id;
    }),
  ),
};

export const DeleteTaxClass = {
  of: (taxClass: TaxClassFixture) => Task.where(`#actor borra la clase de impuesto ${ taxClass.title }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor borra la clase de impuesto ${ taxClass.title }`, async (actor: Actor) => {
      if (!taxClass.id) throw new Error(`La clase "${ taxClass.title }" todavía no existe en el panel`);

      const answer = await AdminPanel.call(actor, 'localisation/tax_class.delete', { fields: { 'selected[]': [taxClass.id] } });
      if (answer.data?.error) throw new Error(`El panel no borró la clase de impuesto: ${ JSON.stringify(answer.data) }`);
    }),
  ),
};

const geoZoneRows = (actor: Actor): Promise<PanelListRow[]> => AdminPanel.list(actor, 'localisation/geo_zone.list');
const taxRateRows = (actor: Actor): Promise<PanelListRow[]> => AdminPanel.list(actor, 'localisation/tax_rate.list');
const taxClassRows = (actor: Actor): Promise<PanelListRow[]> => AdminPanel.list(actor, 'localisation/tax_class.list');

/** Lo que la administradora ve en las listas de localización. */
export const GeoZonesInThePanel = {
  names: () => Question.about('los nombres de las zonas geográficas', async (actor: Actor) => (await geoZoneRows(actor)).map((row) => row.cells[1] ?? '')),
  descriptionOf: (name: string) => Question.about(`la descripción de la zona ${ name }`, async (actor: Actor) =>
    (await geoZoneRows(actor)).find((row) => row.cells[1]?.startsWith(`${ name }`))?.cells[2] ?? 'No aparece'),
  exists: (name: string) => Question.about(`si la zona ${ name } aparece`, async (actor: Actor) =>
    (await geoZoneRows(actor)).some((row) => row.cells[1]?.startsWith(`${ name }`))),
};

export const TaxRatesInThePanel = {
  firstId: () => Question.about('la primera tasa de impuesto existente', async (actor: Actor) => (await taxRateRows(actor))[0]?.id ?? 0),
  first: () => Question.about('la primera tasa de impuesto existente', async (actor: Actor) => {
    const [row] = await taxRateRows(actor);
    return row ? { id: row.id, name: row.cells[1] ?? '' } : undefined;
  }),
  geoZoneOf: (name: string) => Question.about(`la zona geográfica de la tasa ${ name }`, async (actor: Actor) =>
    (await taxRateRows(actor)).find((row) => row.cells[1]?.startsWith(`${ name }`))?.cells[4] ?? 'No aparece'),
  rateOf: (name: string) => Question.about(`la tasa de ${ name }`, async (actor: Actor) =>
    (await taxRateRows(actor)).find((row) => row.cells[1]?.startsWith(`${ name }`))?.cells[2] ?? 'No aparece'),
};

export const TaxClassesInThePanel = {
  exists: (title: string) => Question.about(`si la clase de impuesto ${ title } aparece`, async (actor: Actor) =>
    (await taxClassRows(actor)).some((row) => row.cells[1]?.startsWith(`${ title }`))),
};

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const selectedOption = (html: string, name: string): { value: string; text: string } => {
  const select = html.match(new RegExp(`<select name="${ escapeRegExp(name) }"[^>]*>([\\s\\S]*?)</select>`));
  const option = select?.[1].match(/<option value="([^"]*)" selected[^>]*>([\s\S]*?)<\/option>/);

  return {
    value: option?.[1] ?? '',
    text: (option?.[2] ?? '').replace(/<[^>]+>/g, '').trim(),
  };
};

export interface TaxRuleInTheForm {
  taxRate: string;
  based: string;
  priority: string;
}

/** Las reglas que muestra el formulario de una clase de impuesto. */
export const TaxClassInThePanel = {
  rules: (taxClass: TaxClassFixture) => Question.about(`las reglas de la clase ${ taxClass.title }`, async (actor: Actor) => {
    if (!taxClass.id) return [] as TaxRuleInTheForm[];

    const answer = await AdminPanel.call(actor, 'localisation/tax_class.form', { parameters: { tax_class_id: taxClass.id } });
    const html = String(answer.data);
    const rows = [...html.matchAll(/id="tax-rule-row-(\d+)"/g)].map((match) => Number(match[1]));

    return rows.map((index): TaxRuleInTheForm => ({
      taxRate: selectedOption(html, `tax_rule[${ index }][tax_rate_id]`).text,
      based: selectedOption(html, `tax_rule[${ index }][based]`).value,
      priority: html.match(new RegExp(`name="tax_rule\\[${ index }\\]\\[priority\\]" value="([^"]*)"`))?.[1] ?? '',
    }));
  }),
};
