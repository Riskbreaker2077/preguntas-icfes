# Especificación · Preguntas ICFES v1.1.0

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

Exactamente 4 opciones por pregunta. Cada una:

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

## Invariantes

Validadas por `validador/validar.js`; un solo error rechaza el paquete
completo (todo-o-nada), reportando todos los problemas encontrados:

1. Cada pregunta tiene exactamente 4 opciones.
2. Exactamente una opción por pregunta tiene `es_correcta: true`.
3. Toda opción trae `justificacion` no vacía — incluidas las incorrectas.
4. Los 6 campos de metadata pedagógica están presentes y no vacíos.
5. Todo bloque `imagen` referencia un archivo presente en `imagenes/` dentro del paquete.
6. Todo bloque `tabla` tiene filas rectangulares: mismo número de columnas que `encabezados`.
7. `id` de pregunta único dentro del paquete.
8. `estandar` es exactamente `"preguntas-icfes"` y `version_estandar` sigue el patrón SemVer.
9. Todo archivo referenciado en `fuentes.*` está presente en `fuentes/` dentro del paquete.

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
- Otros tipos de pregunta (selección múltiple con múltiple respuesta,
  afirmación-razón).
- Nivel de dificultad.
- Otros tipos de bloque de contenido (audio, fórmulas).
- `historial` estructurado por pregunta (registro de cambios con fecha,
  campo modificado y quién lo hizo), para instituciones que necesiten
  auditoría dentro del propio JSON en vez de depender del historial de git.

Cualquiera de estas ampliaciones es aditiva y no rompe paquetes v1 existentes,
salvo que se decida lo contrario explícitamente en el CHANGELOG.
