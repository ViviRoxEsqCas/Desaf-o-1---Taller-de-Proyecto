// config.js
// Configuración central de la aplicación.
//
// AI_MODE:
//   "mock" -> la reflexión se genera 100% en el cliente (sin backend, sin API key).
//             Ideal para la demostración académica.
//   "real" -> el cliente llama a un backend propio (backend/server.js) que a su vez
//             llama a la API de Gemini usando una API key protegida en el servidor.
//             La API key NUNCA debe colocarse aquí ni en ningún archivo del frontend.
//
// Para cambiar de modo, edite AI_MODE. También puede sobreescribirlo en tiempo de
// ejecución añadiendo ?ai=real o ?ai=mock a la URL (útil para demostrar ambos modos
// sin tocar código).

const params = new URLSearchParams(window.location.search);
const override = params.get("ai");

export const CONFIG = {
  AI_MODE: override === "real" || override === "mock" ? override : "mock",
  API_ENDPOINT: "/api/reflect",
  APP_NAME: "Amar con Respeto",
};
