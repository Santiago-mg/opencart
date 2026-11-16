@rf-12
Feature: Filtrado de pedidos en el panel (RF-12)
  Como administradora de la tienda
  Quiero filtrar los pedidos por identificador, cliente, estado, total y fechas
  Para encontrar rápido los pedidos que necesito revisar

  Background:
    Given la tienda tiene estos pedidos:
      | cliente       | estado     | total  | fecha      |
      | Lucía Pedidos | Processing | 150.00 | 2026-01-10 |
      | Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |
      | Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |

  @smoke
  Scenario: Filtrar un pedido por su identificador
    When la administradora filtra los pedidos por el identificador del pedido de "Mateo Pedidos"
    Then ella ve un solo pedido
    And el cliente del pedido es "Mateo Pedidos"
    And el estado del pedido es "Shipped"

  Scenario: Filtrar los pedidos por el nombre del cliente
    When la administradora filtra los pedidos por el cliente "Lucía Pedidos"
    Then ella ve 2 pedidos
    And los clientes de los pedidos son "Lucía Pedidos, Lucía Pedidos"
    And los totales de los pedidos son "150.00, 350.00"

  Scenario: Filtrar los pedidos por su estado
    When la administradora filtra los pedidos por el estado "Shipped"
    Then ella ve un solo pedido
    And los estados de los pedidos son "Shipped"
    And los clientes de los pedidos son "Mateo Pedidos"

  Scenario: Filtrar los pedidos por su total exacto
    When la administradora filtra los pedidos por el total "350.00"
    Then ella ve un solo pedido
    And los totales de los pedidos son "350.00"
    And el cliente del pedido es "Lucía Pedidos"

  Scenario: Filtrar los pedidos por un rango de fechas
    When la administradora filtra los pedidos entre "2026-02-01" y "2026-02-28"
    Then ella ve un solo pedido
    And las fechas de los pedidos son "15/02/2026"

  Scenario: Combinar el filtro de cliente con el de estado
    When la administradora filtra los pedidos por el cliente "Lucía Pedidos" y el estado "Complete"
    Then ella ve un solo pedido
    And los totales de los pedidos son "350.00"
    And los estados de los pedidos son "Complete"

  Scenario: Un filtro sin coincidencias no devuelve pedidos
    When la administradora filtra los pedidos por el cliente "Nadie Pedidos"
    Then ella no ve ningún pedido
