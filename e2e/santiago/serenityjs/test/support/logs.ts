import { appendFile, chmod, mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

import { environment } from './environment';

/**
 * El archivo de registro que usan los escenarios de RF-16.
 *
 * El visor del panel (System > Maintenance > Error Logs) lista todos los
 * archivos `.log` de la carpeta de registros, así que las pruebas crean un
 * archivo propio en vez de escribir en `error.log`. De ese modo no mezclan sus
 * entradas con los errores reales de la tienda ni con las tareas que OpenCart
 * ejecuta en segundo plano mientras se corre la prueba.
 *
 * Las entradas se escriben con el mismo formato que usa
 * `Opencart\System\Library\Log::write()`.
 */

/** El nombre del archivo tal como aparece en las pestañas del visor. */
export const TEST_LOG = basename(environment.logFile);

const timestamp = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

export const Logs = {
  /** Crea el archivo vacío al empezar el escenario. */
  async create(): Promise<void> {
    await mkdir(dirname(environment.logFile), { recursive: true });
    await writeFile(environment.logFile, '', 'utf8');
    // El visor abre los registros con fopen(..., 'r+'), así que el archivo debe
    // poder escribirlo el usuario del servidor web (www-data en el contenedor).
    await chmod(environment.logFile, 0o666);
  },

  async append(message: string): Promise<void> {
    await mkdir(dirname(environment.logFile), { recursive: true });
    await appendFile(environment.logFile, `${ timestamp() } - ${ message }\n`, 'utf8');
  },

  /** Borra el archivo al terminar el escenario. */
  async remove(): Promise<void> {
    await rm(environment.logFile, { force: true });
  },
};
