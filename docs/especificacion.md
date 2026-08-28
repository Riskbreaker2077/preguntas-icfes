# Especificación · Preguntas ICFES v1.0.0

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

## Empaquetado ZIP

```
paquete.zip
├── paquete.json
└── imagenes/
    ├── votacion-ciudadana.png
    └── cabildo-abierto.png
```

- `paquete.json` es obligatorio.
- `imagenes/` es opcional si ningún bloque de tipo `imagen` se usa.
- Extensiones admitidas: `.png`, `.jpg`, `.jpeg`, `.webp`.
- Reglas de seguridad recomendadas (heredadas de la implementación probada en
  OpenTest): peso máximo razonable del ZIP completo, solo entradas sin cifrar
  almacenadas o con DEFLATE, sin rutas absolutas ni `..` ni enlaces simbólicos,
  sin nombres duplicados, sin carpetas fuera de `imagenes/`. Cada implementación
  decide sus propios límites numéricos; el estándar no los fija.

## Extensiones futuras (fuera de v1)

- Catálogo estructurado (`competencias`, `componentes`, `afirmaciones`,
  `evidencias` con `id` propio y descripción) para instituciones que quieran
  gobernanza centralizada del vocabulario, referenciado por `id` desde la
  pregunta en vez de texto libre repetido.
- Otros tipos de pregunta (selección múltiple con múltiple respuesta,
  afirmación-razón).
- Nivel de dificultad.
- Otros tipos de bloque de contenido (audio, fórmulas).

Cualquiera de estas ampliaciones es aditiva y no rompe paquetes v1 existentes,
salvo que se decida lo contrario explícitamente en el CHANGELOG.
