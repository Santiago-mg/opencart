import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Cast, configure, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { Browser, chromium } from 'playwright';

import { Database } from '../../test/support/database';
import { environment } from '../../test/support/environment';

let browser: Browser;

setDefaultTimeout(60_000);

function resolveChromiumPath(): string | undefined {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) {
    return process.env.CHROMIUM_PATH;
  }
  const installedPaths = [
    join(homedir(), '.cache/ms-playwright/chromium-1248/chrome-linux64/chrome'),
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ];
  return installedPaths.find((path) => existsSync(path));
}

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    // Opcional: usar un Chromium ya instalado en vez del de Playwright.
    executablePath: resolveChromiumPath(),
  });

  // Cada actor tiene su propio navegador (su propia sesión: su carrito, su
  // comparación), puede llamar al panel por HTTP y tomar notas (la sesión del panel).
  configure({
    actors: Cast.where((actor) => actor.whoCan(
      BrowseTheWebWithPlaywright.using(browser),
      // Crear un idioma copia las descripciones de todas las entidades y tarda
      // más que el tiempo límite de 10 s que trae Serenity/JS por defecto.
      CallAnApi.using({ baseURL: `${ environment.storeUrl }/`, timeout: 30_000 }),
      TakeNotes.usingAnEmptyNotepad(),
    )),
    crew: [
      '@serenity-js/console-reporter',
      ['@serenity-js/html-reporter', { specDirectory: './features' }],
      // Si un paso falla, el reporte guarda una captura del navegador.
      Photographer.whoWill(TakePhotosOfFailures),
    ],
  });
});

AfterAll(async () => {
  await browser?.close();
  await Database.close();
});
