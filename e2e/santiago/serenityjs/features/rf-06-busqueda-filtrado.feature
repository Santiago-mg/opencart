@rf-06
Feature: Búsqueda y filtrado de productos (RF-06)
  Como cliente de la tienda
  Quiero buscar productos y filtrarlos por categoría
  Para encontrar rápido lo que quiero comprar

  @web @smoke
  Scenario: Buscar productos por su nombre
    When Carlos busca "mac"
    Then él ve los productos "iMac, MacBook, MacBook Air, MacBook Pro"

  @web
  Scenario: Buscar también en la descripción de los productos
    When Carlos busca "intel" también en las descripciones
    Then él ve los productos "iMac, MacBook, MacBook Pro, Sony VAIO"

  @web
  Scenario Outline: Filtrar por categoría <alcance>
    When Carlos busca "mac" en la categoría "Desktops" <alcance>
    Then él ve los productos "<productos>"

    Examples:
      | alcance                   | productos                   |
      | sin subcategorías         | MacBook, MacBook Air        |
      | incluyendo subcategorías  | iMac, MacBook, MacBook Air  |

  @web
  Scenario: Ordenar los resultados por precio, de mayor a menor
    When Carlos busca "mac"
    And él ordena los resultados por "Price (High > Low)"
    Then él ve los productos en este orden: "MacBook Pro, MacBook Air, MacBook, iMac"

  @web
  Scenario: Una búsqueda sin coincidencias avisa que no hay productos
    When Carlos busca "zzzzqqq"
    Then él ve el texto "There is no product that matches the search criteria."

  @web @defecto
  Scenario: Buscar el símbolo "%" no devuelve el catálogo completo (DEF-06-03)
    When Carlos busca "%"
    Then él ve el texto "There is no product that matches the search criteria."
