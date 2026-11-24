@rf-02
Feature: Idiomas de la tienda (RF-02)
  Como administradora de la tienda
  Quiero agregar y configurar idiomas
  Para que los clientes vean la tienda en su idioma

  @smoke
  Scenario: Agregar un idioma
    When la administradora agrega el idioma "Islandés QA" con locale "is_IS"
    Then el idioma "Islandés QA" aparece habilitado
    And el locale guardado del idioma "Islandés QA" es "is_IS"

  Scenario: Cambiar el nombre de un idioma
    Given la administradora agregó el idioma "Islandés QA" con locale "is_IS"
    When la administradora cambia el nombre del idioma "Islandés QA" a "Islandés QA editado"
    Then el idioma "Islandés QA editado" aparece habilitado

  Scenario: Configurar el locale y el orden de un idioma
    Given la administradora agregó el idioma "Islandés QA" con locale "is_IS"
    When la administradora cambia el locale del idioma "Islandés QA" a "is_IS.UTF-8" y su orden a 3
    Then el locale guardado del idioma "Islandés QA" es "is_IS.UTF-8"
    And el idioma "Islandés QA" aparece en la lista con orden 3

  Scenario: Deshabilitar y volver a habilitar un idioma
    Given la administradora agregó el idioma "Islandés QA" con locale "is_IS"
    When la administradora deshabilita el idioma "Islandés QA"
    Then el idioma "Islandés QA" aparece deshabilitado
    When la administradora habilita el idioma "Islandés QA"
    Then el idioma "Islandés QA" aparece habilitado

  Scenario: Un código de idioma repetido se rechaza
    When la administradora intenta agregar el idioma "Islandés QA" con locale "is_IS" y el código repetido "en-gb"
    Then el panel rechaza el cambio con el aviso "Warning: You have already added this language!"
    And el idioma "Islandés QA" ya no aparece

  @defecto
  Scenario: El idioma por defecto no se puede borrar (DEF-02-02)
    When la administradora intenta borrar el idioma por defecto de la tienda
    Then el panel rechaza el cambio con el aviso "Warning: This Language cannot be deleted as it is currently assigned as the administration language!"
    And el idioma por defecto sigue en la lista

  Scenario: Eliminar un idioma
    Given la administradora agregó el idioma "Islandés QA" con locale "is_IS"
    When la administradora borra el idioma "Islandés QA"
    Then el idioma "Islandés QA" ya no aparece
