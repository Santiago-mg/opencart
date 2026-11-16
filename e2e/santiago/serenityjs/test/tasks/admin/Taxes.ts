import { AnswersQuestions, Interaction, Question, Task, UsesAbilities } from '@serenity-js/core';

import { GeoZoneFixture, TaxClassFixture } from '../../support/testData';
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

/** RF-04: System > Localisation > Geo Zones y Tax Classes. */
export const AddGeoZone = {
  of: (geoZone: GeoZoneFixture) => saveGeoZone(`#actor agrega la zona geográfica ${ geoZone.name }`, geoZone),
};

export const SaveGeoZone = {
  of: (geoZone: GeoZoneFixture) => saveGeoZone(`#actor guarda la zona geográfica ${ geoZone.name }`, geoZone),
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
  first: () => Question.about('la primera tasa de impuesto existente', async (actor: Actor) => {
    const [row] = await taxRateRows(actor);
    return row ? { id: row.id, name: row.cells[1] ?? '' } : undefined;
  }),
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
