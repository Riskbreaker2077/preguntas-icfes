# Especificación · Preguntas ICFES v1.3.0

## Qué resuelve

Una pregunta tipo ICFES no es solo "enunciado + 4 opciones". Trae una tabla de
especificaciones (qué competencia, componente, afirmación y evidencia mide, y a
qué estándar del MEN corresponde), puede apoyarse en contexto e incluso
opciones con imágenes o tablas, y la retroalimentación de cada opción
incorrecta explica el error específico de esa opción, no un comentario
genérico.

Este documento define el formato de un **paquete**: un conjunto de preguntas
que se cargan juntas (típicamente 20-50, aunque el estándar no impone un
mínimo salvo que el paquete no puede estar vacío).

## Paquete (envelope)

```json
{
  "estandar": "preguntas-icfes",
  "version_estandar": "1.0.0",
  "nombre": "Ciencias Sociales · Participación ciudadana",
  "area": "Ciencias Sociales y Ciudadanas",
  "preguntas": [ /* ver abajo */ ]
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `estandar` | Sí | Siempre el literal `"preguntas-icfes"`. Identifica el formato ante un lector que reciba el JSON sin contexto. |
| `version_estandar` | Sí | SemVer de la versión del estándar que sigue el paquete, p. ej. `"1.0.0"`. |
| `nombre` | Sí | Nombre descriptivo del paquete. |
| `area` | No | Asignatura o área, texto libre (p. ej. `"Matemáticas"`, `"Ciencias Sociales y Ciudadanas"`). |
| `preguntas` | Sí | Array de al menos una pregunta. |

## Pregunta

```json
{
  "id": "pc-001",
  "competencia": "Pensamiento social",
  "componente": "Sujeto, sociedad y estado",
  "afirmacion": "Reconoce mecanismos de participación democrática",
  "evidencia": "Identifica el mecanismo adecuado según el caso planteado",
  "estandar_asociado": "Comprendo que el ejercicio político es el resultado de decisiones de individuos y grupos",
  "que_evalua": "La capacidad de diferenciar mecanismos de participación ciudadana según el caso descrito.",
  "contexto": [
    { "tipo": "texto", "texto": "La Constitución de 1991 fortaleció la democracia participativa en Colombia." },
    { "tipo": "imagen", "archivo": "votacion-ciudadana.png", "descripcion_accesible": "Personas votando en una mesa electoral" }
  ],
  "enunciado": [
    { "tipo": "texto", "texto": "¿Cuál conjunto contiene únicamente mecanismos mencionados en el artículo 103?" }
  ],
  "opciones": [
    {
      "id": "A",
      "contenido": [{ "tipo": "texto", "texto": "Voto, referendo, cabildo abierto y revocatoria del mandato" }],
      "es_correcta": true,
      "justificacion": "Correcta: el artículo 103 enumera exactamente estos mecanismos de participación."
    },
    {
      "id": "B",
      "contenido": [{ "tipo": "texto", "texto": "Tutela, voto, acción popular y petición" }],
      "es_correcta": false,
      "justificacion": "Incorrecta: la tutela y la acción popular son mecanismos de protección de derechos, no de participación democrática directa."
    }
  ]
}
```

### Metadata pedagógica

Seis campos de texto libre, todos obligatorios y no vacíos:

| Campo | Qué captura |
|---|---|
| `competencia` | La competencia general que mide (p. ej. "Pensamiento social", "Comunicativa-lectora"). |
| `componente` | El componente dentro del área (p. ej. "Sujeto, sociedad y estado"). |
| `afirmacion` | La afirmación específica de la tabla de especificaciones. |
| `evidencia` | La evidencia observable asociada a esa afirmación. |
| `estandar_asociado` | El Estándar Básico de Competencias (MEN) al que corresponde. |
| `que_evalua` | Descripción libre de qué evalúa esta pregunta en particular. |

Son texto libre a propósito: cada área/institución tiene su propio vocabulario
de competencias y componentes, y v1 no impone un catálogo cerrado (ver
"Extensiones futuras" más abajo).

### Bloques de contenido

`contexto`, `enunciado` y el `contenido` de cada opción son arrays de bloques.
Un bloque es uno de estos tres tipos:

- **`texto`**: `{ "tipo": "texto", "texto": "..." }`
- **`imagen`**: `{ "tipo": "imagen", "archivo": "nombre.png", "descripcion_accesible": "..." }`. `archivo` es solo el nombre, sin carpeta; debe existir dentro de `imagenes/` en el paquete ZIP. `descripcion_accesible` es opcional pero recomendada.
- **`tabla`**: `{ "tipo": "tabla", "encabezados": [...], "filas": [[...], ...] }`. Cada fila debe tener el mismo número de columnas que `encabezados`.

Un array de bloques puede combinar varios tipos y varias veces el mismo tipo
(p. ej. dos párrafos de texto separados por una tabla). `contexto` puede ser un
array vacío cuando la pregunta no comparte contexto con otras.

### Opciones

Al menos 2 opciones por pregunta, sin tope superior (antes de v1.2.0 se
exigían exactamente 4; los paquetes existentes con 4 opciones siguen siendo
válidos sin cambios). Cada una:

| Campo | Descripción |
|---|---|
| `id` | Identificador de la opción dentro de la pregunta (p. ej. `"A"`–`"D"`, o cualquier string corto). |
| `contenido` | Array de bloques — igual que `enunciado`: puede ser texto, imagen, tabla o combinación. |
| `es_correcta` | Booleano. Exactamente una opción por pregunta debe ser `true`. |
| `justificacion` | Texto no vacío, **específico de esa opción**. Para la correcta, por qué lo es; para cada incorrecta, el error puntual de esa opción (nunca "la respuesta correcta es la A" repetido). |

### Grado y prueba de origen

Dos campos opcionales, de tipo enum cerrado, para poder filtrar preguntas por
grado escolar y por el programa de evaluación del que provienen:

| Campo | Valores | Qué captura |
|---|---|---|
| `grado` | `"3"`–`"11"` | El grado escolar al que corresponde la pregunta. |
| `prueba` | `"saber11"`, `"evaluar_para_avanzar"` | El programa de evaluación de origen. El catálogo puede ampliarse en futuras versiones menores del estándar. |

A diferencia de la metadata pedagógica (texto libre porque el vocabulario
varía por institución), aquí el universo de valores es finito y conocido, así
que se cierra a un enum: evita que el mismo grado quede escrito de formas
distintas (`"9"`, `"noveno"`, `"9°"`) y deje de ser filtrable.

### Procedencia y trazabilidad

No todo en una pregunta se produce de la misma forma: el enunciado puede venir
extraído literalmente de un cuadernillo oficial mientras que la clasificación
pedagógica la infiere una IA, y la respuesta correcta puede confirmarse después
con una clave oficial encontrada más tarde. Tres campos, todos opcionales y a
**nivel de pregunta**, capturan esto:

- **`procedencia`**: de dónde viene cada bloque de la pregunta. Es un objeto
  con hasta tres llaves, cada una con valor `"oficial"`, `"extraido_oficial"`
  o `"ia_generada"`:

  | Llave | Cubre |
  |---|---|
  | `contenido` | `contexto`, `enunciado` y el `contenido` de las opciones. |
  | `clasificacion` | Los 6 campos de metadata pedagógica. |
  | `respuesta_correcta` | Qué opción tiene `es_correcta: true`. |

  La justificación de cada opción **no** entra en este objeto — ver más abajo.

- **`verificado`**: si un humano confirmó la exactitud de cada bloque,
  independientemente de su origen. Mismo formato que `procedencia` pero con
  valores booleanos. Es ortogonal a `procedencia`: algo puede ser
  `ia_generada` y estar `verificado: true` una vez un docente lo revisa.

- **`fuentes`**: el nombre del PDF (dentro de `fuentes/` en el paquete ZIP, sin
  ruta) del que se extrajo cada bloque. Mismas llaves que `procedencia`. Tiene
  sentido sobre todo para bloques con procedencia `oficial` o
  `extraido_oficial` — permite que `contenido` y `respuesta_correcta`
  referencien documentos distintos (p. ej. el cuadernillo y la clave oficial,
  publicados por separado).

**Ausencia de estos campos significa "origen no declarado".** Ningún lector
del estándar debe asumir automáticamente que una pregunta sin `procedencia`
es confiable ni que no lo es.

Cada **opción** además puede declarar, independientemente de la pregunta:

| Campo | Tipo | Qué captura |
|---|---|---|
| `procedencia_justificacion` | mismo enum de 3 valores | El origen de la justificación de esa opción en particular. |
| `justificacion_verificada` | booleano | Si un humano confirmó esa justificación. |

Esto existe porque la retroalimentación oficial casi nunca cubre las 4
opciones por igual: es común que solo la justificación de la respuesta
correcta tenga fuente oficial, mientras las de las opciones incorrectas siguen
siendo generadas por IA. Un único valor a nivel de pregunta no podría
representar esa mezcla.

**Sobre el historial de cambios**: el estándar no incluye un registro de
cambios dentro del JSON (quién cambió qué campo y cuándo). Si necesitas esa
trazabilidad, versiona los paquetes en git — cada commit ya captura el
qué/cuándo/quién sin duplicar esa responsabilidad dentro del formato. Ver
"Extensiones futuras" si tu institución necesita un `historial` estructurado.

## Grupos de preguntas

Algunas preguntas no son independientes: comparten una situación o lectura
con otras (común en Sociales y Español), comparten un banco de opciones que
el estudiante ve y consume junto con varias preguntas a la vez (típico de
ejercicios de emparejamiento en pruebas de lengua extranjera), o son un
espacio en blanco dentro de un pasaje continuo, sin enunciado propio más
allá de "completa este espacio" (ejercicios de *cloze*). El array opcional
`grupos` en el paquete, y el campo opcional `grupo_id` en la pregunta,
existen para representar estos tres casos sin inventar contenido ni forzar
una pregunta a una forma que no le corresponde.

**Una pregunta miembro de un grupo no está pensada para renderizarse
suelta.** Un emparejamiento *es* una sola experiencia (varias descripciones
y un banco de palabras, mostrados a la vez); un espacio en blanco *es* parte
de un pasaje continuo. Una plataforma que quiera soportar estos tipos de
pregunta debe resolver `grupo_id` contra `paquete.grupos` antes de
mostrarlas; una plataforma que no los soporte aún debe **excluirlas**
(filtrar por `tipo_item`), no intentar mostrarlas incompletas.

Cada entrada de `grupos` tiene un `id` (único en el paquete) y un `tipo`
que determina su forma:

- **`contexto_compartido`**: `contexto` (bloques de texto/imagen/tabla) es
  la situación o lectura compartida. Las preguntas miembro siguen trayendo
  su propio `enunciado` y sus propias `opciones` (forma "estándar", sin
  `tipo_item`) — el grupo solo evita repetir el mismo párrafo en cada
  archivo, y le da a las herramientas (banco, visor, exportador) una forma
  de saber que varias preguntas van juntas.
- **`banco_opciones`**: `banco` es un array de `{ id, contenido, es_ejemplo?
  }` — el banco de palabras/opciones que las preguntas del grupo comparten
  y consumen. `es_ejemplo: true` marca la entrada usada como ejemplo
  resuelto, que nunca puede ser la respuesta real de una pregunta. Las
  preguntas miembro llevan `tipo_item: "miembro_banco_opciones"`: no tienen
  `opciones` propias, sino `respuesta_pool_id` (el `id` dentro de
  `grupos[].banco` que es la respuesta correcta) y su propia
  `justificacion`.
- **`texto_con_blancos`**: `contexto` es el pasaje compartido, con los
  espacios marcados inline en el propio texto (p. ej. `"...the
  (16)_______ word matters..."` — convención tipográfica; el estándar no
  interpreta el marcador). Las preguntas miembro llevan `tipo_item:
  "miembro_texto_con_blancos"`: no tienen `enunciado` propio (el pasaje del
  grupo es el único estímulo), sino `numero_blanco` (qué espacio llenan) y
  sus propias `opciones` (al menos 2, misma forma de siempre).

Cualquier grupo puede declarar `metadata_pedagogica` (los mismos 6 campos
que en una pregunta) para que las preguntas miembro que no traigan los
suyos propios los hereden — útil porque en ejercicios de lengua extranjera
la tabla de especificaciones suele redactarse una vez por bloque de
preguntas, no pregunta por pregunta. El valor efectivo de cada campo es "el
de la pregunta si lo trae, si no, el del grupo"; si ninguno de los dos lo
trae, es un error de validación. Un grupo también puede declarar
`procedencia_contenido`, `verificado_contenido` y `fuentes_contenido`
(campos planos, no el objeto de 3 buckets que usa una pregunta, porque un
grupo solo tiene "contenido", nunca `clasificacion` ni
`respuesta_correcta` propios) para trazar el origen del estímulo
compartido.

Para áreas de lengua extranjera, el campo opcional `nivel_mcer` en la
pregunta (`"Pre A1"` a `"C2"`) permite clasificar por nivel del Marco Común
Europeo de Referencia, independiente de (y compatible con) la metadata
pedagógica de 6 campos.

### Puntaje y peso

El campo opcional `valor` en la pregunta (número mayor que 0; ausente = 1)
es el peso de esa pregunta en la calificación total. El puntaje de un
paquete (o de un subconjunto que una plataforma decida calificar) es la
suma de `valor` (con 1 por defecto cuando está ausente) sobre esas
preguntas — nunca "un grupo cuenta como una sola pregunta". Un grupo de
emparejamiento de 5 miembros, cada uno con `valor` ausente, vale
naturalmente 5 puntos, igual que 5 preguntas sueltas de opción múltiple.

### Versión por pregunta

`version_estandar` (opcional, string SemVer) en la pregunta misma —
distinto del `version_estandar` que ya trae el **paquete**. Existe porque
un paquete describe la versión de *todo* el conjunto, pero un banco que
guarda una pregunta por archivo (como `banco-preguntas-icfes`) no siempre
envuelve cada archivo en un paquete: sin este campo, ese archivo suelto no
tiene ninguna forma de decir de qué versión del estándar depende.

El valor no es "con qué versión se escribió" sino **la versión mínima que
exige el conjunto de campos que la pregunta usa**. Tabla de referencia
(ver CHANGELOG.md para el detalle completo de cada versión):

| Si la pregunta usa... | Exige al menos |
|---|---|
| Solo los campos de v1.0.0 (metadata pedagógica, `contexto`/`enunciado`/`opciones`, exactamente 4 opciones) | `"1.0.0"` |
| `grado`, `prueba`, `procedencia`, `verificado`, `fuentes`, o `procedencia_justificacion`/`justificacion_verificada` en alguna opción | `"1.1.0"` |
| `grupo_id`, `tipo_item`, `nivel_mcer`, `valor`, o un número de opciones distinto de 4 | `"1.2.0"` |

Es opcional y su ausencia significa "versión no declarada" — igual que
`procedencia`/`verificado`/`fuentes`, **no** implica "asumir v1.0.0".
Cuando está presente, `validador/validar.js` sí comprueba que no sea menor
que la versión mínima real de los campos usados (independientemente de si
el número está bien formado como SemVer). Ver `docs/adopcion.md` para cómo
retrocompletar este campo en preguntas ya existentes.

## Invariantes

Validadas por `validador/validar.js`; un solo error rechaza el paquete
completo (todo-o-nada), reportando todos los problemas encontrados:

1. Cada pregunta con `opciones` (forma "estándar" o `miembro_texto_con_blancos`) tiene al menos 2, exactamente una marcada `es_correcta: true`. Una pregunta `miembro_banco_opciones` no tiene `opciones` propias; en su lugar, `respuesta_pool_id` debe existir en el `banco` de su grupo y no puede ser la entrada marcada `es_ejemplo`.
2. Toda opción trae `justificacion` no vacía — incluidas las incorrectas. Una pregunta `miembro_banco_opciones` trae su propia `justificacion` en vez de una por opción.
3. Los 6 campos de metadata pedagógica están presentes y no vacíos, ya sea en la pregunta o heredados de `grupo.metadata_pedagogica`.
4. Todo bloque `imagen` referencia un archivo presente en `imagenes/` dentro del paquete.
5. Todo bloque `tabla` tiene filas rectangulares: mismo número de columnas que `encabezados`.
6. `id` de pregunta único dentro del paquete; `id` de grupo único dentro del paquete.
7. `estandar` es exactamente `"preguntas-icfes"` y `version_estandar` sigue el patrón SemVer.
8. Todo archivo referenciado en `fuentes.*` (o `fuentes_contenido` de un grupo) está presente en `fuentes/` dentro del paquete.
9. `grupo_id` de una pregunta debe existir en `paquete.grupos`, y su `tipo_item` debe coincidir con el `tipo` de ese grupo (`contexto_compartido`→sin `tipo_item` o `"estandar"`, `banco_opciones`→`"miembro_banco_opciones"`, `texto_con_blancos`→`"miembro_texto_con_blancos"`).
10. `numero_blanco` es único dentro de cada grupo de tipo `texto_con_blancos` (se puede repetir entre grupos distintos).
11. `nivel_mcer` (si está presente) pertenece al catálogo MCER cerrado; `valor` (si está presente) es un número mayor que 0.
12. `version_estandar` de una pregunta (si está presente) sigue el patrón SemVer y no es menor que la versión mínima que exigen los campos que esa pregunta realmente usa (ver "Versión por pregunta" arriba).

## Empaquetado ZIP

```
paquete.zip
├── paquete.json
├── imagenes/
│   ├── votacion-ciudadana.png
│   └── cabildo-abierto.png
└── fuentes/
    ├── cuadernillo-epa-2024-grado11.pdf
    └── clave-oficial-epa-2024.pdf
```

- `paquete.json` es obligatorio.
- `imagenes/` es opcional si ningún bloque de tipo `imagen` se usa.
- `fuentes/` es opcional si ningún campo `fuentes` se usa.
- Extensiones admitidas: `.png`, `.jpg`, `.jpeg`, `.webp` en `imagenes/`; `.pdf` en `fuentes/`.
- Reglas de seguridad recomendadas (heredadas de la implementación probada en
  OpenTest): peso máximo razonable del ZIP completo, solo entradas sin cifrar
  almacenadas o con DEFLATE, sin rutas absolutas ni `..` ni enlaces simbólicos,
  sin nombres duplicados, sin carpetas fuera de `imagenes/` y `fuentes/`. Cada
  implementación decide sus propios límites numéricos; el estándar no los fija.

## Extensiones futuras (fuera de v1)

- Catálogo estructurado (`competencias`, `componentes`, `afirmaciones`,
  `evidencias` con `id` propio y descripción) para instituciones que quieran
  gobernanza centralizada del vocabulario, referenciado por `id` desde la
  pregunta en vez de texto libre repetido.
- Otros tipos de pregunta *standalone* (selección múltiple con múltiple
  respuesta, afirmación-razón) — distinto de "Grupos de preguntas" (v1.2.0):
  esto es sobre el formato de respuesta de una pregunta individual, no sobre
  relaciones entre preguntas.
- Nivel de dificultad (fuera del ya existente `nivel_mcer`, específico de
  lengua extranjera).
- Otros tipos de bloque de contenido (audio, fórmulas).
- `historial` estructurado por pregunta (registro de cambios con fecha,
  campo modificado y quién lo hizo), para instituciones que necesiten
  auditoría dentro del propio JSON en vez de depender del historial de git.

Cualquiera de estas ampliaciones es aditiva y no rompe paquetes v1 existentes,
salvo que se decida lo contrario explícitamente en el CHANGELOG.
