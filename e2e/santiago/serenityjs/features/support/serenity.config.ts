import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Cast, configure, TakeNotes } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Photographer, TakePhotosOfFailures } from '@serenity-js/web';
import { Browser, chromium } from 'playwright';

import { environment } from '../../test/support/environment';

let browser: Browser;

setDefaultTimeout(60_000);

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    // Opcional: usar un Chromium ya instalado en vez del de Playwright.
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });

  // Cada actor tiene su propio navegador (su propia sesión: su carrito, su
  // comparación), puede llamar al panel por HTTP y tomar notas (la sesión del panel).
  configure({
    actors: Cast.where((actor) => actor.whoCan(
      BrowseTheWebWithPlaywright.using(browser),
      CallAnApi.at(`${ environment.storeUrl }/`),
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
});
