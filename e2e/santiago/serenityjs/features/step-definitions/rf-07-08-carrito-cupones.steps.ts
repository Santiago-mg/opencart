import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { Actor, actorCalled } from '@serenity-js/core';

import { Cart, Messages } from '../../test/questions/StoreQuestions';
import { CartPage } from '../../test/ui/CartPage';
import { PublishCoupon } from '../../test/tasks/admin/AdminPanel';
import { AddToCart, ApplyCoupon, ChangeQuantity, RemoveCoupon, RemoveFromCart } from '../../test/tasks/ManageCart';
import { OpenPage, TryToOpen } from '../../test/tasks/OpenPage';
import { TestData, YESTERDAY } from '../../test/support/testData';

// ── RF-07: carrito ──

Given('{actor} tiene {int} unidad(es) de {string} en el carrito', async (actor: Actor, quantity: number, product: string) => {
  await actor.attemptsTo(AddToCart.units(quantity, product));
});

When('{actor} agrega {int} unidades de {string} al carrito', async (actor: Actor, quantity: number, product: string) => {
  await actor.attemptsTo(AddToCart.units(quantity, product));
});

When('{pronoun} cambia la cantidad de {string} a {int}', async (actor: Actor, product: string, quantity: number) => {
  await actor.attemptsTo(ChangeQuantity.of(product).to(quantity));
});

When('{pronoun} quita {string} del carrito', async (actor: Actor, product: string) => {
  await actor.attemptsTo(RemoveFromCart.product(product));
});

When('{pronoun} intenta pasar a pagar', async (actor: Actor) => {
  await actor.attemptsTo(TryToOpen.checkout());
});

Then('{pronoun} ve en el carrito {int} unidades de {string}', async (actor: Actor, quantity: number, product: string) => {
  await actor.attemptsTo(OpenPage.cart(), Ensure.eventually(Cart.quantityOf(product), equals(String(quantity))));
});

Then('{pronoun} ve que el total del carrito es {string}', async (actor: Actor, total: string) => {
  await actor.attemptsTo(Ensure.eventually(Cart.total('Total'), equals(total)));
});

Then('{pronoun} ve que el total de la línea de {string} es {string}', async (actor: Actor, product: string, total: string) => {
  await actor.attemptsTo(Ensure.eventually(Cart.lineTotalOf(product), equals(total)));
});

Then('{pronoun} vuelve a la página del carrito', async (actor: Actor) => {
  await actor.attemptsTo(Ensure.eventually(Messages.currentAddress(), includes('route=checkout/cart')));
});

Then('{pronoun} ve {string} marcado como agotado', async (actor: Actor, product: string) => {
  await actor.attemptsTo(Ensure.eventually(Cart.outOfStockMarkOf(product), isPresent()));
});

// ── RF-08: cupones ──

// La administradora prepara el cupón desde el panel (más rápido que llenar el formulario).
Given('la administradora publicó un cupón del {int} % vigente', async (discount: number) => {
  await actorCalled('Ana').attemptsTo(PublishCoupon.called(TestData.coupon({ type: 'P', discount })));
});

Given('la administradora publicó un cupón de ${int} vigente', async (discount: number) => {
  await actorCalled('Ana').attemptsTo(PublishCoupon.called(TestData.coupon({ type: 'F', discount })));
});

Given('la administradora publicó un cupón vencido', async () => {
  await actorCalled('Ana').attemptsTo(PublishCoupon.called(TestData.coupon({ dateStart: '2020-01-01', dateEnd: YESTERDAY })));
});

Given('la administradora publicó un cupón con compra mínima de ${int}', async (minimum: number) => {
  await actorCalled('Ana').attemptsTo(PublishCoupon.called(TestData.coupon({ total: minimum })));
});

When('{actor} aplica el cupón en el carrito', async (actor: Actor) => {
  await actor.attemptsTo(ApplyCoupon.withCode(TestData.currentCoupon().code));
});

Given('{actor} aplicó el cupón en el carrito', async (actor: Actor) => {
  await actor.attemptsTo(ApplyCoupon.withCode(TestData.currentCoupon().code));
});

When('{pronoun} quita el cupón', async (actor: Actor) => {
  await actor.attemptsTo(RemoveCoupon.fromTheCart());
});

Then('{pronoun} ve que el cupón descuenta {string}', async (actor: Actor, discount: string) => {
  await actor.attemptsTo(Ensure.eventually(Cart.couponDiscount(), equals(discount)));
});

Then('{pronoun} ya no ve el descuento del cupón', async (actor: Actor) => {
  await actor.attemptsTo(Ensure.eventually(CartPage.couponTotal(), not(isPresent())));
});
