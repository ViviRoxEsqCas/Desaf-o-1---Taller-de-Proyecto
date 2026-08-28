// data/frases.js
// Frases breves de consuelo/reflexión con su autor. Se muestra una al azar
// junto a la reflexión generada, como cierre cálido.
//
// Nota: se usaron pensadores de dominio público para evitar riesgos de
// derechos de autor (poemas y letras de canciones NO deben reproducirse).
// Puedes reemplazar o ampliar esta lista con las frases que prefieras,
// verificando siempre la redacción exacta y el autor correcto.

export const FRASES_CONSUELO = [
  { frase: "No es que tengamos poco tiempo, sino que perdemos mucho.", autor: "Séneca" },
  { frase: "Lo que no está en tu poder, no lo desees como si lo estuviera.", autor: "Marco Aurelio" },
  { frase: "Conócete a ti mismo.", autor: "Sócrates" },
  { frase: "El que teme sufrir, ya sufre por lo que teme.", autor: "Michel de Montaigne" },
  { frase: "Nada es permanente, excepto el cambio.", autor: "Heráclito" },
  { frase: "La felicidad de tu vida depende de la calidad de tus pensamientos.", autor: "Marco Aurelio" },
];

export function frasesAleatoria() {
  const i = Math.floor(Math.random() * FRASES_CONSUELO.length);
  return FRASES_CONSUELO[i];
}
