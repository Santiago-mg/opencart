import { AnswersQuestions, Interaction, Question, Task, TakeNotes, UsesAbilities } from '@serenity-js/core';

import { ERROR_LOG } from '../../support/logs';
import { AdminPanel, StartAdminSession } from './AdminPanel';

type Actor = UsesAbilities & AnswersQuestions;

const LOG_CONTENT = 'logFileContent';

const unescape = (html: string): string =>
  html.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

const contentOf = (html: string, filename: string): string => {
  const names = [...html.matchAll(/<a href="#tab-log-\d+"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, '').trim());
  const contents = AdminPanel.textareas(html);
  const index = names.indexOf(filename);

  return unescape(contents[index >= 0 ? index : 0] ?? '');
};

const readTheLog = (description: string) =>
  Interaction.where(description, async (actor: Actor) => {
    const answer = await AdminPanel.call(actor, 'tool/log');
    TakeNotes.as(actor).notepad.set(LOG_CONTENT, contentOf(String(answer.data), ERROR_LOG));
  });

/** RF-05: System > Maintenance > Error Logs. */
export const OpenErrorLog = {
  now: () => Task.where('#actor abre el registro de errores', StartAdminSession.asAdministrator(), readTheLog('#actor lee el registro de errores')),
};

export const ClearErrorLog = {
  now: () => Task.where('#actor vacía el registro de errores',
    StartAdminSession.asAdministrator(),
    Interaction.where('#actor vacía el registro de errores', async (actor: Actor) => {
      const answer = await AdminPanel.call(actor, 'tool/log.clear', { parameters: { filename: ERROR_LOG } });
      if (answer.data?.error) throw new Error(`El panel no vació el registro: ${ JSON.stringify(answer.data) }`);
    }),
    readTheLog('#actor vuelve a leer el registro de errores'),
  ),
};

const content = (actor: Actor): string =>
  (TakeNotes.as(actor).notepad.get(LOG_CONTENT) as string | undefined) ?? '';

const timestampedLine = (message: string): RegExp =>
  new RegExp(`^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} - .*${ message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }`, 'm');

/** Lo que la administradora ve en el visor de errores. */
export const ErrorLogInThePanel = {
  content: () => Question.about('el contenido del registro de errores', async (actor: Actor) => content(actor)),
  has: (message: string) => Question.about(`si el registro contiene "${ message }"`, async (actor: Actor) =>
    content(actor).includes(message)),
  entryHasTimestamp: (message: string) => Question.about(`si "${ message }" tiene fecha y hora`, async (actor: Actor) =>
    timestampedLine(message).test(content(actor))),
  comesBefore: (first: string, second: string) => Question.about(`si "${ first }" aparece antes que "${ second }"`, async (actor: Actor) => {
    const firstIndex = content(actor).indexOf(first);
    const secondIndex = content(actor).indexOf(second);

    return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
  }),
  isEmpty: () => Question.about('si el registro está vacío', async (actor: Actor) => content(actor).trim() === ''),
};
