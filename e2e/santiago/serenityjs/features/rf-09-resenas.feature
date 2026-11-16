@rf-09
Feature: Reseñas de productos (RF-09)
  Como cliente de la tienda
  Quiero escribir reseñas de los productos y leer las de otros clientes
  Para compartir mi experiencia y decidir mejor qué comprar

  @web @smoke
  Scenario: Escribir una reseña
    When Carlos escribe una reseña de 5 estrellas sobre "iPhone"
    Then él ve el aviso "Thank you for your review. It has been submitted to the webmaster for approval."

  @web
  Scenario: Una reseña nueva no se ve hasta que la administradora la aprueba
    Given Carlos escribió una reseña de 5 estrellas sobre "iMac"
    When Bruno abre las reseñas de "iMac"
    Then él no ve la reseña de Carlos

  @web
  Scenario: Cuando la administradora la aprueba, todos la ven con sus estrellas
    Given Carlos escribió una reseña de 4 estrellas sobre "HTC Touch HD"
    And la administradora aprobó la reseña de Carlos
    When Bruno abre las reseñas de "HTC Touch HD"
    Then él ve la reseña de Carlos con 4 estrellas

  @web
  Scenario: Un texto demasiado corto no se acepta
    When Carlos escribe una reseña de 5 estrellas sobre "iPhone" con el texto "Muy bueno"
    Then él ve en el formulario el error "Review Text must be between 25 and 1000 characters!"
