/**
 * Las pruebas que hoy fallan porque encontraron un defecto de OpenCart van
 * dentro de `describeDefects(...)`. Se corren siempre con `npm test` (deben
 * fallar hasta que se corrija el defecto: fase roja de TDD) y se saltan con
 * `npm run test:sin-defectos`, que deja solo lo que debe pasar hoy.
 */
export const describeDefects = (title: string, cases: () => void): void => {
  if (Cypress.env('sinDefectos')) describe.skip(title, cases)
  else describe(title, cases)
}
