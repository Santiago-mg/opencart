@rf-03
Feature: Monedas de la tienda (RF-03)
  Como administradora de la tienda
  Quiero agregar y configurar monedas
  Para vender con distintas monedas y precisiones

  @smoke
  Scenario: Agregar una moneda
    When la administradora agrega la moneda "Corona QA" con valor "1.25" y dos decimales
    Then la moneda "Corona QA" aparece habilitada
    And el código de la moneda "Corona QA" tiene 3 caracteres
    And el valor guardado de la moneda "Corona QA" es "1.25"
    And la moneda "Corona QA" guarda 2 decimales

  Scenario: Cambiar el valor de una moneda
    Given la administradora agregó la moneda "Corona QA" con valor "1.25" y dos decimales
    When la administradora cambia el valor de la moneda "Corona QA" a "2.50"
    Then el valor de la moneda "Corona QA" es "2.50"

  Scenario: Cambiar el estado de una moneda desde el formulario
    Given la administradora agregó la moneda "Corona QA" con valor "1.25" y dos decimales
    When la administradora cambia el estado de la moneda "Corona QA" a "deshabilitada"
    Then la moneda "Corona QA" aparece deshabilitada
    When la administradora cambia el estado de la moneda "Corona QA" a "habilitada"
    Then la moneda "Corona QA" aparece habilitada

  Scenario: Eliminar una moneda
    Given la administradora agregó la moneda "Corona QA" con valor "1.25" y dos decimales
    When la administradora borra la moneda "Corona QA"
    Then la moneda "Corona QA" ya no aparece
