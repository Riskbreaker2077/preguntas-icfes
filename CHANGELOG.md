# Registro de cambios

Este proyecto sigue [SemVer](https://semver.org/lang/es/). Las versiones se
refieren al **estándar** (`version_estandar` dentro de un paquete), no
necesariamente al número de versión de npm.

## 1.1.0 — 2026-08-29

Aditiva: no rompe paquetes v1.0.0 existentes.

- `grado` y `prueba` (enum cerrado, opcionales) por pregunta, para filtrar por
  grado escolar y por programa de evaluación de origen (Saber 11, Evaluar
  para Avanzar).
- `procedencia` por pregunta (opcional): origen de `contenido`,
  `clasificacion` y `respuesta_correcta` — `"oficial"`, `"extraido_oficial"`
  o `"ia_generada"`.
- `verificado` por pregunta (opcional): si un humano confirmó cada bloque,
  independientemente de su procedencia.
- `fuentes` por pregunta (opcional): PDF de origen de cada bloque, dentro de
  la nueva carpeta `fuentes/` del paquete ZIP.
- `procedencia_justificacion` y `justificacion_verificada` por opción
  (opcionales), para el caso en que solo la justificación de una opción tenga
  respaldo oficial y las demás sigan siendo generadas por IA.
- Ausencia de estos campos se documenta explícitamente como "origen no
  declarado" — no implica ni confianza ni desconfianza por defecto.

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
