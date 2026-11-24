import { AnswersQuestions, Interaction, Question, Task, TakeNotes, UsesAbilities } from '@serenity-js/core';

import { OrderFixture } from '../../support/testData';
import { AdminPanel, PanelListRow, StartAdminSession } from './AdminPanel';

type Actor = UsesAbilities & AnswersQuestions;

const FILTERED_ORDERS = 'filteredOrders';

export interface OrderFilters {
  orderId?: number;
  customer?: string;
  statusId?: number;
  total?: string;
  dateFrom?: string;
  dateTo?: string;
}

const parametersOf = (filters: OrderFilters): Record<string, string | number> => ({
  // La lista del panel ordena por order_id descendente; los escenarios esperan
  // el orden en que se crearon los pedidos. En 4.1.0.3 la columna se pide como
  // "o.order_id" (en OpenCart 5 era "order_id").
  sort: 'o.order_id',
  order: 'ASC',
  ...(filters.orderId !== undefined ? { filter_order_id: filters.orderId } : {}),
  ...(filters.customer ? { filter_customer: filters.customer } : {}),
  ...(filters.statusId !== undefined ? { filter_order_status_id: filters.statusId } : {}),
  ...(filters.total ? { filter_total: filters.total } : {}),
  ...(filters.dateFrom ? { filter_date_from: filters.dateFrom } : {}),
  ...(filters.dateTo ? { filter_date_to: filters.dateTo } : {}),
});

const filterOrders = (description: string, filters: OrderFilters) =>
  Task.where(description,
    StartAdminSession.asAdministrator(),
    Interaction.where(description, async (actor: Actor) => {
      const rows = await AdminPanel.list(actor, 'sale/order.list', parametersOf(filters));
      TakeNotes.as(actor).notepad.set(FILTERED_ORDERS, rows);
    }),
  );

/** RF-01: Sales > Orders, aplicando uno o varios filtros. */
export const FilterOrders = {
  byIdentifier: (order: OrderFixture) =>
    filterOrders(`#actor filtra los pedidos por el identificador ${ order.id }`, { orderId: order.id }),

  byCustomer: (customer: string) =>
    filterOrders(`#actor filtra los pedidos de ${ customer }`, { customer }),

  byStatus: (statusId: number, status: string) =>
    filterOrders(`#actor filtra los pedidos con estado ${ status }`, { statusId }),

  byTotal: (total: string) =>
    filterOrders(`#actor filtra los pedidos con total ${ total }`, { total }),

  betweenDates: (from: string, to: string) =>
    filterOrders(`#actor filtra los pedidos entre ${ from } y ${ to }`, { dateFrom: from, dateTo: to }),

  byCustomerAndStatus: (customer: string, statusId: number, status: string) =>
    filterOrders(`#actor filtra los pedidos de ${ customer } con estado ${ status }`, { customer, statusId }),
};

const rows = (actor: Actor): PanelListRow[] =>
  (TakeNotes.as(actor).notepad.get(FILTERED_ORDERS) as PanelListRow[] | undefined) ?? [];

/**
 * El total de la fila sin el símbolo de la moneda. En 4.1.0.3 la celda trae el
 * total ya formateado ("$350.00"); OpenCart 5 lo traía en <x-currency amount="…">.
 */
const amountIn = (row: PanelListRow): string => {
  const amount = (row.cells[5] ?? '').replace(/[^\d.-]/g, '');
  return amount ? Number(amount).toFixed(2) : '';
};

/** Lo que la administradora ve después de aplicar los filtros. */
export const OrdersInThePanel = {
  count: () => Question.about('cuántos pedidos muestra el panel', async (actor: Actor) => rows(actor).length),
  ids: () => Question.about('los identificadores de los pedidos', async (actor: Actor) => rows(actor).map((row) => String(row.id))),
  customers: () => Question.about('los clientes de los pedidos', async (actor: Actor) => rows(actor).map((row) => row.cells[3] ?? '')),
  statuses: () => Question.about('los estados de los pedidos', async (actor: Actor) => rows(actor).map((row) => row.cells[4] ?? '')),
  totals: () => Question.about('los totales de los pedidos', async (actor: Actor) => rows(actor).map(amountIn)),
  dates: () => Question.about('las fechas de los pedidos', async (actor: Actor) => rows(actor).map((row) => row.cells[6] ?? '')),
};
