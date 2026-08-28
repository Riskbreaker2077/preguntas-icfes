# Preguntas ICFES — estándar abierto de paquetes de preguntas

Un formato abierto y neutral para empaquetar preguntas de selección múltiple con
la metadata pedagógica que usan las pruebas tipo ICFES (Colombia): Competencia,
Componente, Afirmación, Evidencia y Estándar Asociado, además de contenido rico
(texto, imagen o tabla, y combinaciones) en el contexto, el enunciado y cada
opción, con justificación individual por opción.

No es un producto ni una aplicación: es un **contrato de datos**. Cualquier
proyecto que cargue, muestre o califique preguntas de este tipo puede adoptarlo
para dejar de inventar su propio formato y para poder mover bancos de preguntas
entre plataformas sin reescribirlos.

## Por qué existe

Nació de dos proyectos reales que manejan preguntas de este tipo cada uno a su
manera:

- **OpenTest** — evaluación de aula local. Su formato actual (`contexto` y
  `enunciado` como texto plano, una sola `explicacion` general, sin metadata de
  competencias) es más simple que lo que este estándar define.
- **portal-estudiantes** — portal web de resultados. Ya tiene retroalimentación
  por opción e imagen por opción, y un campo `competencia`, pero como enum
  cerrado solo para el área de Ciencias Sociales, sin Afirmación, Evidencia,
  Componente ni Estándar Asociado.

Ninguno de los dos se comunica con el otro hoy. Este repo define el formato que
ambos —y cualquier proyecto futuro— pueden adoptar cuando decidan migrar. La
migración de cada proyecto es trabajo suyo, en su propio ritmo; este repo solo
define y valida el formato.

## Qué contiene

| Ruta | Qué es |
|---|---|
| `schema/v1/` | JSON Schema (draft 2020-12) del paquete y de una pregunta |
| `docs/especificacion.md` | La especificación completa en prosa: campos, bloques de contenido, invariantes, empaquetado ZIP |
| `docs/adopcion.md` | Cómo mapearía cada proyecto existente su modelo actual a este estándar |
| `ejemplos/paquete-ejemplo/` | Un paquete de ejemplo válido, con los tres tipos de bloque de contenido |
| `validador/validar.js` | Validador de referencia en JavaScript puro (ES modules, cero dependencias): se puede copiar directo en cualquier proyecto, incluso uno sin `npm install` |

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

## Versionado

El estándar se versiona con SemVer, independiente de la versión de este
paquete npm. Un paquete de preguntas declara la versión del estándar que sigue
en su campo `version_estandar`. Cambios que rompen compatibilidad hacia atrás
suben la carpeta `schema/v2/`, etc.; `schema/v1/` no cambia una vez publicado.

## Licencia

MIT.
