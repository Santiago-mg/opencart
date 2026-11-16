import { existsSync } from 'node:fs';
import { appendFile, chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

import { environment } from './environment';

/**
 * El registro de errores que usan los escenarios de RF-05.
 *
 * Es el mismo archivo que escribe la tienda (`config_error_filename`, por
 * defecto `error.log`) y que muestra System > Maintenance > Error Logs. Para no
 * perder los errores reales de la tienda:
 *
 * - al empezar el escenario se guarda una copia del registro y se deja vacío;
 * - al terminar se devuelve el contenido original, sin las entradas que
 *   escribió la prueba y conservando lo que la tienda haya registrado mientras
 *   tanto.
 *
 * Las entradas se escriben con el mismo formato que usa
 * `Opencart\System\Library\Log::write()`: `AAAA-MM-DD hh:mm:ss - mensaje`.
 */

/** El nombre del archivo tal como aparece en las pestañas del visor. */
export const ERROR_LOG = basename(environment.logFile);

/** La copia del registro original mientras corre el escenario (no termina en .log, así el visor no la muestra). */
const backupFile = `${ environment.logFile }.respaldo-e2e`;

/** Las líneas que escribió el escenario, para quitarlas al terminar. */
const linesWritten: string[] = [];

const timestamp = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

const contentOf = async (file: string): Promise<string> => (existsSync(file) ? readFile(file, 'utf8') : '');

export const Logs = {
  /** Guarda una copia del registro y lo deja vacío al empezar el escenario. */
  async create(): Promise<void> {
    await mkdir(dirname(environment.logFile), { recursive: true });

    // Si una corrida anterior se cortó, su copia todavía tiene el registro original.
    if (existsSync(backupFile)) await this.restore();

    linesWritten.length = 0;
    const existed = existsSync(environment.logFile);
    await writeFile(backupFile, await contentOf(environment.logFile), 'utf8');
    await writeFile(environment.logFile, '', 'utf8');

    // El visor abre los registros con fopen(..., 'r+'), así que si la prueba
    // crea el archivo, también debe poder escribirlo el usuario del servidor web.
    if (!existed) await chmod(environment.logFile, 0o666).catch(() => undefined);
  },

  async append(message: string): Promise<void> {
    const line = `${ timestamp() } - ${ message }`;
    linesWritten.push(line);
    await appendFile(environment.logFile, `${ line }\n`, 'utf8');
  },

  /** Devuelve el registro original al terminar el escenario (si este escenario lo había guardado). */
  async restore(): Promise<void> {
    if (!existsSync(backupFile)) return;

    const original = await readFile(backupFile, 'utf8');
    const newEntries = (await contentOf(environment.logFile))
      .split('\n')
      .filter((line) => line !== '' && !linesWritten.includes(line));

    const separator = original !== '' && !original.endsWith('\n') && newEntries.length > 0 ? '\n' : '';
    await writeFile(environment.logFile, original + separator + newEntries.map((line) => `${ line }\n`).join(''), 'utf8');
    await rm(backupFile, { force: true });
    linesWritten.length = 0;
  },
};
