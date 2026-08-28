# Registro de cambios

Este proyecto sigue [SemVer](https://semver.org/lang/es/). Las versiones se
refieren al **estándar** (`version_estandar` dentro de un paquete), no
necesariamente al número de versión de npm.

## 1.0.0 — 2026-08-28

Primera versión publicada.

- Modelo de pregunta con metadata pedagógica obligatoria: `competencia`,
  `componente`, `afirmacion`, `evidencia`, `estandar_asociado`, `que_evalua`.
- Contenido rico por bloques (`texto`, `imagen`, `tabla`) en `contexto`,
  `enunciado` y el `contenido` de cada opción.
- Justificación individual y obligatoria por cada una de las 4 opciones,
  incluidas las incorrectas.
- Empaquetado en ZIP (`paquete.json` + `imagenes/`), reutilizando las reglas de
  seguridad ya probadas en OpenTest (límites de tamaño, rutas seguras,
  extensiones admitidas).
- JSON Schema (`schema/v1/`) y validador de referencia sin dependencias
  (`validador/validar.js`).
