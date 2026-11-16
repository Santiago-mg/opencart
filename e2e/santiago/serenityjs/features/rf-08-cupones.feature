@rf-08
Feature: Cupones de descuento (RF-08)
  Como cliente de la tienda
  Quiero usar un cupón de descuento en el carrito
  Para pagar menos por mi compra

  Background:
    Given Carlos tiene 1 unidad de "iPhone" en el carrito

  @web @smoke
  Scenario: Aplicar un cupón vigente del 10 %
    Given la administradora publicó un cupón del 10 % vigente
    When Carlos aplica el cupón en el carrito
    Then él ve el aviso "Success: Your coupon discount has been applied!"
    And él ve que el cupón descuenta "$-10.10"
    And él ve que el total del carrito es "$111.08"

  @web
  Scenario: Un cupón de monto fijo descuenta exactamente ese valor
    Given la administradora publicó un cupón de $10 vigente
    When Carlos aplica el cupón en el carrito
    Then él ve que el cupón descuenta "$-10.00"
    And él ve que el total del carrito es "$111.20"

  @web
  Scenario Outline: Un cupón <motivo> se rechaza y el total no cambia
    Given la administradora publicó un cupón <motivo>
    When Carlos aplica el cupón en el carrito
    Then él ve el aviso "Warning: Coupon is either invalid, expired or reached its usage limit!"
    And él ve que el total del carrito es "$123.20"

    Examples:
      | motivo                         |
      | vencido                        |
      | con compra mínima de $500      |

  @web @defecto
  Scenario: Quitar el cupón devuelve el total original (DEF-08-05)
    Given la administradora publicó un cupón del 10 % vigente
    And Carlos aplicó el cupón en el carrito
    When él quita el cupón
    Then él ya no ve el descuento del cupón
    And él ve que el total del carrito es "$123.20"
