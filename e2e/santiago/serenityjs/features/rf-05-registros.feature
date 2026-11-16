@rf-05
Feature: Registro de errores de la tienda (RF-05)
  Como administradora de la tienda
  Quiero ver y vaciar el registro de errores
  Para diagnosticar los problemas que ocurren en la tienda

  @smoke
  Scenario: El visor muestra las entradas con fecha y hora
    Given el registro contiene la entrada "QA: fallo de prueba"
    When la administradora abre el registro de errores
    Then ella ve la entrada "QA: fallo de prueba"
    And la entrada "QA: fallo de prueba" tiene fecha y hora

  Scenario: El registro acumula las entradas nuevas al final
    Given el registro contiene la entrada "QA: primera entrada"
    And el registro contiene la entrada "QA: segunda entrada"
    When la administradora abre el registro de errores
    Then ella ve la entrada "QA: primera entrada"
    And ella ve la entrada "QA: segunda entrada"
    And la entrada "QA: primera entrada" aparece antes que "QA: segunda entrada"

  Scenario: Vaciar el registro
    Given el registro contiene la entrada "QA: entrada para borrar"
    When la administradora vacía el registro de errores
    Then el registro de errores está vacío
