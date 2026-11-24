/**
 * Ejecuta la suite de regresión de las funcionalidades RF-06 a RF-11.
 *
 * Es el equivalente de run_all_tests.py del repositorio del curso: corre cada
 * categoría en un proceso aparte y al final muestra un resumen.
 *
 *   npm test              las 4 categorías, las 6 funcionalidades
 *   npm test -- rf-08     solo la funcionalidad RF-08, en las 4 categorías
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CATEGORIAS = ['regression-testing', 'api-testing', 'performance-testing', 'security-testing']

const filtro = process.argv[2] ?? ''
const temporal = mkdtempSync(join(tmpdir(), 'regresion-'))
const resultados = []
const fallidasPorNombre = []

for (const categoria of CATEGORIAS) {
  console.log(`\n${'='.repeat(70)}\nEjecutando ${categoria}${filtro ? ` (${filtro})` : ''}\n${'='.repeat(70)}`)

  const reporte = join(temporal, `${categoria}.json`)
  const proceso = spawnSync(
    'npx',
    ['vitest', 'run', `${categoria}/${filtro}`, '--reporter=verbose', '--reporter=json', `--outputFile.json=${reporte}`],
    // En Windows npx es un .cmd y solo se encuentra a través de la shell.
    { stdio: 'inherit', shell: process.platform === 'win32' },
  )

  let aprobadas = 0
  let fallidas = 0
  try {
    const datos = JSON.parse(readFileSync(reporte, 'utf8'))
    aprobadas = datos.numPassedTests
    fallidas = datos.numFailedTests
    for (const archivo of datos.testResults) {
      for (const prueba of archivo.assertionResults) {
        if (prueba.status === 'failed') fallidasPorNombre.push(`${categoria}: ${prueba.fullName}`)
      }
    }
  } catch {
    // Sin reporte: vitest no llegó a correr (por ejemplo, el filtro no
    // coincide con ningún archivo). Cuenta como fallo.
  }
  resultados.push({ categoria, aprobadas, fallidas, ok: proceso.status === 0 })
}

rmSync(temporal, { recursive: true, force: true })

console.log(`\n${'='.repeat(70)}\nResumen${filtro ? ` (${filtro})` : ''}\n${'='.repeat(70)}`)
for (const { categoria, aprobadas, fallidas } of resultados) {
  const detalle = fallidas > 0 ? `${aprobadas} passed, ${fallidas} failed` : `${aprobadas} passed`
  console.log(`${`${categoria}:`.padEnd(22)}${detalle.padStart(24)}`)
}
const total = resultados.reduce((suma, r) => suma + r.aprobadas, 0)
const totalFallidas = resultados.reduce((suma, r) => suma + r.fallidas, 0)
console.log(`${'Total:'.padEnd(22)}${`${total} passed${totalFallidas ? `, ${totalFallidas} failed` : ''}`.padStart(24)}`)

if (fallidasPorNombre.length > 0) {
  // Las pruebas que fallan llevan en el nombre el código del defecto de la
  // tienda que demuestran (DEF-xx-nn). Están descritos en INFORME.md.
  console.log('\nPruebas que no pasaron:')
  for (const nombre of fallidasPorNombre) console.log(`  - ${nombre}`)
}

const sinCorrer = resultados.filter((r) => r.aprobadas + r.fallidas === 0).map((r) => r.categoria)
if (sinCorrer.length > 0) {
  console.log(`\nCategorías que no llegaron a correr: ${sinCorrer.join(', ')}`)
  process.exit(1)
}
if (totalFallidas > 0) process.exit(1)
console.log('\nTodas las suites finalizaron correctamente.')
