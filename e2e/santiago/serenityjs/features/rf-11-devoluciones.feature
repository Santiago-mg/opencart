@rf-11
Feature: Devoluciones (RF-11)
  Como cliente de la tienda
  Quiero solicitar la devolución de un producto
  Para que la tienda me lo cambie o me devuelva el dinero

  @web @smoke
  Scenario: Solicitar la devolución de un producto
    When Carlos solicita la devolución de "iPhone" del pedido "1234"
    Then él ve el texto "Thank you for submitting your return request. Your request has been sent to the relevant department for processing."
    And la administradora ve la devolución de Carlos con estado "Awaiting Products"

  @web
  Scenario: El formulario vacío avisa de los campos obligatorios
    When Carlos envía el formulario de devoluciones vacío
    Then él ve en el campo "order-id" el error "Order ID required!"
    And él ve en el campo "reason" el error "You must select a return product reason!"

  @web @defecto
  Scenario: Un número de pedido negativo no se acepta (DEF-11-01)
    When Carlos solicita la devolución de "iPhone" del pedido "-5"
    Then él ve en el campo "order-id" un error
