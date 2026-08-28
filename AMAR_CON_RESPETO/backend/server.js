// backend/server.js
// Servidor mínimo (Express) con dos responsabilidades:
//  1. Servir el frontend estático (../frontend).
//  2. Exponer POST /api/reflect, que recibe el contexto ya procesado
//     (situación, decisión, variables, patrones, respuestas) y llama a la
//     API de Gemini usando una API key que vive SOLO en el servidor
//     (variable de entorno GEMINI_API_KEY). La key nunca llega al cliente.
//
// Si AI_MODE=mock (o no hay API key configurada), el propio backend genera
// una reflexión de respaldo localmente, para que el sistema nunca se rompa
// durante una demostración.
//
// Ejecución:
//   cd backend
//   npm install
//   cp .env.example .env   # y completa tu GEMINI_API_KEY si usarás modo real
//   npm start
//
// Requiere Node 18+ (usa fetch nativo).

require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;
const AI_MODE = process.env.AI_MODE || "mock";
const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Sirve el frontend estático
app.use(express.static(path.join(__dirname, "..", "frontend")));

const SYSTEM_PROMPT = `Analiza la información proporcionada por el usuario únicamente como una herramienta de reflexión personal.

No realices diagnósticos psicológicos.
No etiquetes al usuario.
No determines que una relación es tóxica, saludable, abusiva o dependiente únicamente a partir de estas respuestas.
No ordenes al usuario terminar o continuar una relación.
No tomes decisiones por el usuario.

Reconoce primero lo que el usuario expresó.
Relaciona las respuestas abiertas con los indicadores calculados.
Identifica las principales tensiones entre: deseos personales, expectativas externas, presión, límites, identidad, consecuencias y claridad.

Redacta una reflexión personalizada, humana, clara, respetuosa y no culpabilizante.
La reflexión debe sentirse específica para la situación descrita por el usuario.
No inventes información. No atribuyas emociones que el usuario no expresó.

Después de la reflexión, proporciona de 2 a 4 preguntas orientadoras que ayuden al usuario a continuar pensando por sí mismo.

Si existen señales relacionadas con violencia, amenazas, coerción, miedo por la seguridad, control extremo o situaciones potencialmente peligrosas, prioriza una orientación de seguridad y recomienda buscar apoyo adecuado. No minimices señales de riesgo. No conviertas el resultado en un diagnóstico.

Además, incluye una frase breve de consuelo o inspiración junto con el nombre real del autor o artista que la dijo. Usa únicamente frases reales y verídicas (no inventes la cita ni el autor). Prioriza frases de dominio público (pensadores clásicos) para evitar reproducir letras de canciones o poemas con derechos de autor.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código, con exactamente esta forma:
{
  "resumen": "...",
  "aspectos_destacados": ["...", "..."],
  "reflexion": "...",
  "preguntas_orientadoras": ["...", "..."],
  "orientacion_seguridad": null,
  "frase_consuelo": { "frase": "...", "autor": "..." }
}
Si "safety.activa" es true en el contexto, "orientacion_seguridad" debe contener texto (no null).`;

const FRASES_CONSUELO_BACKEND = [
  { frase: "No es que tengamos poco tiempo, sino que perdemos mucho.", autor: "Séneca" },
  { frase: "Lo que no está en tu poder, no lo desees como si lo estuviera.", autor: "Marco Aurelio" },
  { frase: "Nada es permanente, excepto el cambio.", autor: "Heráclito" },
];

function mockLocal(contexto) {
  // Respaldo simple en el backend (independiente del mock del frontend),
  // usado solo si no hay API key configurada o AI_MODE=mock.
  const { situacion, decision, patrones = [], safety } = contexto;
  const frase_consuelo = FRASES_CONSUELO_BACKEND[Math.floor(Math.random() * FRASES_CONSUELO_BACKEND.length)];
  return {
    resumen: `Nos contaste sobre tu situación y la decisión que estás considerando: "${(decision || "").slice(0, 80)}".`,
    aspectos_destacados: patrones.slice(0, 3),
    reflexion: `Te estamos escuchando. Sobre "${(situacion || "").slice(
      0,
      80
    )}": ${patrones.join(" ")} Esta reflexión no busca decirte qué hacer, sino ayudarte a ver con más claridad lo que ya está presente en tus respuestas.`,
    preguntas_orientadoras: [
      "¿Qué elegirías si no existiera la presión de otras personas?",
      "¿Qué límite consideras importante conservar?",
      "¿Qué parte de esta decisión nace realmente de ti?",
    ],
    orientacion_seguridad:
      safety && safety.activa
        ? "Algunas respuestas sugieren posible presión extrema o riesgo para tu seguridad. Te recomendamos hablar con una persona de confianza o buscar apoyo especializado."
        : null,
    frase_consuelo,
  };
}

function normalizarRespuesta(respuesta, contexto) {
  const respaldo = mockLocal(contexto);
  const frase = respuesta.frase_consuelo;

  return {
    resumen: typeof respuesta.resumen === "string" ? respuesta.resumen : respaldo.resumen,
    aspectos_destacados: Array.isArray(respuesta.aspectos_destacados)
      ? respuesta.aspectos_destacados.filter((item) => typeof item === "string").slice(0, 6)
      : respaldo.aspectos_destacados,
    reflexion: typeof respuesta.reflexion === "string" ? respuesta.reflexion : respaldo.reflexion,
    preguntas_orientadoras: Array.isArray(respuesta.preguntas_orientadoras)
      ? respuesta.preguntas_orientadoras.filter((item) => typeof item === "string").slice(0, 4)
      : respaldo.preguntas_orientadoras,
    orientacion_seguridad: contexto.safety?.activa
      ? typeof respuesta.orientacion_seguridad === "string" && respuesta.orientacion_seguridad.trim()
        ? respuesta.orientacion_seguridad
        : respaldo.orientacion_seguridad
      : null,
    frase_consuelo:
      frase && typeof frase.frase === "string" && typeof frase.autor === "string"
        ? frase
        : respaldo.frase_consuelo,
  };
}

app.post("/api/reflect", async (req, res) => {
  const contexto = req.body;

  const usarMock = AI_MODE !== "real" || !API_KEY;
  if (usarMock) {
    return res.json(mockLocal(contexto));
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(contexto) }] }],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              resumen: { type: "STRING" },
              aspectos_destacados: { type: "ARRAY", items: { type: "STRING" } },
              reflexion: { type: "STRING" },
              preguntas_orientadoras: { type: "ARRAY", items: { type: "STRING" } },
              orientacion_seguridad: { type: "STRING", nullable: true },
              frase_consuelo: {
                type: "OBJECT",
                properties: { frase: { type: "STRING" }, autor: { type: "STRING" } },
                required: ["frase", "autor"],
              },
            },
            required: [
              "resumen",
              "aspectos_destacados",
              "reflexion",
              "preguntas_orientadoras",
              "orientacion_seguridad",
              "frase_consuelo",
            ],
          },
        },
      }),
      }
    );

    if (!response.ok) {
      console.error("Error de la API de Gemini:", response.status, await response.text());
      return res.json(mockLocal(contexto));
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error("No se pudo parsear la respuesta de la IA como JSON:", e.message);
      return res.json(mockLocal(contexto));
    }

    return res.json(normalizarRespuesta(parsed, contexto));
  } catch (err) {
    console.error("Error llamando a la API de Gemini:", err.message);
    return res.json(mockLocal(contexto));
  }
});

app.listen(PORT, () => {
  console.log(`Amar con Respeto — servidor escuchando en http://localhost:${PORT}`);
  console.log(`AI_MODE=${AI_MODE}${AI_MODE === "real" && !API_KEY ? " (sin API key, se usará mock de respaldo)" : ""}`);
});
