// utils/patterns.js
// Reglas independientes que detectan patrones a partir de las variables (0-100).
// Estos patrones se envían como contexto adicional a la IA (real o mock).

const ALTO = 70;
const BAJO = 40;

export function detectarPatrones(variables) {
  const { AUT, INF, PRE, LIM, IND, CON, CLA } = variables;
  const patrones = [];

  if (PRE >= ALTO && AUT <= BAJO) {
    patrones.push(
      "Has señalado una percepción importante de presión y también dificultades para sentir que la decisión responde completamente a lo que quieres."
    );
  }

  if (INF >= ALTO && PRE <= BAJO) {
    patrones.push(
      "Has identificado una influencia importante de otras personas, aunque no necesariamente la describes como una obligación."
    );
  }

  if (LIM <= BAJO) {
    patrones.push(
      "Puede ser útil dedicar un momento a identificar qué límites son importantes para ti y cómo podrías expresarlos."
    );
  }

  if (IND <= BAJO) {
    patrones.push(
      "Has señalado que esta situación puede estar afectando aspectos importantes de tu identidad, intereses o proyectos personales."
    );
  }

  if (CLA <= BAJO) {
    patrones.push(
      "Todavía existen aspectos de la decisión que no tienes completamente definidos."
    );
  }

  if (CON <= BAJO) {
    patrones.push(
      "Puede ser útil considerar qué consecuencias tendría cada alternativa antes de tomar una decisión."
    );
  }

  if (AUT >= ALTO && PRE <= BAJO) {
    patrones.push(
      "Tu decisión parece responder principalmente a lo que tú quieres, con poca presión percibida."
    );
  }

  if (patrones.length === 0) {
    patrones.push(
      "Tus respuestas muestran un equilibrio entre los distintos factores considerados, sin un patrón dominante claro."
    );
  }

  return patrones;
}
