// services/aiService.js
// Único punto de entrada para obtener la reflexión de IA.
//
// - Modo "mock": genera la reflexión localmente (mockGenerator.js). No requiere
//   backend ni conexión a internet.
// - Modo "real": envía el contexto a un endpoint propio del backend
//   (CONFIG.API_ENDPOINT), que a su vez llama a la API de Gemini usando una
//   API key que vive únicamente en el servidor. El frontend NUNCA ve la API key.
//
// Si el modo "real" falla (backend caído, sin conexión, etc.), se hace un
// fallback automático al modo mock para que la demostración nunca se rompa.

import { CONFIG } from "../config.js";
import { generarReflexionMock } from "./mockGenerator.js";

export const AIService = {
  async getReflection(contexto) {
    if (CONFIG.AI_MODE === "real") {
      try {
        const res = await fetch(CONFIG.API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contexto),
        });
        if (!res.ok) throw new Error(`Backend respondió ${res.status}`);
        const data = await res.json();
        return { ...data, _modo: "real" };
      } catch (err) {
        console.warn("[AIService] Falló el modo real, usando MOCK como respaldo:", err.message);
        return { ...generarReflexionMock(contexto), _modo: "mock-fallback" };
      }
    }

    // Modo mock (por defecto)
    // Pequeña espera simulada para que la UI de "cargando" se sienta real.
    await new Promise((r) => setTimeout(r, 700));
    return { ...generarReflexionMock(contexto), _modo: "mock" };
  },
};
