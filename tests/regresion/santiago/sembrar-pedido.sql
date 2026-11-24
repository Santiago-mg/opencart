-- Pedido de prueba para RF-11 (devoluciones).
-- La tienda ahora rechaza devoluciones de pedidos que no existen (DEF-11-06), y la
-- tienda de demostración no trae ningún pedido. Las pruebas usan los pedidos 1234 y 4321.
-- Es idempotente: se puede ejecutar las veces que haga falta.
-- Uso (tienda local):  mysql -uroot opencart < sembrar-pedido.sql
-- Uso (Jenkins):       docker compose -p opencart-pruebas -f docker-compose.ci.yml exec -T mysql mysql -uroot -popencart opencart < tests/regresion/santiago/sembrar-pedido.sql
INSERT IGNORE INTO `oc_order`
  (`order_id`, `store_id`, `store_name`, `store_url`, `customer_id`, `customer_group_id`, `firstname`, `lastname`,
   `email`, `telephone`, `order_status_id`, `currency_id`, `currency_code`, `currency_value`, `language_id`, `date_added`, `date_modified`)
VALUES
  (1234, 0, 'Your Store', 'http://localhost/', 0, 1, 'Pedido', 'De prueba', 'pedido.prueba@example.com', '3000000000', 5, 1, 'USD', 1.0, 1, NOW(), NOW()),
  (4321, 0, 'Your Store', 'http://localhost/', 0, 1, 'Pedido', 'De prueba', 'pedido.prueba@example.com', '3000000000', 5, 1, 'USD', 1.0, 1, NOW(), NOW());
