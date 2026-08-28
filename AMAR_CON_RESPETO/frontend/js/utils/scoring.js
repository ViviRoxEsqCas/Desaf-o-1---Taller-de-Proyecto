// utils/scoring.js
// Calcula las siete variables principales a partir de las respuestas (escala 1-5).
// No produce un puntaje global único: cada variable se mantiene separada.

function invertScale(value) {
  // Escala 1-5 invertida: 1<->5, 2<->4, 3<->3
  return 6 - value;
}

function normalize(value) {
  // Convierte una escala 1-5 a un porcentaje 0-100
  return Math.round(((value - 1) / 4) * 100);
}

/**
 * @param {Object} respuestas - objeto { P05: 4, P06: 3, ... } con valores numéricos 1-5
 * @returns {Object} variables normalizadas 0-100: { AUT, INF, PRE, LIM, IND, CON, CLA }
 */
export function calcularVariables(respuestas) {
  const num = (id) => Number(respuestas[id]);

  const AUT = (num("P05") + num("P06")) / 2;
  const INF = num("P09");
  const PRE = (num("P10") + num("P11")) / 2;
  const LIM = (num("P12") + num("P13") + num("P14")) / 3;
  const IND = (invertScale(num("P15")) + num("P16")) / 2;
  const CON = num("P19");
  const CLA = num("P20");

  return {
    AUT: normalize(AUT),
    INF: normalize(INF),
    PRE: normalize(PRE),
    LIM: normalize(LIM),
    IND: normalize(IND),
    CON: normalize(CON),
    CLA: normalize(CLA),
  };
}

/**
 * Traduce un valor 0-100 a un nivel legible. Algunas variables usan una
 * etiqueta distinta para el nivel bajo (ej. LIM -> "Por explorar").
 */
export function nivelDe(variable, valor) {
  const bajo = variable === "LIM" ? "Por explorar" : "Baja";
  if (valor <= 40) return bajo;
  if (valor <= 70) return "Moderada";
  return "Alta";
}

export const NOMBRES_VARIABLES = {
  AUT: "Autonomía",
  INF: "Influencia externa",
  PRE: "Presión",
  LIM: "Límites",
  IND: "Individualidad",
  CON: "Consecuencias",
  CLA: "Claridad",
};
