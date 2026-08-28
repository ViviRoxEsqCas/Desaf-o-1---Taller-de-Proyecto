// components/screen3.js — Pantalla 3: "LO QUE IDENTIFICASTE"
import { calcularVariables, nivelDe, NOMBRES_VARIABLES } from "../utils/scoring.js";
import { detectarPatrones } from "../utils/patterns.js";
import { detectarSenalesDeSeguridad } from "../utils/safety.js";
import { AIService } from "../services/aiService.js";

export async function renderScreen3(container, { session, onVolver, onNuevaReflexion }) {
  container.innerHTML = `<section class="screen screen-3 loading"><p>Analizando tus respuestas...</p></section>`;

  const variables = calcularVariables(session.respuestas);
  const patrones = detectarPatrones(variables);

  const textosLibres = [
    session.situacion,
    session.decision,
    session.respuestas.P01,
    session.respuestas.P03,
    session.respuestas.P04,
    session.respuestas.P07,
    session.respuestas.P08,
    session.respuestas.P17,
    session.respuestas.P18,
  ];
  const safety = detectarSenalesDeSeguridad(textosLibres);

  const contexto = {
    situacion: session.situacion,
    decision: session.decision,
    deseo_personal: session.respuestas.P01 || "",
    emociones: session.respuestas.P02 || [],
    influencias: (session.respuestas.P07 || "").split(",").map((s) => s.trim()).filter(Boolean),
    expectativas_externas: session.respuestas.P03 || "",
    variables,
    patrones,
    safety,
    respuestas: session.respuestas,
  };

  const resultado = await AIService.getReflection(contexto);

  container.innerHTML = `
    <section class="screen screen-3">
      <header class="app-header">
        <h1>Lo que identificaste</h1>
        <p class="subtitle">Esta es una lectura de tus respuestas, no un diagnóstico.</p>
      </header>

      <div class="resumen">${resultado.resumen || ""}</div>

      <h3>Resumen de factores</h3>
      <div class="variables-list">
        ${Object.entries(variables)
          .map(([key, val]) => {
            const nivel = nivelDe(key, val);
            return `
              <div class="variable-row">
                <div class="variable-label">${NOMBRES_VARIABLES[key]} — <strong>${nivel}</strong></div>
                <div class="variable-bar-bg"><div class="variable-bar-fill" style="width:${val}%"></div></div>
              </div>
            `;
          })
          .join("")}
      </div>

      <h3>Aspectos destacados</h3>
      <ul class="aspectos">
        ${(resultado.aspectos_destacados || []).map((a) => `<li>${a}</li>`).join("")}
      </ul>

      <h3>Reflexión personalizada</h3>
      <div class="reflexion-box">${resultado.reflexion || ""}</div>

      ${
        resultado.frase_consuelo
          ? `<div class="frase-consuelo">“${resultado.frase_consuelo.frase}”<span>— ${resultado.frase_consuelo.autor}</span></div>`
          : ""
      }

      ${
        resultado.orientacion_seguridad
          ? `<div class="safety-box"><strong>Un espacio para tu seguridad:</strong> ${resultado.orientacion_seguridad}</div>`
          : ""
      }

      <h3>Preguntas para seguir reflexionando</h3>
      <ul class="preguntas-orientadoras">
        ${(resultado.preguntas_orientadoras || []).map((p) => `<li>${p}</li>`).join("")}
      </ul>

      <div class="footer-buttons">
        <button class="btn-secondary" id="btn-volver">VOLVER A MIS RESPUESTAS</button>
        <button class="btn-primary" id="btn-nueva">NUEVA REFLEXIÓN</button>
      </div>

      <p class="modo-debug">Modo de generación: ${resultado._modo || "mock"}</p>
    </section>
  `;

  container.querySelector("#btn-volver").addEventListener("click", onVolver);
  container.querySelector("#btn-nueva").addEventListener("click", onNuevaReflexion);
}
