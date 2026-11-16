import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, isPresent, not } from '@serenity-js/assertions';
import { Actor, actorCalled } from '@serenity-js/core';

import { Comparison, PublishedReviews, ReturnForm } from '../../test/questions/StoreQuestions';
import { ApproveReview, ReturnsInThePanel, StartAdminSession } from '../../test/tasks/admin/AdminPanel';
import { AddToComparison, RemoveFromComparison } from '../../test/tasks/Compare';
import { RequestReturn, SubmitTheReturnForm } from '../../test/tasks/Returns';
import { OpenPage } from '../../test/tasks/OpenPage';
import { OpenReviews, WriteReview } from '../../test/tasks/Reviews';
import { TestData } from '../../test/support/testData';
import { ProductPage } from '../../test/ui/ProductPage';

const A_GOOD_REVIEW = 'Llegó a tiempo, funciona muy bien y la batería dura todo el día.';

// ── RF-09: reseñas ──

const writeReview = async (actor: Actor, stars: number, product: string, text = A_GOOD_REVIEW) => {
  const author = TestData.reviewAuthor(actor.name);
  TestData.rememberReview(actor.name, { author, product, text, rating: stars });
  await actor.attemptsTo(WriteReview.as(author).about(product, stars, text));
};

When('{actor} escribe una reseña de {int} estrellas sobre {string}', async (actor: Actor, stars: number, product: string) => {
  await writeReview(actor, stars, product);
});

When('{actor} escribe una reseña de {int} estrellas sobre {string} con el texto {string}', async (actor: Actor, stars: number, product: string, text: string) => {
  await writeReview(actor, stars, product, text);
});

Given('{actor} escribió una reseña de {int} estrellas sobre {string}', async (actor: Actor, stars: number, product: string) => {
  await writeReview(actor, stars, product);
  await actor.attemptsTo(Ensure.eventually(PublishedReviews.fieldError('text'), equals('')));
});

Given('la administradora aprobó la reseña de {word}', async (name: string) => {
  await actorCalled('Ana').attemptsTo(ApproveReview.of(TestData.reviewWrittenBy(name)));
});

When('{actor} abre las reseñas de {string}', async (actor: Actor, product: string) => {
  await actor.attemptsTo(OpenReviews.of(product));
});

Then('{pronoun} no ve la reseña de {word}', async (actor: Actor, name: string) => {
  const { author } = TestData.reviewWrittenBy(name);
  await actor.attemptsTo(Ensure.eventually(ProductPage.starsOfReviewBy(author).first(), not(isPresent())));
});

Then('{pronoun} ve la reseña de {word} con {int} estrellas', async (actor: Actor, name: string, stars: number) => {
  const { author } = TestData.reviewWrittenBy(name);
  await actor.attemptsTo(Ensure.eventually(PublishedReviews.starsOf(author), equals(stars)));
});

Then('{pronoun} ve en el formulario el error {string}', async (actor: Actor, message: string) => {
  await actor.attemptsTo(Ensure.eventually(PublishedReviews.fieldError('text'), equals(message)));
});

// ── RF-10: comparar ──

When('{actor} agrega {string} a la comparación', async (actor: Actor, product: string) => {
  await actor.attemptsTo(AddToComparison.product(product));
});

When('{pronoun} agrega {string} a la comparación', async (actor: Actor, product: string) => {
  await actor.attemptsTo(AddToComparison.product(product));
});

Given('{actor} agregó a la comparación {list}', async (actor: Actor, products: string[]) => {
  await actor.attemptsTo(...products.map((product) => AddToComparison.product(product)));
});

When('{pronoun} quita {string} de la comparación', async (actor: Actor, product: string) => {
  await actor.attemptsTo(RemoveFromComparison.product(product));
});

Then('en la comparación {pronoun} ve los productos {list}', async (actor: Actor, products: string[]) => {
  await actor.attemptsTo(OpenPage.comparison(), Ensure.eventually(Comparison.products(), equals(products)));
});

Then('en la fila {string} {pronoun} ve {list}', async (row: string, actor: Actor, values: string[]) => {
  await actor.attemptsTo(OpenPage.comparison(), Ensure.eventually(Comparison.row(row), equals(values)));
});

Then('{pronoun} ve el aviso de la comparación {string}', async (actor: Actor, message: string) => {
  await actor.attemptsTo(Ensure.eventually(Comparison.successMessage(), equals(message)));
});

// ── RF-11: devoluciones ──

When('{actor} solicita la devolución de {string} del pedido {string}', async (actor: Actor, product: string, orderId: string) => {
  await actor.attemptsTo(RequestReturn.of(TestData.returnRequest(actor.name, product, orderId)));
});

When('{actor} envía el formulario de devoluciones vacío', async (actor: Actor) => {
  await actor.attemptsTo(SubmitTheReturnForm.empty());
});

Then('{pronoun} ve en el campo {string} el error {string}', async (actor: Actor, field: string, message: string) => {
  await actor.attemptsTo(Ensure.eventually(ReturnForm.error(field), equals(message)));
});

Then('{pronoun} ve en el campo {string} un error', async (actor: Actor, field: string) => {
  await actor.attemptsTo(Ensure.eventually(ReturnForm.error(field), not(equals(''))));
});

Then('la administradora ve la devolución de {word} con estado {string}', async (name: string, status: string) => {
  const request = TestData.returnRequest(name);
  await actorCalled('Ana').attemptsTo(
    StartAdminSession.asAdministrator(),
    Ensure.that(ReturnsInThePanel.statusesOf(`${ request.firstName } ${ request.lastName }`), equals([status])),
  );
});
