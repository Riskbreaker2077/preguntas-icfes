<div align="center">

# Preguntas ICFES

**Estándar abierto para empaquetar preguntas de selección múltiple tipo ICFES**

[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)
[![Estándar](https://img.shields.io/badge/estándar-v1.4.0-6e40c9.svg)](CHANGELOG.md)
[![Sin dependencias](https://img.shields.io/badge/runtime-cero%20dependencias-2e7d32.svg)](validador/validar.js)

[Sitio](https://riskbreaker2077.github.io/preguntas-icfes/) ·
[Especificación](docs/especificacion.md) ·
[Guía de adopción](docs/adopcion.md) ·
[Ejemplo](ejemplos/paquete-ejemplo/paquete.json)

</div>

---

Un formato abierto y neutral para preguntas de selección múltiple con la
metadata pedagógica que usan las pruebas tipo ICFES (Colombia): **Competencia,
Componente, Afirmación, Evidencia** y **Estándar Asociado**, más contenido rico
(texto, imagen o tabla, combinables) en el contexto, el enunciado y cada
opción, con **justificación individual** por cada una de las cuatro opciones.

No es un producto ni una aplicación: es un **contrato de datos**. Cualquier
proyecto que cargue, muestre o califique preguntas de este tipo puede
adoptarlo para dejar de inventar su propio formato y mover bancos de
preguntas entre plataformas sin reescribirlos.

## Por qué existe

Nació de dos proyectos reales que manejan preguntas de este tipo cada uno a
su manera, sin comunicarse entre sí:

| Proyecto | Qué tenía | Qué le faltaba |
|---|---|---|
| **OpenTest** — evaluación de aula local | Modelo simple: texto plano, una sola explicación general | Metadata pedagógica, contenido rico, justificación por opción |
| **portal-estudiantes** — portal web de resultados | Retroalimentación e imagen por opción, un campo `competencia` | Enum cerrado solo para Sociales; sin Afirmación, Evidencia, Componente ni Estándar Asociado |

Este repo define el formato que ambos —y cualquier proyecto futuro— pueden
adoptar cuando decidan migrar, cada uno a su propio ritmo. Aquí solo se
define y se valida el formato.

## El modelo en breve

```json
{
  "id": "pc-001",
  "competencia": "Pensamiento social",
  "componente": "Sujeto, sociedad y estado",
  "afirmacion": "Reconoce mecanismos de participación democrática",
  "evidencia": "Identifica el mecanismo adecuado según el caso planteado",
  "estandar_asociado": "Comprendo que el ejercicio político resulta de decisiones de individuos y grupos",
  "que_evalua": "Diferenciar mecanismos de participación ciudadana según el caso.",
  "contexto": [{ "tipo": "texto", "texto": "La Constitución de 1991 fortaleció..." }],
  "enunciado": [{ "tipo": "texto", "texto": "¿Cuál conjunto contiene únicamente mecanismos..." }],
  "opciones": [
    { "id": "A", "contenido": [{ "tipo": "texto", "texto": "Voto, referendo, cabildo abierto..." }],
      "es_correcta": true, "justificacion": "Correcta: el artículo 103 los enumera exactamente." },
    { "id": "B", "contenido": [{ "tipo": "texto", "texto": "Tutela, voto, acción popular..." }],
      "es_correcta": false, "justificacion": "Incorrecta: la tutela protege derechos, no es participación directa." }
  ]
}
```

Cada bloque de contenido (`contexto`, `enunciado`, `contenido` de una opción)
es un array de `{ tipo: "texto" | "imagen" | "tabla", ... }`, así que una
misma pregunta puede combinar un párrafo, una imagen y una tabla en el orden
que haga falta. Especificación completa: [`docs/especificacion.md`](docs/especificacion.md).

## Qué contiene el repo

| Ruta | Qué es |
|---|---|
| `schema/v1/` | JSON Schema (draft 2020-12) del paquete y de una pregunta |
| `docs/especificacion.md` | La especificación completa: campos, bloques de contenido, invariantes, empaquetado ZIP |
| `docs/adopcion.md` | Cómo mapearía cada proyecto existente (OpenTest, portal-estudiantes) su modelo actual a este estándar |
| `ejemplos/paquete-ejemplo/` | Un paquete válido con los tres tipos de bloque de contenido |
| `validador/validar.js` | Validador de referencia en JavaScript puro (ES modules, **cero dependencias**): se copia directo en cualquier proyecto, incluso uno sin `npm install` |
| `docs/index.html` | La página de [`riskbreaker2077.github.io/preguntas-icfes`](https://riskbreaker2077.github.io/preguntas-icfes/) |

## Uso rápido

```js
import { validarPaquete } from "./validador/validar.js";
import { readFileSync } from "node:fs";

const paquete = JSON.parse(readFileSync("mi-paquete.json", "utf-8"));
const { valido, errores } = validarPaquete(paquete);
if (!valido) {
  for (const e of errores) console.error(e.mensaje);
}
```

```bash
npm test   # corre validador/validar.test.js contra el paquete de ejemplo
```

## Invariantes que valida

1. Al menos 2 opciones por pregunta, exactamente 1 correcta (las preguntas
   miembro de un grupo de emparejamiento no tienen opciones propias, ver
   "Grupos de preguntas" en la especificación).
2. Cada opción trae su propia justificación — incluidas las incorrectas.
3. Los 6 campos de metadata pedagógica son obligatorios y no vacíos, propios
   o heredados de un grupo.
4. Toda imagen referenciada existe dentro del paquete.
5. Toda tabla tiene filas rectangulares.
6. Cada `id` de pregunta y cada `id` de grupo son únicos dentro del paquete.
7. `version_estandar`, tanto de paquete como de pregunta (si esta última lo
   declara), sigue SemVer y no es menor que lo que exigen los campos
   realmente usados.
8. Todo marcador `{{numero:ID}}` en un bloque de texto referencia un `id`
   que existe en `paquete.preguntas` — ver "Numeración dinámica" en la
   especificación.

## Versionado

El estándar se versiona con [SemVer](https://semver.org/lang/es/),
independiente de la versión de este paquete npm. Un paquete de preguntas
declara la versión que sigue en `version_estandar`. Cambios incompatibles
suben una carpeta nueva (`schema/v2/`, etc.); `schema/v1/` no cambia una vez
publicado. Historial completo en [`CHANGELOG.md`](CHANGELOG.md).

## Licencia

[MIT](LICENSE).
