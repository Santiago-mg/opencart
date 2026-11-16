window.__SERENITY_REPORT_DATA__ = {
  "schemaVersion": 1,
  "summary": {
    "title": "opencart-e2e-serenityjs",
    "totalScenarios": 7,
    "outcomes": {
      "passed": 7,
      "failed": 0,
      "pending": 0,
      "skipped": 0,
      "compromised": 0,
      "error": 0
    },
    "duration": 15924,
    "startedAt": "2026-11-16T05:08:17.455Z",
    "finishedAt": "2026-11-16T05:08:33.379Z",
    "testRunner": "Cucumber"
  },
  "scenarios": [
    {
      "name": "Filtrar un pedido por su identificador",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 1604,
      "startedAt": "2026-11-16T05:08:17.455Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 15
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        },
        {
          "type": "tag",
          "name": "smoke"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 1,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:17.456Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 33,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:17.462Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el identificador del pedido de \"Mateo Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 857,
          "children": [
            {
              "name": "Ana filtra los pedidos por el identificador 1371",
              "outcome": "SUCCESS",
              "duration": 840,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 580,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:17.503Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos por el identificador 1371",
                  "outcome": "SUCCESS",
                  "duration": 239,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.093Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 44,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:17.503Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 44,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:17.496Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 16
          }
        },
        {
          "name": "Then ella ve un solo pedido",
          "outcome": "SUCCESS",
          "duration": 16,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
              "outcome": "SUCCESS",
              "duration": 2,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.358Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 57,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:18.354Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 17
          }
        },
        {
          "name": "And el cliente del pedido es \"Mateo Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los clientes de los pedidos does equal [ \"Mateo Pedidos mwisyy642\" ]",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.373Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 69,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:18.371Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 18
          }
        },
        {
          "name": "And el estado del pedido es \"Shipped\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los estados de los pedidos does equal [ \"Shipped\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.386Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 73,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:18.384Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 19
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 625,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 491,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.401Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.903Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 61,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.913Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.985Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:18.996Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:19.006Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:18.398Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 1604,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:17.456Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 33,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:17.462Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el identificador del pedido de \"Mateo Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 857,
              "children": [
                {
                  "name": "Ana filtra los pedidos por el identificador 1371",
                  "outcome": "SUCCESS",
                  "duration": 840,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 580,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:17.503Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos por el identificador 1371",
                      "outcome": "SUCCESS",
                      "duration": 239,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:18.093Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 44,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:17.503Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 44,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:17.496Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 16
              }
            },
            {
              "name": "Then ella ve un solo pedido",
              "outcome": "SUCCESS",
              "duration": 16,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
                  "outcome": "SUCCESS",
                  "duration": 2,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.358Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 57,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:18.354Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 17
              }
            },
            {
              "name": "And el cliente del pedido es \"Mateo Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los clientes de los pedidos does equal [ \"Mateo Pedidos mwisyy642\" ]",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.373Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 69,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:18.371Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 18
              }
            },
            {
              "name": "And el estado del pedido es \"Shipped\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los estados de los pedidos does equal [ \"Shipped\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.386Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 73,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:18.384Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 19
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 625,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 491,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.401Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.903Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 61,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.913Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.985Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:18.996Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:19.006Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:18.398Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:15"
    },
    {
      "name": "Filtrar los pedidos por el nombre del cliente",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 2308,
      "startedAt": "2026-11-16T05:08:19.063Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 21
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 1,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:19.064Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:19.067Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el cliente \"Lucía Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 1126,
          "children": [
            {
              "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy645",
              "outcome": "SUCCESS",
              "duration": 1114,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 632,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:19.082Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy645",
                  "outcome": "SUCCESS",
                  "duration": 460,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:19.725Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 47,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:19.082Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 47,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:19.080Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 22
          }
        },
        {
          "name": "Then ella ve 2 pedidos",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 2",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:20.208Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 61,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:20.207Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 23
          }
        },
        {
          "name": "And los clientes de los pedidos son \"Lucía Pedidos, Lucía Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los clientes de los pedidos does equal [ \"Lucía Pedidos mwisyy645\", \"Lucía Pedidos mwisyy645\" ]",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:20.222Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 77,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:20.220Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 24
          }
        },
        {
          "name": "And los totales de los pedidos son \"150.00, 350.00\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los totales de los pedidos does equal [ \"150.00\", \"350.00\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:20.235Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 85,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:20.233Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 25
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 1090,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 750,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:20.249Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:21.010Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 269,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:21.020Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:21.300Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:21.310Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:21.321Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:20.247Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 2308,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:19.064Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:19.067Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el cliente \"Lucía Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 1126,
              "children": [
                {
                  "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy645",
                  "outcome": "SUCCESS",
                  "duration": 1114,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 632,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:19.082Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy645",
                      "outcome": "SUCCESS",
                      "duration": 460,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:19.725Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 47,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:19.082Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 47,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:19.080Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 22
              }
            },
            {
              "name": "Then ella ve 2 pedidos",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 2",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:20.208Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 61,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:20.207Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 23
              }
            },
            {
              "name": "And los clientes de los pedidos son \"Lucía Pedidos, Lucía Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los clientes de los pedidos does equal [ \"Lucía Pedidos mwisyy645\", \"Lucía Pedidos mwisyy645\" ]",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:20.222Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 77,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:20.220Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 24
              }
            },
            {
              "name": "And los totales de los pedidos son \"150.00, 350.00\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los totales de los pedidos does equal [ \"150.00\", \"350.00\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:20.235Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 85,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:20.233Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 25
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 1090,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 750,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:20.249Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.010Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 269,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.020Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.300Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.310Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.321Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:20.247Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:21"
    },
    {
      "name": "Filtrar los pedidos por su estado",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 1782,
      "startedAt": "2026-11-16T05:08:21.374Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 27
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 0,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:21.374Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:21.375Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el estado \"Shipped\"",
          "outcome": "SUCCESS",
          "duration": 1008,
          "children": [
            {
              "name": "Ana filtra los pedidos con estado Shipped",
              "outcome": "SUCCESS",
              "duration": 995,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 900,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:21.389Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos con estado Shipped",
                  "outcome": "SUCCESS",
                  "duration": 75,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:22.299Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 50,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:21.389Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 50,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:21.387Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 28
          }
        },
        {
          "name": "Then ella ve un solo pedido",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:22.397Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 57,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:22.395Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 29
          }
        },
        {
          "name": "And los estados de los pedidos son \"Shipped\"",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [
            {
              "name": "Ana ensures that los estados de los pedidos does equal [ \"Shipped\" ]",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:22.411Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 81,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:22.409Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 30
          }
        },
        {
          "name": "And los clientes de los pedidos son \"Mateo Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los clientes de los pedidos does equal [ \"Mateo Pedidos mwisyy64c\" ]",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:22.424Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 77,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:22.422Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 31
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 699,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 567,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:22.437Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.013Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 61,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.024Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.095Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.105Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.116Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:22.435Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 1782,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:21.374Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:21.375Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el estado \"Shipped\"",
              "outcome": "SUCCESS",
              "duration": 1008,
              "children": [
                {
                  "name": "Ana filtra los pedidos con estado Shipped",
                  "outcome": "SUCCESS",
                  "duration": 995,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 900,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:21.389Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos con estado Shipped",
                      "outcome": "SUCCESS",
                      "duration": 75,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:22.299Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 50,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:21.389Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 50,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:21.387Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 28
              }
            },
            {
              "name": "Then ella ve un solo pedido",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:22.397Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 57,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:22.395Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 29
              }
            },
            {
              "name": "And los estados de los pedidos son \"Shipped\"",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [
                {
                  "name": "Ana ensures that los estados de los pedidos does equal [ \"Shipped\" ]",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:22.411Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 81,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:22.409Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 30
              }
            },
            {
              "name": "And los clientes de los pedidos son \"Mateo Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los clientes de los pedidos does equal [ \"Mateo Pedidos mwisyy64c\" ]",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:22.424Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 77,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:22.422Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 31
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 699,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 567,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:22.437Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.013Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 61,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.024Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.095Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.105Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.116Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:22.435Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:27"
    },
    {
      "name": "Filtrar los pedidos por su total exacto",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 1786,
      "startedAt": "2026-11-16T05:08:23.158Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 33
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 0,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.158Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 12,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.159Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el total \"350.00\"",
          "outcome": "SUCCESS",
          "duration": 742,
          "children": [
            {
              "name": "Ana filtra los pedidos con total 350.00",
              "outcome": "SUCCESS",
              "duration": 730,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 630,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.173Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos con total 350.00",
                  "outcome": "SUCCESS",
                  "duration": 79,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.813Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 53,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.173Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 53,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.172Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 34
          }
        },
        {
          "name": "Then ella ve un solo pedido",
          "outcome": "SUCCESS",
          "duration": 15,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.917Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 57,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.914Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 35
          }
        },
        {
          "name": "And los totales de los pedidos son \"350.00\"",
          "outcome": "SUCCESS",
          "duration": 15,
          "children": [
            {
              "name": "Ana ensures that los totales de los pedidos does equal [ \"350.00\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.933Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 85,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.930Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 36
          }
        },
        {
          "name": "And el cliente del pedido es \"Lucía Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 15,
          "children": [
            {
              "name": "Ana ensures that los clientes de los pedidos does equal [ \"Lucía Pedidos mwisyy64f\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.949Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 69,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.945Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 37
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 950,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 822,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:23.966Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:24.798Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 57,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:24.809Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:24.875Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:24.886Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:24.897Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:23.961Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 1786,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.158Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 12,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.159Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el total \"350.00\"",
              "outcome": "SUCCESS",
              "duration": 742,
              "children": [
                {
                  "name": "Ana filtra los pedidos con total 350.00",
                  "outcome": "SUCCESS",
                  "duration": 730,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 630,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:23.173Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos con total 350.00",
                      "outcome": "SUCCESS",
                      "duration": 79,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:23.813Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 53,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:23.173Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 53,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.172Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 34
              }
            },
            {
              "name": "Then ella ve un solo pedido",
              "outcome": "SUCCESS",
              "duration": 15,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.917Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 57,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.914Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 35
              }
            },
            {
              "name": "And los totales de los pedidos son \"350.00\"",
              "outcome": "SUCCESS",
              "duration": 15,
              "children": [
                {
                  "name": "Ana ensures that los totales de los pedidos does equal [ \"350.00\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.933Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 85,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.930Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 36
              }
            },
            {
              "name": "And el cliente del pedido es \"Lucía Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 15,
              "children": [
                {
                  "name": "Ana ensures that los clientes de los pedidos does equal [ \"Lucía Pedidos mwisyy64f\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.949Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 69,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.945Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 37
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 950,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 822,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:23.966Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.798Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 57,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.809Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.875Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.886Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.897Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:23.961Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:33"
    },
    {
      "name": "Filtrar los pedidos por un rango de fechas",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 2206,
      "startedAt": "2026-11-16T05:08:24.947Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 39
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 0,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:24.949Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:24.951Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos entre \"2026-02-01\" y \"2026-02-28\"",
          "outcome": "SUCCESS",
          "duration": 1129,
          "children": [
            {
              "name": "Ana filtra los pedidos entre 2026-02-01 y 2026-02-28",
              "outcome": "SUCCESS",
              "duration": 1115,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 1038,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:24.967Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos entre 2026-02-01 y 2026-02-28",
                  "outcome": "SUCCESS",
                  "duration": 57,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.015Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 56,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:24.967Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 56,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:24.964Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 40
          }
        },
        {
          "name": "Then ella ve un solo pedido",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:26.095Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 57,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:26.093Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 41
          }
        },
        {
          "name": "And las fechas de los pedidos son \"15/02/2026\"",
          "outcome": "SUCCESS",
          "duration": 14,
          "children": [
            {
              "name": "Ana ensures that las fechas de los pedidos does equal [ \"15/02/2026\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:26.108Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 89,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:26.106Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 42
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 999,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 659,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:26.124Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:26.792Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 269,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:26.803Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.082Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.093Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.104Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:26.121Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 2206,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:24.949Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:24.951Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos entre \"2026-02-01\" y \"2026-02-28\"",
              "outcome": "SUCCESS",
              "duration": 1129,
              "children": [
                {
                  "name": "Ana filtra los pedidos entre 2026-02-01 y 2026-02-28",
                  "outcome": "SUCCESS",
                  "duration": 1115,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 1038,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:24.967Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos entre 2026-02-01 y 2026-02-28",
                      "outcome": "SUCCESS",
                      "duration": 57,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:26.015Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 56,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:24.967Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 56,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:24.964Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 40
              }
            },
            {
              "name": "Then ella ve un solo pedido",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.095Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 57,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:26.093Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 41
              }
            },
            {
              "name": "And las fechas de los pedidos son \"15/02/2026\"",
              "outcome": "SUCCESS",
              "duration": 14,
              "children": [
                {
                  "name": "Ana ensures that las fechas de los pedidos does equal [ \"15/02/2026\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.108Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 89,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:26.106Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 42
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 999,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 659,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.124Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.792Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 269,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:26.803Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.082Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.093Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.104Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:26.121Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:39"
    },
    {
      "name": "Combinar el filtro de cliente con el de estado",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 4628,
      "startedAt": "2026-11-16T05:08:27.156Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 44
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 0,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.157Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 14,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.159Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el cliente \"Lucía Pedidos\" y el estado \"Complete\"",
          "outcome": "SUCCESS",
          "duration": 618,
          "children": [
            {
              "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy64p con estado Complete",
              "outcome": "SUCCESS",
              "duration": 604,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 512,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.177Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy64p con estado Complete",
                  "outcome": "SUCCESS",
                  "duration": 71,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.700Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 59,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.177Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 59,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.174Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 45
          }
        },
        {
          "name": "Then ella ve un solo pedido",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.794Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 57,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.792Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 46
          }
        },
        {
          "name": "And los totales de los pedidos son \"350.00\"",
          "outcome": "SUCCESS",
          "duration": 14,
          "children": [
            {
              "name": "Ana ensures that los totales de los pedidos does equal [ \"350.00\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.807Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 85,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.805Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 47
          }
        },
        {
          "name": "And los estados de los pedidos son \"Complete\"",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that los estados de los pedidos does equal [ \"Complete\" ]",
              "outcome": "SUCCESS",
              "duration": 1,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.821Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 81,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.819Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 48
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 3920,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 3609,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:27.834Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:31.453Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 241,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:31.463Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:31.715Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:31.726Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:31.736Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:27.832Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 4628,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.157Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 14,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.159Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el cliente \"Lucía Pedidos\" y el estado \"Complete\"",
              "outcome": "SUCCESS",
              "duration": 618,
              "children": [
                {
                  "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy64p con estado Complete",
                  "outcome": "SUCCESS",
                  "duration": 604,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 512,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:27.177Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos de Lucía Pedidos mwisyy64p con estado Complete",
                      "outcome": "SUCCESS",
                      "duration": 71,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:27.700Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 59,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:27.177Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 59,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.174Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 45
              }
            },
            {
              "name": "Then ella ve un solo pedido",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 1",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.794Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 57,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.792Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 46
              }
            },
            {
              "name": "And los totales de los pedidos son \"350.00\"",
              "outcome": "SUCCESS",
              "duration": 14,
              "children": [
                {
                  "name": "Ana ensures that los totales de los pedidos does equal [ \"350.00\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.807Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 85,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.805Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 47
              }
            },
            {
              "name": "And los estados de los pedidos son \"Complete\"",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that los estados de los pedidos does equal [ \"Complete\" ]",
                  "outcome": "SUCCESS",
                  "duration": 1,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.821Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 81,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.819Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 48
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 3920,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 3609,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:27.834Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.453Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 241,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.463Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.715Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.726Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.736Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:27.832Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:44"
    },
    {
      "name": "Un filtro sin coincidencias no devuelve pedidos",
      "category": "Filtrado de pedidos en el panel (RF-12)",
      "outcome": "SUCCESS",
      "duration": 1592,
      "startedAt": "2026-11-16T05:08:31.787Z",
      "source": {
        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
        "line": 50
      },
      "tags": [
        {
          "type": "feature",
          "name": "Filtrado de pedidos en el panel (RF-12)"
        },
        {
          "type": "tag",
          "name": "rf-12"
        }
      ],
      "activities": [
        {
          "name": "Before",
          "outcome": "SUCCESS",
          "duration": 0,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:31.788Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 10
          }
        },
        {
          "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
          "outcome": "SUCCESS",
          "duration": 11,
          "children": [],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:31.789Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 8
          }
        },
        {
          "name": "When la administradora filtra los pedidos por el cliente \"Nadie Pedidos\"",
          "outcome": "SUCCESS",
          "duration": 827,
          "children": [
            {
              "name": "Ana filtra los pedidos de Nadie Pedidos mwisyy64z",
              "outcome": "SUCCESS",
              "duration": 815,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 725,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:31.802Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 34,
                    "column": 23
                  }
                },
                {
                  "name": "Ana filtra los pedidos de Nadie Pedidos mwisyy64z",
                  "outcome": "SUCCESS",
                  "duration": 68,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:32.538Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 47,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:31.802Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                "line": 47,
                "column": 5
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:31.800Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 51
          }
        },
        {
          "name": "Then ella no ve ningún pedido",
          "outcome": "SUCCESS",
          "duration": 13,
          "children": [
            {
              "name": "Ana ensures that cuántos pedidos muestra el panel does equal 0",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:32.629Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                "line": 65,
                "column": 43
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:32.627Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
            "line": 52
          }
        },
        {
          "name": "After",
          "outcome": "SUCCESS",
          "duration": 718,
          "children": [
            {
              "name": "Ana inicia sesión en el panel de administración",
              "outcome": "SUCCESS",
              "duration": 592,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:32.642Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 31,
                "column": 25
              }
            },
            {
              "name": "Ana borra los cupones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:33.245Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 32,
                "column": 15
              }
            },
            {
              "name": "Ana borra las reseñas de \"QA…\"",
              "outcome": "SUCCESS",
              "duration": 53,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:33.255Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 33,
                "column": 15
              }
            },
            {
              "name": "Ana borra las devoluciones de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:33.319Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 34,
                "column": 15
              }
            },
            {
              "name": "Ana borra los idiomas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:33.329Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 35,
                "column": 15
              }
            },
            {
              "name": "Ana borra las monedas de prueba",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Interaction",
              "startedAt": "2026-11-16T05:08:33.340Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 36,
                "column": 15
              }
            }
          ],
          "type": "Task",
          "startedAt": "2026-11-16T05:08:32.640Z",
          "location": {
            "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
            "line": 21
          }
        }
      ],
      "executionHistory": [
        {
          "outcome": "SUCCESS",
          "run": "2026-11-16T05-08-33.455Z",
          "timestamp": "2026-11-16T05:08:17.455Z",
          "duration": 1592,
          "activities": [
            {
              "name": "Before",
              "outcome": "SUCCESS",
              "duration": 0,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:31.788Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 10
              }
            },
            {
              "name": "Given la tienda tiene estos pedidos:\n| cliente       | estado     | total  | fecha      |\n| Lucía Pedidos | Processing | 150.00 | 2026-01-10 |\n| Mateo Pedidos | Shipped    | 250.00 | 2026-02-15 |\n| Lucía Pedidos | Complete   | 350.00 | 2026-03-20 |",
              "outcome": "SUCCESS",
              "duration": 11,
              "children": [],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:31.789Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 8
              }
            },
            {
              "name": "When la administradora filtra los pedidos por el cliente \"Nadie Pedidos\"",
              "outcome": "SUCCESS",
              "duration": 827,
              "children": [
                {
                  "name": "Ana filtra los pedidos de Nadie Pedidos mwisyy64z",
                  "outcome": "SUCCESS",
                  "duration": 815,
                  "children": [
                    {
                      "name": "Ana inicia sesión en el panel de administración",
                      "outcome": "SUCCESS",
                      "duration": 725,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:31.802Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 34,
                        "column": 23
                      }
                    },
                    {
                      "name": "Ana filtra los pedidos de Nadie Pedidos mwisyy64z",
                      "outcome": "SUCCESS",
                      "duration": 68,
                      "children": [],
                      "type": "Interaction",
                      "startedAt": "2026-11-16T05:08:32.538Z",
                      "location": {
                        "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                        "line": 47,
                        "column": 5
                      }
                    }
                  ],
                  "type": "Task",
                  "startedAt": "2026-11-16T05:08:31.802Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/test/tasks/admin/Orders.ts",
                    "line": 47,
                    "column": 5
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:31.800Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 51
              }
            },
            {
              "name": "Then ella no ve ningún pedido",
              "outcome": "SUCCESS",
              "duration": 13,
              "children": [
                {
                  "name": "Ana ensures that cuántos pedidos muestra el panel does equal 0",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:32.629Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/step-definitions/rf-12-pedidos.steps.ts",
                    "line": 65,
                    "column": 43
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:32.627Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature",
                "line": 52
              }
            },
            {
              "name": "After",
              "outcome": "SUCCESS",
              "duration": 718,
              "children": [
                {
                  "name": "Ana inicia sesión en el panel de administración",
                  "outcome": "SUCCESS",
                  "duration": 592,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:32.642Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 31,
                    "column": 25
                  }
                },
                {
                  "name": "Ana borra los cupones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:33.245Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 32,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las reseñas de \"QA…\"",
                  "outcome": "SUCCESS",
                  "duration": 53,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:33.255Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 33,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las devoluciones de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:33.319Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 34,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra los idiomas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:33.329Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 35,
                    "column": 15
                  }
                },
                {
                  "name": "Ana borra las monedas de prueba",
                  "outcome": "SUCCESS",
                  "duration": 0,
                  "children": [],
                  "type": "Interaction",
                  "startedAt": "2026-11-16T05:08:33.340Z",
                  "location": {
                    "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                    "line": 36,
                    "column": 15
                  }
                }
              ],
              "type": "Task",
              "startedAt": "2026-11-16T05:08:32.640Z",
              "location": {
                "path": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/support/hooks.ts",
                "line": 21
              }
            }
          ]
        }
      ],
      "narrative": "<p>Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar</p>\n",
      "cast": [
        {
          "name": "Ana",
          "abilities": [
            {
              "name": "PerformActivities"
            },
            {
              "name": "AnswerQuestions"
            },
            {
              "name": "RaiseErrors"
            },
            {
              "name": "ScheduleWork",
              "details": "{\"scheduler\":{\"clock\":{\"timeAdjustment\":{\"milliseconds\":0}},\"interactionTimeout\":{\"milliseconds\":5000}}}"
            },
            {
              "name": "BrowseTheWebWithPlaywright"
            },
            {
              "name": "CallAnApi",
              "details": "{\"baseURL\":\"http://localhost/\",\"headers\":{\"common\":{\"Accept\":\"application/json, text/plain, */*\"}},\"timeout\":30000}"
            },
            {
              "name": "TakeNotes",
              "details": "{\"notepad\":{}}"
            }
          ]
        }
      ],
      "id": "/home/andres/validation/opencart/e2e/santiago/serenityjs/features/rf-12-pedidos.feature:50"
    }
  ],
  "history": [
    {
      "timestamp": "2026-11-16T05:08:17.455Z",
      "duration": 15924,
      "outcomes": {
        "passed": 7,
        "failed": 0,
        "pending": 0,
        "skipped": 0,
        "compromised": 0,
        "error": 0
      },
      "label": "2026-11-16T05-08-33.455Z",
      "slowest": 4628,
      "fastest": 1592,
      "average": 2272,
      "commit": "3c39f12507",
      "branch": "proyecto-4.1.0.3",
      "repositoryUrl": "https://github.com/Santiago-mg/opencart.git",
      "score": {
        "confidence": 100,
        "passRate": 100,
        "consistency": 100,
        "completeness": 100
      }
    }
  ],
  "tags": [
    {
      "type": "feature",
      "name": "Filtrado de pedidos en el panel (RF-12)",
      "scenarioCount": 7,
      "passed": 7,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "rf-12",
      "scenarioCount": 7,
      "passed": 7,
      "failed": 0,
      "skipped": 0
    },
    {
      "type": "tag",
      "name": "smoke",
      "scenarioCount": 1,
      "passed": 1,
      "failed": 0,
      "skipped": 0
    }
  ],
  "inconsistentTests": [],
  "newFailures": [],
  "newPasses": [],
  "systemContext": {
    "nodeVersion": "v26.3.0",
    "os": {
      "name": "linux",
      "version": "6.6.87.2-microsoft-standard-WSL2",
      "arch": "x64"
    },
    "serenityVersion": "3.48.0",
    "testRunner": {
      "name": "Cucumber",
      "version": "13.3.0"
    },
    "browsers": [],
    "ci": {
      "provider": "localhost (DESKTOP-5L15E4A)",
      "buildNumber": "2026-11-16 05:08",
      "branch": "proyecto-4.1.0.3",
      "commit": "3c39f12507",
      "commitMessage": "docs(test): document the merged feature unit suite on OpenCart 5",
      "commitAuthor": "Andrés Mendoza",
      "repositoryUrl": "https://github.com/Santiago-mg/opencart.git"
    },
    "projectName": "opencart-e2e-serenityjs",
    "packageManager": "npm"
  },
  "capabilities": {
    "type": "directory",
    "name": "features",
    "outcomes": {
      "passed": 7,
      "failed": 0,
      "pending": 0,
      "skipped": 0,
      "compromised": 0,
      "error": 0
    },
    "scenarioCount": 7,
    "children": [
      {
        "type": "file",
        "name": "rf-12-pedidos",
        "outcomes": {
          "passed": 7,
          "failed": 0,
          "pending": 0,
          "skipped": 0,
          "compromised": 0,
          "error": 0
        },
        "scenarioCount": 7,
        "scenarios": [
          {
            "name": "Filtrar un pedido por su identificador",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Filtrar los pedidos por el nombre del cliente",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Filtrar los pedidos por su estado",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Filtrar los pedidos por su total exacto",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Filtrar los pedidos por un rango de fechas",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Combinar el filtro de cliente con el de estado",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          },
          {
            "name": "Un filtro sin coincidencias no devuelve pedidos",
            "outcome": "SUCCESS",
            "executionHistory": [
              "SUCCESS"
            ]
          }
        ],
        "narrative": "Como administradora de la tienda\nQuiero filtrar los pedidos por identificador, cliente, estado, total y fechas\nPara encontrar rápido los pedidos que necesito revisar",
        "score": {
          "confidence": 100,
          "passRate": 100,
          "completeness": 100,
          "consistency": 100
        }
      }
    ],
    "score": {
      "confidence": 100,
      "passRate": 100,
      "completeness": 100,
      "consistency": 100
    }
  },
  "specDirectory": "features"
};
