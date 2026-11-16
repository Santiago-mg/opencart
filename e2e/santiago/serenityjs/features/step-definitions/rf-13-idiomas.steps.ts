import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { TestData } from '../../test/support/testData';
import {
  AddLanguage,
  DeleteLanguage,
  LanguageForm,
  LanguagesInThePanel,
  PanelAnswer,
  SaveLanguage,
  SetLanguageStatus,
  SetLanguageStatusFromTheList,
  TryToAddLanguage,
  TryToDeleteTheDefaultLanguage,
} from '../../test/tasks/admin/Languages';

const administrator = () => actorCalled('Ana');

const addLanguage = async (base: string, locale: string) => {
  const language = TestData.language(base, { locale });
  await administrator().attemptsTo(AddLanguage.of(language));
};

When('la administradora agrega el idioma {string} con locale {string}', async (base: string, locale: string) => {
  await addLanguage(base, locale);
});

Given('la administradora agregó el idioma {string} con locale {string}', async (base: string, locale: string) => {
  await addLanguage(base, locale);
});

When('la administradora cambia el nombre del idioma {string} a {string}', async (base: string, newBase: string) => {
  await administrator().attemptsTo(SaveLanguage.of(TestData.renameLanguage(base, newBase)));
});

When('la administradora cambia el locale del idioma {string} a {string} y su orden a {int}', async (base: string, locale: string, sortOrder: number) => {
  const language = TestData.languageNamed(base);
  language.locale = locale;
  language.sortOrder = sortOrder;

  await administrator().attemptsTo(SaveLanguage.of(language));
});

When('la administradora deshabilita el idioma {string}', async (base: string) => {
  await administrator().attemptsTo(SetLanguageStatus.of(TestData.languageNamed(base), false));
});

When('la administradora habilita el idioma {string}', async (base: string) => {
  await administrator().attemptsTo(SetLanguageStatus.of(TestData.languageNamed(base), true));
});

When('la administradora deshabilita el idioma {string} desde la lista', async (base: string) => {
  await administrator().attemptsTo(SetLanguageStatusFromTheList.of(TestData.languageNamed(base), false));
});

When('la administradora intenta agregar el idioma {string} con locale {string} y el código repetido {string}', async (base: string, locale: string, code: string) => {
  const language = TestData.language(base, { locale, code });
  await administrator().attemptsTo(TryToAddLanguage.of(language));
});

When('la administradora intenta borrar el idioma por defecto de la tienda', async () => {
  await administrator().attemptsTo(TryToDeleteTheDefaultLanguage.now());
});

When('la administradora borra el idioma {string}', async (base: string) => {
  await administrator().attemptsTo(DeleteLanguage.of(TestData.languageNamed(base)));
});

Then('el idioma {string} aparece habilitado', async (base: string) => {
  const language = TestData.languageNamed(base);
  await administrator().attemptsTo(Ensure.that(LanguagesInThePanel.statusOf(language.name), equals('Enabled')));
});

Then('el idioma {string} aparece deshabilitado', async (base: string) => {
  const language = TestData.languageNamed(base);
  await administrator().attemptsTo(Ensure.that(LanguagesInThePanel.statusOf(language.name), equals('Disabled')));
});

Then('el idioma {string} ya no aparece', async (base: string) => {
  const language = TestData.languageNamed(base);
  await administrator().attemptsTo(Ensure.that(LanguagesInThePanel.exists(language.name), equals(false)));
});

Then('el idioma {string} aparece en la lista con orden {int}', async (base: string, sortOrder: number) => {
  const language = TestData.languageNamed(base);
  await administrator().attemptsTo(Ensure.that(LanguagesInThePanel.sortOrderOf(language.name), equals(String(sortOrder))));
});

Then('el idioma por defecto sigue en la lista', async () => {
  await administrator().attemptsTo(Ensure.that(LanguagesInThePanel.defaultExists(), equals(true)));
});

Then('el panel rechaza el cambio con el aviso {string}', async (message: string) => {
  await administrator().attemptsTo(Ensure.that(PanelAnswer.warning(), equals(message)));
});

Then('el locale guardado del idioma {string} es {string}', async (base: string, locale: string) => {
  await administrator().attemptsTo(Ensure.that(LanguageForm.localeOf(TestData.languageNamed(base)), equals(locale)));
});
