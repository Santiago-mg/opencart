import { AnswersQuestions, Interaction, Question, TakeNotes, Task, UsesAbilities } from '@serenity-js/core';

import { LanguageFixture } from '../../support/testData';
import { AdminPanel, PanelListRow, StartAdminSession } from './AdminPanel';

type Actor = UsesAbilities & AnswersQuestions;

/** La respuesta que dejó anotada el último intento contra el panel. */
const PANEL_ANSWER = 'languagePanelAnswer';

const fieldsOf = (language: LanguageFixture): Record<string, string | number> => ({
  language_id: language.id ?? 0,
  name: language.name,
  code: language.code,
  locale: language.locale,
  extension: '',
  sort_order: language.sortOrder,
  status: language.status ? 1 : 0,
});

/** El texto del aviso con el que el panel rechazó un cambio. */
const errorText = (answer: unknown): string => {
  if (!answer || typeof answer !== 'object' || !('error' in answer)) return '';

  const error = (answer as { error: unknown }).error;
  if (typeof error === 'string') return error;

  return Object.values(error as Record<string, string>).join(' ');
};

const saveLanguage = (description: string, language: LanguageFixture) =>
  Task.where(description,
    StartAdminSession.asAdministrator(),
    Interaction.where(description, async (actor: Actor) => {
      const answer = await AdminPanel.call(actor, 'localisation/language.save', { fields: fieldsOf(language) });

      if (answer.data?.error) throw new Error(`El panel no guardó el idioma: ${ JSON.stringify(answer.data) }`);
      if (answer.data?.language_id) language.id = answer.data.language_id;
    }),
  );

/** RF-02: System > Localisation > Languages. */
export const AddLanguage = {
  of: (language: LanguageFixture) => saveLanguage(`#actor agrega el idioma ${ language.name }`, language),
};

export const SaveLanguage = {
  of: (language: LanguageFixture) => saveLanguage(`#actor guarda el idioma ${ language.name }`, language),
};

export const SetLanguageStatus = {
  of: (language: LanguageFixture, enabled: boolean) => {
    language.status = enabled;
    return saveLanguage(`#actor ${ enabled ? 'habilita' : 'deshabilita' } el idioma ${ language.name }`, language);
  },
};

/** Intenta agregar un idioma y anota la respuesta, sea éxito o rechazo. */
export const TryToAddLanguage = {
  of: (language: LanguageFixture) => Task.where(`#actor intenta agregar el idioma ${ language.name }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor intenta agregar el idioma ${ language.name }`, async (actor: Actor) => {
      const answer = await AdminPanel.call(actor, 'localisation/language.save', { fields: fieldsOf(language) });

      if (answer.data?.language_id) language.id = answer.data.language_id;
      TakeNotes.as(actor).notepad.set(PANEL_ANSWER, answer.data);
    }),
  ),
};

/**
 * Intenta borrar el idioma por defecto de la tienda y anota la respuesta.
 *
 * En 4.1.0.3 la lista no marca ningún idioma como "(Default)" (ver DEF-02-02),
 * así que el idioma por defecto se toma de System > Settings, campo Language
 * (config_language_catalog), y se busca su fila por el código.
 */
export const TryToDeleteTheDefaultLanguage = {
  now: () => Task.where('#actor intenta borrar el idioma por defecto de la tienda',
    StartAdminSession.asAdministrator(),
    Interaction.where('#actor intenta borrar el idioma por defecto de la tienda', async (actor: Actor) => {
      const settings = String((await AdminPanel.call(actor, 'setting/setting')).data);
      const code = selectedOption(settings, 'config_language_catalog');
      const row = (await rows(actor)).find((candidate) => candidate.cells[2] === code);
      if (!row) throw new Error(`La lista de idiomas no tiene el idioma por defecto de la tienda ("${ code }")`);

      const answer = await AdminPanel.call(actor, 'localisation/language.delete', { fields: { 'selected[]': [row.id] } });
      TakeNotes.as(actor).notepad.set(PANEL_ANSWER, answer.data);
    }),
  ),
};

export const DeleteLanguage = {
  of: (language: LanguageFixture) => Task.where(`#actor borra el idioma ${ language.name }`,
    StartAdminSession.asAdministrator(),
    Interaction.where(`#actor borra el idioma ${ language.name }`, async (actor: Actor) => {
      if (!language.id) throw new Error(`El idioma "${ language.name }" todavía no existe en el panel`);

      const answer = await AdminPanel.call(actor, 'localisation/language.delete', { fields: { 'selected[]': [language.id] } });
      if (answer.data?.error) throw new Error(`El panel no borró el idioma: ${ JSON.stringify(answer.data) }`);
    }),
  ),
};

const rows = (actor: Actor): Promise<PanelListRow[]> => AdminPanel.list(actor, 'localisation/language.list');

/** El valor de la opción elegida en un <select> del panel. */
const selectedOption = (html: string, name: string): string => {
  const select = html.match(new RegExp(`<select name="${ name }"[^>]*>([\\s\\S]*?)</select>`))?.[1] ?? '';
  return select.match(/<option value="([^"]*)" selected/)?.[1] ?? '';
};

const languageRow = async (actor: Actor, name: string): Promise<PanelListRow | undefined> => {
  const languages = await rows(actor);
  return languages.find((row) => row.cells[1] === name || row.cells[1]?.startsWith(`${ name }`));
};

/** La fila del idioma por defecto: la lista la marca como "Nombre (Default)". */
const defaultLanguageRow = async (actor: Actor): Promise<PanelListRow | undefined> => {
  const languages = await rows(actor);
  return languages.find((row) => /\(Default\)/.test(row.cells[1] ?? ''));
};

/**
 * Lo que la administradora ve en la lista de idiomas. En 4.1.0.3 las columnas
 * son: casilla | nombre | código | orden | editar. No hay columna de estado: un
 * idioma deshabilitado se ve con la fila atenuada.
 */
export const LanguagesInThePanel = {
  names: () => Question.about('los nombres de los idiomas', async (actor: Actor) => (await rows(actor)).map((row) => row.cells[1] ?? '')),
  codes: () => Question.about('los códigos de los idiomas', async (actor: Actor) => (await rows(actor)).map((row) => row.cells[2] ?? '')),
  statusOf: (name: string) => Question.about(`el estado del idioma ${ name }`, async (actor: Actor) => {
    const row = await languageRow(actor, name);
    return row ? AdminPanel.status(row) : 'No aparece';
  }),
  codeOf: (name: string) => Question.about(`el código del idioma ${ name }`, async (actor: Actor) => (await languageRow(actor, name))?.cells[2] ?? ''),
  sortOrderOf: (name: string) => Question.about(`el orden del idioma ${ name }`, async (actor: Actor) => (await languageRow(actor, name))?.cells[3] ?? 'No aparece'),
  exists: (name: string) => Question.about(`si el idioma ${ name } aparece`, async (actor: Actor) => (await languageRow(actor, name)) !== undefined),
  defaultExists: () => Question.about('si la lista sigue mostrando un idioma marcado como "(Default)"', async (actor: Actor) => (await defaultLanguageRow(actor)) !== undefined),
};

/** El aviso con el que el panel respondió al último intento anotado. */
export const PanelAnswer = {
  warning: () => Question.about('el aviso con el que el panel rechazó el cambio', async (actor: Actor) =>
    errorText(TakeNotes.as(actor).notepad.get(PANEL_ANSWER))),
};

/** El formulario de un idioma, para comprobar los campos que no muestra la lista. */
export const LanguageForm = {
  localeOf: (language: LanguageFixture) => Question.about(`el locale guardado para ${ language.name }`, async (actor: Actor) => {
    if (!language.id) return '';

    const answer = await AdminPanel.call(actor, 'localisation/language.form', { parameters: { language_id: language.id } });
    return String(answer.data).match(/name="locale"[^>]*value="([^"]*)"/)?.[1] ?? '';
  }),
};
