# Registro de cambios

Este proyecto sigue [SemVer](https://semver.org/lang/es/). Las versiones se
refieren al **estándar** (`version_estandar` dentro de un paquete), no
necesariamente al número de versión de npm.

## 1.4.0 — 2026-08-30

Aditiva: no rompe paquetes v1.3.0 existentes. No cambia ninguna forma del
schema (`texto` sigue siendo `string`) — es una convención de contenido
nueva, con su propia validación de referencia.

- Marcador `{{numero:<id-de-pregunta>}}`, permitido dentro de cualquier
  bloque `texto` (contexto/enunciado/opciones de una pregunta, o
  contexto/banco de un grupo): representa un número que depende de la
  posición en la que un estudiante concreto ve esa pregunta en su examen,
  no un valor fijo — nace del caso real de los pasajes `texto_con_blancos`,
  cuyos espacios marcados con el número absoluto de la pregunta en el
  cuadernillo original (`(16)`, `(17)`...) quedan mal en cuanto la misma
  pregunta se sirve en otro orden a otro estudiante.
- `validador/validar.js` comprueba que cada `id` referenciado exista en
  `paquete.preguntas` — una validación de referencia, igual que `grupo_id`
  o `respuesta_pool_id`. El estándar **no** define cómo se calcula el
  número real mostrado a un estudiante: eso es responsabilidad explícita
  de cada plataforma consumidora (ver `docs/adopcion.md`, "Numeración
  dinámica — requisito de integración") — es, por diseño, información de
  entrega, no contenido versionado.
- Sin escape para `{{` literal — no se consideró necesario para v1.

## 1.3.0 — 2026-08-30

Aditiva: no rompe paquetes v1.2.0 existentes.

- `version_estandar` (opcional, por **pregunta**, SemVer): además del
  `version_estandar` ya existente a nivel de paquete, cada pregunta puede
  declarar la versión mínima del estándar que exige el conjunto de campos
  que usa. Pensado sobre todo para bancos que guardan una pregunta por
  archivo fuera de cualquier paquete envolvente (el caso de este propio
  repo hermano `banco-preguntas-icfes`): sin este campo, un archivo suelto
  no tiene ninguna forma de autodescribirse.
- `validador/validar.js` ahora, cuando el campo está presente, comprueba
  que no sea menor que la versión que exigen los campos realmente usados
  (p. ej. una pregunta con `grupo_id` no puede declarar `"1.1.0"`) — evita
  que quede desactualizado silenciosamente si la pregunta se edita después
  y empieza a usar un campo más nuevo.
- Ausencia del campo (el caso de las ~118 preguntas del banco previas a
  esta versión) sigue siendo válida: "versión no declarada", no "v1.0.0
  asumido". Ver `docs/adopcion.md` para el criterio de qué versión asignar
  al retrocompletar preguntas existentes.

## 1.2.0 — 2026-08-30

Aditiva: no rompe paquetes v1.1.0 existentes. Ningún campo nuevo es
obligatorio y `tipo_item` ausente se comporta exactamente como antes.

- `grupos` (opcional, array a nivel de paquete): representa preguntas que
  comparten una situación/lectura (`tipo: "contexto_compartido"`), un banco
  de opciones que se consume entre varias preguntas
  (`tipo: "banco_opciones"`, ejercicios de emparejamiento), o un pasaje con
  espacios en blanco (`tipo: "texto_con_blancos"`, ejercicios de *cloze*).
- `grupo_id` y `tipo_item` (opcionales, por pregunta): a qué grupo
  pertenece una pregunta y qué forma estructural tiene
  (`"estandar"` por defecto, `"miembro_banco_opciones"`,
  `"miembro_texto_con_blancos"`). Una pregunta `miembro_banco_opciones` no
  trae `opciones` propias (trae `respuesta_pool_id` + `justificacion`); una
  pregunta `miembro_texto_con_blancos` no trae `enunciado` propio (trae
  `numero_blanco` + `opciones`).
- Un grupo puede declarar `metadata_pedagogica` (los 6 campos habituales)
  para que las preguntas miembro que no traigan los suyos los hereden.
- `nivel_mcer` (opcional, por pregunta): clasificación por nivel del Marco
  Común Europeo de Referencia (`"Pre A1"`…`"C2"`), para áreas de lengua
  extranjera que no usan Competencia/Componente de la misma forma.
- `valor` (opcional, por pregunta, número > 0, 1 por defecto): peso de la
  pregunta en la calificación total — necesario para que un grupo de N
  preguntas siga sumando N puntos, no 1.
- **`opciones` deja de exigir exactamente 4**: ahora exige al menos 2, sin
  tope superior. Ningún paquete existente con 4 opciones se ve afectado.
  **Caveat para integradores**: esto valida correctamente, pero una
  plataforma cuya UI asuma "siempre 4, A-D" debe generalizar esa suposición
  antes de cargar contenido con un número distinto de opciones — ver
  `docs/adopcion.md`.
- `ejemplos/paquete-grupos-ejemplo/`: paquete de ejemplo con los 3 tipos de
  grupo, usando contenido real de un cuadernillo de Inglés grado 9.

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
