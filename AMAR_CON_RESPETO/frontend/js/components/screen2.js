// components/screen2.js — Pantalla 2: "MÍRALO DESDE DENTRO"
import { QUESTIONS } from "../data/questions.js";
import { validarRespuesta } from "../utils/validation.js";

export function renderScreen2(container, { respuestasIniciales = {}, onComplete }) {
  let index = 0;
  const respuestas = { ...respuestasIniciales };

  function render() {
    const q = QUESTIONS[index];
    const total = QUESTIONS.length;
    const progreso = Math.round(((index + 1) / total) * 100);
    const valorActual = respuestas[q.id];
    const colorEtapa = colorDeEtapa(index, total);

    container.innerHTML = `
      <section class="screen screen-2" style="--step-color:${colorEtapa.color}; --step-soft:${colorEtapa.soft};">
        <div class="progress-info">Pregunta ${index + 1} de ${total}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progreso}%"></div></div>

        <p class="accompaniment">${accompanimentText(q)}</p>

        <h2 class="question-text">${q.text}</h2>

        <div class="answer-area" id="answer-area">
          ${renderAnswerInput(q, valorActual)}
        </div>

        <div class="errores" id="errores-s2"></div>

        <div class="nav-buttons">
          <button class="btn-secondary" id="btn-anterior" ${index === 0 ? "disabled" : ""}>← ANTERIOR</button>
          <button class="btn-primary" id="btn-siguiente">${index === total - 1 ? "VER MI REFLEXIÓN" : "SIGUIENTE →"}</button>
        </div>
      </section>
    `;

    attachInputHandlers(q);

    container.querySelector("#btn-anterior").addEventListener("click", () => {
      if (index > 0) {
        index -= 1;
        render();
      }
    });

    container.querySelector("#btn-siguiente").addEventListener("click", () => {
      const valor = respuestas[q.id];
      const error = validarRespuesta(q, valor);
      const errBox = container.querySelector("#errores-s2");
      if (error) {
        errBox.innerHTML = `<div class="error">${error}</div>`;
        return;
      }
      errBox.innerHTML = "";

      if (index === total - 1) {
        onComplete(respuestas);
      } else {
        index += 1;
        render();
      }
    });
  }

  function attachInputHandlers(q) {
    const area = container.querySelector("#answer-area");

    if (q.type === "text") {
      const textarea = area.querySelector("textarea");
      textarea.addEventListener("input", (e) => {
        respuestas[q.id] = e.target.value;
      });
    }

    if (q.type === "scale") {
      const buttons = area.querySelectorAll(".scale-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          respuestas[q.id] = Number(btn.dataset.value);
          buttons.forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });
    }

    if (q.type === "single") {
      const buttons = area.querySelectorAll(".option-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          respuestas[q.id] = btn.dataset.value;
          buttons.forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });
    }

    if (q.type === "multi") {
      const buttons = area.querySelectorAll(".option-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const current = new Set(respuestas[q.id] || []);
          const val = btn.dataset.value;
          if (current.has(val)) {
            current.delete(val);
            btn.classList.remove("selected");
          } else {
            current.add(val);
            btn.classList.add("selected");
          }
          respuestas[q.id] = Array.from(current);
        });
      });
    }
  }

  render();
}

function colorDeEtapa(index, total) {
  const paleta = [
    { color: "#a9aaa4", soft: "#ecebe7" },
    { color: "#afb0b8", soft: "#ececef" },
    { color: "#b7b7a3", soft: "#efeee2" },
    { color: "#a9b7ad", soft: "#e8eee9" },
    { color: "#a5b4bc", soft: "#e7edef" },
  ];
  const etapa = Math.min(paleta.length - 1, Math.floor((index / Math.max(1, total - 1)) * paleta.length));
  return paleta[etapa];
}

function accompanimentText(q) {
  const msgs = [
    "No hay respuestas correctas o incorrectas.",
    "Responde pensando en lo que realmente ocurre contigo.",
  ];
  // Alterna el mensaje según variable/tipo, solo por variedad, sin inducir respuestas.
  return q.id.charCodeAt(2) % 2 === 0 ? msgs[0] : msgs[1];
}

function renderAnswerInput(q, valorActual) {
  if (q.type === "text") {
    return `<textarea rows="4" placeholder="${q.placeholder || "Escribe aquí..."}">${valorActual || ""}</textarea>`;
  }

  if (q.type === "scale") {
    return `
      <div class="scale-row">
        ${[1, 2, 3, 4, 5]
          .map(
            (v) => `<button type="button" class="scale-btn ${valorActual === v ? "selected" : ""}" data-value="${v}">${v}</button>`
          )
          .join("")}
      </div>
      <div class="scale-labels">
        <span>${q.scaleLabels ? q.scaleLabels[0] : ""}</span>
        <span>${q.scaleLabels ? q.scaleLabels[4] : ""}</span>
      </div>
    `;
  }

  if (q.type === "single") {
    return `
      <div class="options-grid">
        ${q.options
          .map(
            (opt) =>
              `<button type="button" class="option-btn ${valorActual === opt ? "selected" : ""}" data-value="${opt}">${opt}</button>`
          )
          .join("")}
      </div>
    `;
  }

  if (q.type === "multi") {
    const seleccionadas = valorActual || [];
    return `
      <div class="options-grid">
        ${q.options
          .map(
            (opt) =>
              `<button type="button" class="option-btn ${seleccionadas.includes(opt) ? "selected" : ""}" data-value="${opt}">${opt}</button>`
          )
          .join("")}
      </div>
    `;
  }

  return "";
}
