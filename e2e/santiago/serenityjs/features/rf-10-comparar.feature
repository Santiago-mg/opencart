@rf-10
Feature: Comparar productos (RF-10)
  Como cliente de la tienda
  Quiero poner varios productos lado a lado
  Para comparar sus precios y características

  @web @smoke
  Scenario: Comparar dos productos
    When Carlos agrega "iPhone" a la comparación
    And él agrega "iMac" a la comparación
    Then en la comparación él ve los productos "iPhone, iMac"
    And en la fila "Price" él ve "$123.20, $122.00"

  @web
  Scenario: La comparación admite como máximo cuatro productos
    Given Carlos agregó a la comparación "iPhone, iMac, MacBook, MacBook Air"
    When él agrega "MacBook Pro" a la comparación
    Then en la comparación él ve los productos "iMac, MacBook, MacBook Air, MacBook Pro"

  @web
  Scenario: Quitar un producto de la comparación
    Given Carlos agregó a la comparación "iPhone, iMac"
    When él quita "iMac" de la comparación
    Then él ve el aviso de la comparación "Success: You have modified your product comparison!"
    And en la comparación él ve los productos "iPhone"

  @web @defecto
  Scenario: La disponibilidad dice "In Stock", igual que en la ficha (DEF-10-01)
    When Carlos agrega "iPhone" a la comparación
    Then en la fila "Availability" él ve "In Stock"
