# Guía de adopción (informativa, no ejecutada)

Este documento describe cómo mapearían sus modelos actuales dos proyectos
existentes hacia el estándar `preguntas-icfes` v1, **si deciden migrar**. No es
un plan de ejecución ni implica que la migración vaya a hacerse ahora: cada
proyecto la aborda como su propia feature, en su propio repo y a su propio
ritmo.

## OpenTest

Modelo actual (`server/schema.sql`, contrato
`import-paquete-preguntas-v1.md`): `contexto` (texto plano), `imagen` (un
archivo), `enunciado`, `opciones` (4 strings), `correcta` (índice), una sola
`explicacion` general.

Mapeo directo:

| OpenTest hoy | Estándar |
|---|---|
| `contexto` (string) | `contexto: [{ "tipo": "texto", "texto": ... }]` (más el bloque de imagen si `imagen` no es null) |
| `imagen` (un archivo) | Bloque `{ "tipo": "imagen", "archivo": ... }` dentro de `contexto` o `enunciado` según a qué acompañe |
| `enunciado` (string) | `enunciado: [{ "tipo": "texto", "texto": ... }]` |
| `opciones[i]` (string) | `opciones[i].contenido: [{ "tipo": "texto", "texto": ... }]` |
| `correcta` (índice) | `opciones[i].es_correcta` |
| `explicacion` (una, general) | **Requiere reescritura editorial**: hoy es una sola frase que suele explicar la correcta; el estándar pide una `justificacion` por cada una de las 4 opciones. No hay mapeo automático — alguien tiene que redactar las 3 justificaciones de las incorrectas por pregunta. |
| — (no existe) | `competencia`, `componente`, `afirmacion`, `evidencia`, `estandar_asociado`, `que_evalua` — los 6 campos son nuevos, requieren catalogar el banco existente contra una tabla de especificaciones. |

Lo que ya tiene resuelto y puede reutilizar tal cual: los límites de seguridad
del ZIP (peso, rutas, extensiones), la regla de todo-o-nada en la importación,
y el estilo de mensajes de error accionables.

## portal-estudiantes

Modelo actual (`code/prisma/schema.prisma`): `PreguntaEvaluacion` con
`contexto`, `enunciado`, `competencia` (enum cerrado `CompetenciaSociales`,
solo para el área de Sociales), `explicacionCorrecta`; `OpcionPreguntaEvaluacion`
con `correcta` y `retroalimentacion` **ya por opción** (más avanzado que
OpenTest en este punto); `ImagenPreguntaEvaluacion` con imágenes por pregunta y
por opción.

Mapeo directo:

| portal-estudiantes hoy | Estándar |
|---|---|
| `contexto`, `enunciado` (string) | Igual que OpenTest: se envuelven en un bloque `texto` |
| `competencia` (enum `CompetenciaSociales`) | `competencia` (string libre) — la migración implica decidir si el enum se abandona a favor de texto libre, o si el proyecto valida internamente contra su propio catálogo antes de exportar/importar en este formato |
| `OpcionPreguntaEvaluacion.retroalimentacion` | `opciones[i].justificacion` — mapeo casi directo, ya es por opción |
| `ImagenPreguntaEvaluacion` (por pregunta/opción) | Bloques `imagen` dentro de `contexto`/`enunciado`/`contenido` según a qué imagen corresponda |
| — (no existe) | `componente`, `afirmacion`, `evidencia`, `estandar_asociado`, `que_evalua` — nuevos, igual que en OpenTest, y aquí además habría que extenderlos a las áreas que no sean Sociales cuando existan |

Ya tiene resuelto: retroalimentación por opción (el punto que a OpenTest le
falta) y el flujo de integración con ZipGrade (que queda fuera del estándar:
ZipGrade solo aporta calificación, no contenido de preguntas).

## Qué NO resuelve este estándar

- No decide qué hacer con el enum `CompetenciaSociales` de portal-estudiantes
  ni cómo versionar catálogos de competencias por área — eso es decisión de
  cada proyecto (o de una extensión futura de catálogo, ver
  `especificacion.md`).
- No cubre la integración con ZipGrade (calificación de scantron): eso sigue
  siendo un flujo separado de portal-estudiantes.
- No migra datos existentes automáticamente. Escribir las justificaciones por
  opción y la metadata pedagógica de preguntas ya cargadas es trabajo editorial
  manual en ambos proyectos.
