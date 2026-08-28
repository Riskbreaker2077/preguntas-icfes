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
  });
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("un paquete mínimo bien formado es válido", () => {
  const { valido, errores } = validarPaquete(paqueteValidoBase());
  assert.deepEqual(errores, []);
  assert.equal(valido, true);
});

test("rechaza una pregunta con menos de 4 opciones", () => {
  const paquete = paqueteValidoBase();
  paquete.preguntas[0].opciones = paquete.preguntas[0].opciones.slice(0, 3);
  const { valido, errores } = validarPaquete(paquete);
  assert.equal(valido, false);
  assert.ok(errores.some((e) => e.campo === "opciones" && /exactamente 4/.test(e.mensaje)));
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
