import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validarPaquete } from "./validar.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaEjemplo = path.join(dirname, "..", "ejemplos", "paquete-ejemplo", "paquete.json");

function cargarPaqueteEjemplo() {
  return JSON.parse(readFileSync(rutaEjemplo, "utf-8"));
}

function preguntaValidaBase(id = "p-1") {
  return {
    id,
    competencia: "Comp",
    componente: "Componente",
    afirmacion: "Afirmación",
    evidencia: "Evidencia",
    estandar_asociado: "Estándar",
    que_evalua: "Qué evalúa",
    contexto: [],
    enunciado: [{ tipo: "texto", texto: "¿Enunciado?" }],
    opciones: [
      { id: "A", contenido: [{ tipo: "texto", texto: "Opción A" }], es_correcta: true, justificacion: "Correcta porque..." },
      { id: "B", contenido: [{ tipo: "texto", texto: "Opción B" }], es_correcta: false, justificacion: "Incorrecta porque..." },
      { id: "C", contenido: [{ tipo: "texto", texto: "Opción C" }], es_correcta: false, justificacion: "Incorrecta porque..." },
      { id: "D", contenido: [{ tipo: "texto", texto: "Opción D" }], es_correcta: false, justificacion: "Incorrecta porque..." },
    ],
  };
}

function paqueteValidoBase() {
  return {
    estandar: "preguntas-icfes",
    version_estandar: "1.0.0",
    nombre: "Paquete de prueba",
    preguntas: [preguntaValidaBase()],
  };
}

test("el paquete de ejemplo del repo es válido", () => {
  const paquete = cargarPaqueteEjemplo();
  const { valido, errores } = validarPaquete(paquete, {
    imagenesDisponibles: ["grafico-1.png", "mapa-2.png"],
    fuentesDisponibles: ["cuadernillo-epa-2024-grado11.pdf", "clave-oficial-epa-2024.pdf"],
  });
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("un paquete mínimo bien formado es válido", () => {
  const { valido, errores } = validarPaquete(paqueteValidoBase());
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza una pregunta con menos de 2 opciones", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones = paquete.preguntas[0].opciones.slice(0, 1);
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "opciones" && /al menos 2/.test(e.mensaje)));
});

test("acepta una pregunta con 3 opciones", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones = paquete.preguntas[0].opciones.slice(0, 3);
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("acepta una pregunta con más de 4 opciones", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones.push({
    id: "E",
    contenido: [{ tipo: "texto", texto: "Opción E" }],
    es_correcta: false,
    justificacion: "Incorrecta porque...",
  });
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza una pregunta con dos opciones correctas", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones[1].es_correcta = true;
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "opciones" && /exactamente 1/.test(e.mensaje)));
});

test("rechaza una pregunta con cero opciones correctas", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones[0].es_correcta = false;
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "opciones" && /exactamente 1/.test(e.mensaje)));
});

test("rechaza una opción sin justificacion", () => {
  const paquete = paqueteValidoBase();
  delete paquete.preguntas[0].opciones[1].justificacion;
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /justificacion/.test(e.mensaje)));
});

test("rechaza una opción con justificacion vacía", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones[2].justificacion = "   ";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /justificacion/.test(e.mensaje)));
});

for (const campo of ["competencia", "componente", "afirmacion", "evidencia", "estandar_asociado", "que_evalua"]) {
  test(`rechaza una pregunta sin "${campo}"`, () => {
    const paquete = paqueteValidoBase();
    delete paquete.preguntas[0][campo];
    const { valido, errores } = validarPaquete(paquete);
    assert.equal(valido, false);
    assert.ok(errores.some((e) => e.campo === campo));
  });
}

test("rechaza ids de pregunta duplicados", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas.push(preguntaValidaBase("p-1"));
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /repetido/.test(e.mensaje)));
});

test("rechaza una tabla con filas no rectangulares", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].contexto = [
    { tipo: "tabla", encabezados: ["A", "B"], filas: [["1", "2"], ["solo-una"]] },
  ];
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /rectangulares/.test(e.mensaje)));
});

test("rechaza una imagen que no está en imagenesDisponibles", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].contexto = [{ tipo: "imagen", archivo: "no-existe.png" }];
  const { valido, errores } = validarPaquete(paquete, { imagenesDisponibles: [] });
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /no-existe\.png/.test(e.mensaje)));
});

test("no valida imágenes si no se pasa imagenesDisponibles", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].contexto = [{ tipo: "imagen", archivo: "cualquier-cosa.png" }];
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza una fuente que no está en fuentesDisponibles", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].fuentes = { contenido: "no-existe.pdf" };
  const { valido, errores } = validarPaquete(paquete, { fuentesDisponibles: [] });
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /no-existe\.pdf/.test(e.mensaje)));
});

test("no valida fuentes si no se pasa fuentesDisponibles", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].fuentes = { contenido: "cualquier-cosa.pdf" };
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("acepta procedencia, verificado, grado, prueba y procedencia_justificacion", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].grado = "9";
  paquete.preguntas[0].prueba = "evaluar_para_avanzar";
  paquete.preguntas[0].procedencia = {
    contenido: "extraido_oficial",
    clasificacion: "ia_generada",
    respuesta_correcta: "oficial",
  };
  paquete.preguntas[0].verificado = { respuesta_correcta: true };
  paquete.preguntas[0].opciones[0].procedencia_justificacion = "oficial";
  paquete.preguntas[0].opciones[0].justificacion_verificada = true;
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza un paquete sin preguntas", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas = [];
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "preguntas"));
});

test("rechaza un estandar distinto de preguntas-icfes", () => {
  const paquete = paqueteValidoBase();
  paquete.estandar = "otra-cosa";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "estandar"));
});

test("rechaza una version_estandar que no sigue SemVer", () => {
  const paquete = paqueteValidoBase();
  paquete.version_estandar = "v1";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "version_estandar"));
});

// ---------------------------------------------------------------------------
// Grupos de preguntas (v1.2.0)
// ---------------------------------------------------------------------------

const METADATA_COMPLETA = {
  competencia: "Comp",
  componente: "Componente",
  afirmacion: "Afirmación",
  evidencia: "Evidencia",
  estandar_asociado: "Estándar",
  que_evalua: "Qué evalúa",
};

function grupoContextoCompartidoBase(id = "g-contexto-1") {
  return {
    id,
    tipo: "contexto_compartido",
    contexto: [{ tipo: "texto", texto: "Situación compartida." }],
  };
}

function grupoBancoOpcionesBase(id = "g-banco-1") {
  return {
    id,
    tipo: "banco_opciones",
    metadata_pedagogica: METADATA_COMPLETA,
    banco: [
      { id: "A", contenido: [{ tipo: "texto", texto: "palabra A" }] },
      { id: "B", contenido: [{ tipo: "texto", texto: "palabra B" }] },
      { id: "C", contenido: [{ tipo: "texto", texto: "palabra C" }], es_ejemplo: true },
    ],
  };
}

function grupoTextoConBlancosBase(id = "g-blancos-1") {
  return {
    id,
    tipo: "texto_con_blancos",
    metadata_pedagogica: METADATA_COMPLETA,
    contexto: [{ tipo: "texto", texto: "Pasaje con un (1)___ blanco." }],
  };
}

function preguntaMiembroBancoOpcionesBase(id = "m-1", grupoId = "g-banco-1") {
  return {
    id,
    grupo_id: grupoId,
    tipo_item: "miembro_banco_opciones",
    contexto: [],
    enunciado: [{ tipo: "texto", texto: "Descripción a emparejar." }],
    respuesta_pool_id: "A",
    justificacion: "Es la correcta porque...",
  };
}

function preguntaMiembroTextoConBlancosBase(id = "b-1", grupoId = "g-blancos-1", numeroBlanco = 1) {
  return {
    id,
    grupo_id: grupoId,
    tipo_item: "miembro_texto_con_blancos",
    contexto: [],
    numero_blanco: numeroBlanco,
    opciones: [
      { id: "A", contenido: [{ tipo: "texto", texto: "opción A" }], es_correcta: true, justificacion: "Correcta porque..." },
      { id: "B", contenido: [{ tipo: "texto", texto: "opción B" }], es_correcta: false, justificacion: "Incorrecta porque..." },
      { id: "C", contenido: [{ tipo: "texto", texto: "opción C" }], es_correcta: false, justificacion: "Incorrecta porque..." },
    ],
  };
}

test("acepta una pregunta estandar que hereda contexto de un grupo contexto_compartido", () => {
  const pregunta = preguntaValidaBase("cs-1");
  pregunta.grupo_id = "g-contexto-1";
  pregunta.contexto = [];
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoContextoCompartidoBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test('rechaza "grupo_id" que no existe en paquete.grupos', () => {
  const pregunta = preguntaValidaBase("cs-1");
  pregunta.grupo_id = "no-existe";
  const { valido, errores } = validarPaquete({ ...paqueteValidoBase(), preguntas: [pregunta] });
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "grupo_id" && /no existe/.test(e.mensaje)));
});

test("rechaza tipo_item que no coincide con el tipo del grupo referenciado", () => {
  const pregunta = preguntaValidaBase("cs-1");
  pregunta.grupo_id = "g-banco-1";
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoBancoOpcionesBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "tipo_item" && /miembro_banco_opciones/.test(e.mensaje)));
});

test("acepta una pregunta miembro_banco_opciones válida, heredando metadata del grupo", () => {
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoBancoOpcionesBase()],
    preguntas: [preguntaMiembroBancoOpcionesBase()],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza respuesta_pool_id que no existe en el banco del grupo", () => {
  const pregunta = preguntaMiembroBancoOpcionesBase();
  pregunta.respuesta_pool_id = "Z";
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoBancoOpcionesBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "respuesta_pool_id" && /no existe en el banco/.test(e.mensaje)));
});

test("rechaza respuesta_pool_id que apunta al ejemplo resuelto del grupo", () => {
  const pregunta = preguntaMiembroBancoOpcionesBase();
  pregunta.respuesta_pool_id = "C"; // es_ejemplo: true en grupoBancoOpcionesBase
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoBancoOpcionesBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "respuesta_pool_id" && /ejemplo resuelto/.test(e.mensaje)));
});

test("rechaza opciones propias en una pregunta miembro_banco_opciones", () => {
  const pregunta = preguntaMiembroBancoOpcionesBase();
  pregunta.opciones = [
    { id: "A", contenido: [{ tipo: "texto", texto: "x" }], es_correcta: true, justificacion: "x" },
  ];
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoBancoOpcionesBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "opciones" && /no debe traer/.test(e.mensaje)));
});

test("acepta una pregunta miembro_texto_con_blancos válida, heredando metadata del grupo", () => {
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoTextoConBlancosBase()],
    preguntas: [preguntaMiembroTextoConBlancosBase()],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza enunciado propio en una pregunta miembro_texto_con_blancos", () => {
  const pregunta = preguntaMiembroTextoConBlancosBase();
  pregunta.enunciado = [{ tipo: "texto", texto: "no debería estar aquí" }];
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoTextoConBlancosBase()],
    preguntas: [pregunta],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "enunciado" && /no debe traer/.test(e.mensaje)));
});

test("rechaza numero_blanco duplicado dentro del mismo grupo", () => {
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoTextoConBlancosBase()],
    preguntas: [
      preguntaMiembroTextoConBlancosBase("b-1", "g-blancos-1", 1),
      preguntaMiembroTextoConBlancosBase("b-2", "g-blancos-1", 1),
    ],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "numero_blanco" && /repetido/.test(e.mensaje)));
});

test("acepta el mismo numero_blanco en dos grupos distintos", () => {
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoTextoConBlancosBase("g-blancos-1"), grupoTextoConBlancosBase("g-blancos-2")],
    preguntas: [
      preguntaMiembroTextoConBlancosBase("b-1", "g-blancos-1", 1),
      preguntaMiembroTextoConBlancosBase("b-2", "g-blancos-2", 1),
    ],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza id de grupo duplicado", () => {
  const paquete = {
    estandar: "preguntas-icfes",
    version_estandar: "1.2.0",
    nombre: "Paquete de prueba",
    grupos: [grupoContextoCompartidoBase("g-1"), grupoContextoCompartidoBase("g-1")],
    preguntas: [preguntaValidaBase("p-1")],
  };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => /id de grupo .* repetido/.test(e.mensaje)));
});

test("rechaza nivel_mcer no reconocido", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].nivel_mcer = "Z9";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "nivel_mcer"));
});

test("acepta un nivel_mcer válido", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].nivel_mcer = "A2";
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza valor menor o igual a 0", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].valor = 0;
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "valor"));
});

test("acepta un valor positivo, y su ausencia no rompe nada", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].valor = 2.5;
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);

  const sinValor = paqueteValidoBase();
  assert.equal(sinValor.preguntas[0].valor, undefined);
  const resultado = validarPaquete(sinValor);
  assert.equal(resultado.valido, true);
});

test("rechaza version_estandar de pregunta que no sigue SemVer", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].version_estandar = "v1.2";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "version_estandar"));
});

test("acepta version_estandar de pregunta que sí alcanza para los campos que usa", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].version_estandar = "1.0.0";
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test('rechaza version_estandar "1.0.0" en una pregunta que usa "fuentes" (exige 1.1.0)', () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].version_estandar = "1.0.0";
  paquete.preguntas[0].fuentes = { contenido: "cuadernillo.pdf" };
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "version_estandar" && /1\.1\.0/.test(e.mensaje)));
});

test('rechaza version_estandar "1.1.0" en una pregunta miembro de un grupo (exige 1.2.0)', () => {
  const paquete = paqueteValidoBase();
  paquete.grupos = [grupoContextoCompartidoBase()];
  paquete.preguntas[0].grupo_id = "g-contexto-1";
  paquete.preguntas[0].version_estandar = "1.1.0";
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "version_estandar" && /1\.2\.0/.test(e.mensaje)));
});

test('rechaza version_estandar "1.0.0" en una pregunta con 3 opciones (exige 1.2.0)', () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].version_estandar = "1.0.0";
  paquete.preguntas[0].opciones = paquete.preguntas[0].opciones.slice(0, 3);
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "version_estandar" && /1\.2\.0/.test(e.mensaje)));
});

test("acepta version_estandar ausente en cualquier pregunta, vieja o nueva", () => {
  const paquete = paqueteValidoBase();
  assert.equal(paquete.preguntas[0].version_estandar, undefined);
  const { valido, errores } = validarPaquete(paquete);
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("el paquete de ejemplo de grupos del repo es válido", () => {
  const rutaEjemploGrupos = path.join(dirname, "..", "ejemplos", "paquete-grupos-ejemplo", "paquete.json");
  const paquete = JSON.parse(readFileSync(rutaEjemploGrupos, "utf-8"));
  const { valido, errores } = validarPaquete(paquete, { imagenesDisponibles: [], fuentesDisponibles: [] });
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});
