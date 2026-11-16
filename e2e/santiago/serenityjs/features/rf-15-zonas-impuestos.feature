@rf-15
Feature: Zonas geográficas e impuestos (RF-15)
  Como administradora de la tienda
  Quiero agrupar países y zonas en zonas geográficas
  Para aplicar la tasa de impuesto correcta en cada región

  @smoke
  Scenario: Agregar una zona geográfica con un país y su zona
    When la administradora agrega la zona geográfica "Zona QA" para Estados Unidos y Alabama
    Then la zona geográfica "Zona QA" aparece en la lista
    And la zona geográfica "Zona QA" tiene la descripción guardada

  Scenario: Cambiar la descripción de una zona geográfica
    Given la administradora agregó la zona geográfica "Zona QA" para Estados Unidos y Alabama
    When la administradora cambia la descripción de la zona geográfica "Zona QA" a "Zona QA actualizada"
    Then la descripción de la zona geográfica "Zona QA" es "Zona QA actualizada"

  @defecto
  Scenario: Eliminar una zona geográfica (DEF-15-01)
    Given la administradora agregó la zona geográfica "Zona QA" para Estados Unidos y Alabama
    When la administradora borra la zona geográfica "Zona QA"
    Then la zona geográfica "Zona QA" ya no aparece

  @defecto
  Scenario: Agregar una tasa de impuesto a una zona geográfica (DEF-15-02)
    Given la administradora agregó la zona geográfica "Zona QA" para Estados Unidos y Alabama
    When la administradora agrega la tasa de impuesto "IVA QA" del 10 % a la zona "Zona QA"
    Then la tasa de impuesto "IVA QA" aparece en la zona "Zona QA"

  Scenario: Crear una clase de impuesto con una regla
    Given la administradora tiene una tasa de impuesto existente
    When la administradora crea la clase de impuesto "Clase QA" con esa tasa sobre "store" y prioridad 1
    Then la clase de impuesto "Clase QA" aparece en la lista
    And la clase de impuesto "Clase QA" tiene la regla de esa tasa sobre "store" con prioridad 1
