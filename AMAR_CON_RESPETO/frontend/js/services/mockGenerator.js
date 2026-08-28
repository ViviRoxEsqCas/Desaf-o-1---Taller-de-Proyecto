// services/mockGenerator.js
// Genera una reflexión de demostración usando ÚNICAMENTE la información local
// (situación, decisión, variables, patrones). No usa ninguna API externa.
// Se usa cuando CONFIG.AI_MODE === "mock".
//
// El objetivo es que el texto se sienta contextualizado y distinto para cada
// usuario, no una frase genérica idéntica para todos.

import { NOMBRES_VARIABLES, nivelDe } from "../utils/scoring.js";
import { frasesAleatoria } from "../data/frases.js";

function primeraFrase(texto, maxLen = 90) {
  if (!texto) return "";
  const limpio = texto.trim();
  return limpio.length > maxLen ? limpio.slice(0, maxLen).trim() + "..." : limpio;
}

export function generarReflexionMock(contexto) {
  const { situacion, decision, deseo_personal, variables, patrones, emociones, safety } = contexto;

  const nivelAUT = nivelDe("AUT", variables.AUT);
  const nivelINF = nivelDe("INF", variables.INF);
  const nivelPRE = nivelDe("PRE", variables.PRE);
  const nivelCLA = nivelDe("CLA", variables.CLA);

  const resumen = `Nos contaste sobre una situación relacionada con "${primeraFrase(
    situacion,
    60
  )}" y la decisión que estás considerando: "${primeraFrase(decision, 60)}".`;

  const aspectos_destacados = [];
  if (nivelAUT !== "Alta") {
    aspectos_destacados.push(
      "Has identificado una diferencia entre lo que quieres y lo que otras personas esperan de ti."
    );
  } else {
    aspectos_destacados.push(
      "Tu decisión parece estar bastante conectada con lo que tú realmente quieres."
    );
  }
  if (nivelINF === "Alta") {
    aspectos_destacados.push("Las opiniones de otras personas tienen un peso importante en cómo estás pensando esta decisión.");
  }
  if (nivelPRE === "Alta") {
    aspectos_destacados.push("Percibes una presión considerable en torno a esta situación.");
  }
  if (emociones && emociones.length > 0) {
    aspectos_destacados.push(`Mencionaste sentir ${emociones.slice(0, 3).join(", ").toLowerCase()}, lo cual forma parte importante de esta reflexión.`);
  }

  const parrafos = [];
  parrafos.push(
    `Te estamos escuchando: nos contaste sobre "${primeraFrase(situacion, 80)}", y que la decisión que tienes en mente es "${primeraFrase(
      decision,
      80
    )}".`
  );

  if (deseo_personal) {
    parrafos.push(
      `Mencionaste que lo que realmente quieres tiene que ver con "${primeraFrase(deseo_personal, 90)}". Vale la pena que esa parte de ti siga presente mientras decides.`
    );
  }

  patrones.forEach((p) => parrafos.push(p));

  if (nivelCLA !== "Alta") {
    parrafos.push(
      "Parece que todavía hay espacio para seguir aclarando algunos aspectos de esta decisión, y eso es completamente normal en un proceso como este."
    );
  }

  parrafos.push(
    "Esta reflexión no busca decirte qué hacer, sino ayudarte a mirar con más claridad lo que ya está presente en tus propias respuestas."
  );

  const reflexion = parrafos.join(" ");

  const preguntas_orientadoras = [
    "¿Qué elegirías si no existiera la presión de otras personas?",
    "¿Qué límite consideras importante conservar en esta situación?",
    "¿Qué parte de esta decisión nace realmente de ti?",
  ];
  if (nivelCLA !== "Alta") {
    preguntas_orientadoras.push("¿Qué información o conversación te ayudaría a sentir más claridad?");
  }

  const orientacion_seguridad = safety && safety.activa
    ? "Algunas de tus respuestas mencionan elementos que pueden estar relacionados con presión extrema, control o miedo por tu seguridad. Si sientes que tu bienestar o integridad están en riesgo, te recomendamos hablar con una persona de confianza o buscar apoyo especializado (un adulto de confianza, un centro de apoyo psicológico o una línea de ayuda local). No estás obligado/a a resolver esto en soledad."
    : null;

  return {
    resumen,
    aspectos_destacados,
    reflexion,
    preguntas_orientadoras: preguntas_orientadoras.slice(0, 4),
    orientacion_seguridad,
    frase_consuelo: frasesAleatoria(),
  };
}
