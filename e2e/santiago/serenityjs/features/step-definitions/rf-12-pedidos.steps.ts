import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { ORDER_STATUSES, TestData } from '../../test/support/testData';
import { Database } from '../../test/support/database';
import { FilterOrders, OrdersInThePanel } from '../../test/tasks/admin/Orders';

const administrator = () => actorCalled('Ana');

Given('la tienda tiene estos pedidos:', async (table: DataTable) => {
  // Si una corrida anterior se cortó, sus pedidos de prueba siguen en la base.
  await Database.removeLeftoverOrders();

  for (const row of table.hashes()) {
    const order = TestData.order({
      customer: row.cliente,
      status: row.estado,
      total: row.total,
      date: row.fecha,
    });
    order.id = await Database.addOrder(order);
  }
});

When('la administradora filtra los pedidos por el identificador del pedido de {string}', async (customer: string) => {
  await administrator().attemptsTo(FilterOrders.byIdentifier(TestData.orderOfCustomer(customer)));
});

When('la administradora filtra los pedidos por el cliente {string}', async (customer: string) => {
  await administrator().attemptsTo(FilterOrders.byCustomer(TestData.orderCustomer(customer)));
});

When('la administradora filtra los pedidos por el estado {string}', async (status: string) => {
  const statusId = ORDER_STATUSES[status];
  if (!statusId) throw new Error(`El estado de pedido "${ status }" no está en la lista de estados de prueba`);

  await administrator().attemptsTo(FilterOrders.byStatus(statusId, status));
});

When('la administradora filtra los pedidos por el total {string}', async (total: string) => {
  await administrator().attemptsTo(FilterOrders.byTotal(total));
});

When('la administradora filtra los pedidos entre {string} y {string}', async (from: string, to: string) => {
  await administrator().attemptsTo(FilterOrders.betweenDates(from, to));
});

When('la administradora filtra los pedidos por el cliente {string} y el estado {string}', async (customer: string, status: string) => {
  const statusId = ORDER_STATUSES[status];
  if (!statusId) throw new Error(`El estado de pedido "${ status }" no está en la lista de estados de prueba`);

  await administrator().attemptsTo(FilterOrders.byCustomerAndStatus(TestData.orderCustomer(customer), statusId, status));
});

Then('ella ve un solo pedido', async () => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.count(), equals(1)));
});

Then('ella ve {int} pedidos', async (count: number) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.count(), equals(count)));
});

Then('ella no ve ningún pedido', async () => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.count(), equals(0)));
});

Then('el cliente del pedido es {string}', async (customer: string) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.customers(), equals([TestData.orderCustomer(customer)])));
});

Then('el estado del pedido es {string}', async (status: string) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.statuses(), equals([status])));
});

Then('los clientes de los pedidos son {list}', async (customers: string[]) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.customers(), equals(customers.map((customer) => TestData.orderCustomer(customer)))));
});

Then('los estados de los pedidos son {list}', async (statuses: string[]) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.statuses(), equals(statuses)));
});

Then('los totales de los pedidos son {list}', async (totals: string[]) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.totals(), equals(totals)));
});

Then('las fechas de los pedidos son {list}', async (dates: string[]) => {
  await administrator().attemptsTo(Ensure.that(OrdersInThePanel.dates(), equals(dates)));
});
