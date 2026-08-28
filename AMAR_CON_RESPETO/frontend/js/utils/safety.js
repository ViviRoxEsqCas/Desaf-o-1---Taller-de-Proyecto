// utils/safety.js
// Capa de seguridad SEPARADA del análisis de variables.
// No calcula un "índice de peligro". Solo detecta, de forma simple, si el texto
// libre del usuario contiene señales que ameritan priorizar una orientación de
// seguridad y apoyo en la reflexión generada por la IA.
//
// Esta capa es intencionalmente simple (coincidencia de palabras clave) porque
// su función NO es diagnosticar, sino decidir si se añade una instrucción
// adicional de seguridad al prompt de la IA.

const SEÑALES = [
  "amenaza", "amenaza con", "me pega", "me golpea", "golpe", "violencia",
  "no me deja", "me controla", "controla todo", "chantaje", "chantajea",
  "miedo a que", "tengo miedo de", "me da miedo estar", "represalia",
  "no puedo decir que no", "me obliga", "me obligan", "me fuerza",
  "me aísla", "no me deja ver a", "revisa mi celular", "me sigue",
];

/**
 * @param {string[]} textos - todos los textos libres relevantes (situación, decisión, respuestas abiertas)
 * @returns {{ activa: boolean }}
 */
export function detectarSenalesDeSeguridad(textos = []) {
  const contenido = textos.filter(Boolean).join(" ").toLowerCase();
  const activa = SEÑALES.some((s) => contenido.includes(s));
  return { activa };
}
