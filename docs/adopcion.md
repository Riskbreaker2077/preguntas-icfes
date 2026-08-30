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

## Grupos de preguntas (v1.2.0) — requisito de integración, no solo dato nuevo

A partir de v1.2.0, un paquete puede traer preguntas con `opciones` de
cualquier tamaño (antes siempre 4) y preguntas miembro de un grupo
(`grupo_id` + `tipo_item`) que no tienen `opciones` propias
(`miembro_banco_opciones`, emparejamiento) o no tienen `enunciado` propio
(`miembro_texto_con_blancos`, *cloze*) — ver `especificacion.md`, sección
"Grupos de preguntas". Esto no es un caveat menor de datos: es un
**requisito real de integración** para cualquier plataforma que quiera
soportar áreas como Inglés, donde estos tipos de ejercicio son la norma, no
la excepción.

- **OpenTest y portal-estudiantes**, tal como están mapeados arriba, asumen
  hoy "una pregunta = un enunciado + N opciones propias, renderizados
  independientemente". Ninguno de los dos tiene hoy un concepto de "varias
  preguntas comparten pantalla" o "las opciones vienen de otro lado" — esto
  es territorio de UI nuevo, no un mapeo de campos adicional.
- Antes de cargar contenido con `grupo_id`, cada plataforma debe decidir:
  (a) implementar el renderizado consciente de grupos (resolver `grupo_id`
  contra `paquete.grupos` y mostrar el estímulo/banco compartido una sola
  vez), o (b) filtrar por `tipo_item` y **excluir** las preguntas que no
  sean `"estandar"` (o ausente) hasta que sí lo implemente. Lo que no debe
  hacer es intentar renderizar una pregunta `miembro_banco_opciones` o
  `miembro_texto_con_blancos` como si fuera independiente — le faltan
  campos a propósito (no tiene `opciones` o no tiene `enunciado`) y quedaría
  rota en pantalla.
- **Puntaje**: ninguna de las dos plataformas debe asumir "1 pregunta = 1
  punto" al sumar un examen. El campo opcional `valor` (número, 1 por
  defecto) es el peso real de cada pregunta; un grupo de 5 preguntas de
  emparejamiento sigue sumando 5 puntos, no 1, aunque se muestre como una
  sola pantalla.
- **Preguntas de 3 (o 5, o más) opciones**: son válidas desde v1.2.0 sin
  necesidad de `grupo_id`. Una plataforma que hoy asume "siempre 4, A-D" en
  su UI (selector de respuesta, atajos de teclado, etc.) debe generalizar
  ese supuesto antes de cargar contenido que no sea de Sociales/Naturales
  tipo v1.0/v1.1 — el paquete **valida** igual, pero el render se ve mal si
  el número de opciones está hardcodeado.

## Retrocompletar `version_estandar` en preguntas existentes (v1.3.0)

`version_estandar` a nivel de **pregunta** (distinto del que ya existe a
nivel de paquete) es nuevo en v1.3.0 y **opcional** — ninguna pregunta
existente deja de ser válida por no tenerlo. No hay obligación de
retrocompletarlo. Pero si tu banco guarda preguntas sueltas fuera de un
paquete (como `banco-preguntas-icfes`), vale la pena hacerlo una vez: sin
este campo, un archivo aislado no tiene ninguna forma de decir de qué
versión del estándar depende con solo mirarlo.

**El criterio no es "cuándo se escribió la pregunta" sino "qué versión
exige el conjunto de campos que trae"** — dos preguntas escritas el mismo
día pueden necesitar versiones distintas si una usa `grupo_id` y la otra
no. Recorre cada pregunta y asígnale la versión más alta que le corresponda
según esta tabla (son excluyentes, usa la última que aplique):

| La pregunta trae... | `version_estandar` |
|---|---|
| Nada más que lo de v1.0.0 (metadata pedagógica de 6 campos, `contexto`/`enunciado`/`opciones`, exactamente 4 opciones) | `"1.0.0"` |
| `grado`, `prueba`, `procedencia`, `verificado`, `fuentes`, o `procedencia_justificacion`/`justificacion_verificada` en alguna opción | `"1.1.0"` |
| `grupo_id`, `tipo_item`, `nivel_mcer`, `valor`, o `opciones` con un tamaño distinto de 4 | `"1.2.0"` |

`validador/validar.js` valida esta consistencia automáticamente cuando el
campo está presente (rechaza, por ejemplo, `"1.0.0"` en una pregunta con
`grupo_id`) — así que un backfill automatizado con esta misma tabla puede
verificarse corriendo el validador después: si pasa, los valores asignados
son al menos suficientes.

Esto es exactamente lo que hizo `banco-preguntas-icfes` para sus ~118
preguntas existentes: un script de una sola pasada (`scripts/migrar-
version-estandar.mjs` en ese repo) que lee cada `banco/<area>/<id>.json`,
aplica la tabla de arriba y escribe el campo si no estaba presente. No es
parte de este estándar (vive en el repo consumidor, no aquí), pero el
patrón — recorrer el banco, inferir la versión por los campos presentes,
escribir solo si falta — es reutilizable por cualquier otro banco que
adopte este estándar.

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
