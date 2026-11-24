@rf-07
Feature: Carrito de compras (RF-07)
  Como cliente de la tienda
  Quiero agregar, cambiar y quitar productos del carrito
  Para comprar exactamente lo que necesito

  @web @smoke
  Scenario: Agregar un producto desde su ficha
    When Carlos agrega 2 unidades de "iPhone" al carrito
    Then él ve el aviso "Success: You have added iPhone to your shopping cart!"
    And él ve en el carrito 2 unidades de "iPhone"
    And él ve que el total del carrito es "$246.40"

  @web
  Scenario: Cambiar la cantidad recalcula el total
    Given Carlos tiene 1 unidad de "iPhone" en el carrito
    When él cambia la cantidad de "iPhone" a 3
    Then él ve el aviso "Success: You have modified your shopping cart!"
    And él ve que el total del carrito es "$369.60"

  @web
  Scenario: Quitar el único producto deja el carrito vacío
    Given Carlos tiene 1 unidad de "iPhone" en el carrito
    When él quita "iPhone" del carrito
    Then él ve el texto "Your shopping cart is empty!"

  @web
  Scenario: Con un producto agotado no se puede pasar a pagar
    Given Carlos tiene 1 unidad de "Samsung Galaxy Tab 10.1" en el carrito
    When él intenta pasar a pagar
    Then él vuelve a la página del carrito
    And él ve "Samsung Galaxy Tab 10.1" marcado como agotado

  @web
  Scenario: El carrito de un cliente no se mezcla con el de otro
    Given Carlos tiene 1 unidad de "iPhone" en el carrito
    When Bruno abre el carrito
    Then él ve el texto "Your shopping cart is empty!"

  @web @defecto
  Scenario: El total de una línea es el precio por la cantidad (DEF-07-03)
    Given Carlos tiene 3 unidades de "iPhone" en el carrito
    When él abre el carrito
    Then él ve que el total de la línea de "iPhone" es "$369.60"
