// components/screen1.js — Pantalla 1: "TU SITUACIÓN"
import { validarSituacion } from "../utils/validation.js";

const TIPOS = [
  "Relación afectiva",
  "Familia",
  "Amistades",
  "Estudios",
  "Proyecto personal",
  "Futuro personal",
  "Otra",
];

export function renderScreen1(container, { onComplete }) {
  container.innerHTML = `
    <section class="screen screen-1">
      <header class="app-header">
        <h1>Amar con Respeto</h1>
        <p class="subtitle">Una pausa para entender lo que quieres, lo que otros esperan de ti y lo que necesitas antes de decidir.</p>
      </header>

      <div class="info-box">
        Esta herramienta te ayudará a organizar tus pensamientos sobre una situación personal.
        No existen respuestas correctas o incorrectas y el resultado no es un diagnóstico.
      </div>

      <div class="banner-concepto">"Tu historia también merece ser escuchada."</div>

      <div class="field">
        <label>¿Con qué área se relaciona tu situación?</label>
        <div class="chips" id="tipo-chips">
          ${TIPOS.map((t) => `<button type="button" class="chip" data-tipo="${t}">${t}</button>`).join("")}
        </div>
      </div>

      <div class="field">
        <label for="descripcion">Cuéntanos brevemente qué está pasando.</label>
        <textarea id="descripcion" rows="4" placeholder="Escribe aquí..."></textarea>
      </div>

      <div class="field">
        <label for="decision">¿Qué decisión estás considerando?</label>
        <textarea id="decision" rows="3" placeholder="Escribe aquí..."></textarea>
      </div>

      <div class="errores" id="errores-s1"></div>

      <button class="btn-primary" id="btn-comenzar">COMENZAR REFLEXIÓN</button>
    </section>
  `;

  let tipoSituacion = null;
  const chips = container.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      tipoSituacion = chip.dataset.tipo;
    });
  });

  container.querySelector("#btn-comenzar").addEventListener("click", () => {
    const descripcion = container.querySelector("#descripcion").value;
    const decision = container.querySelector("#decision").value;
    const errores = validarSituacion({ tipoSituacion, descripcion, decision });

    const errBox = container.querySelector("#errores-s1");
    if (errores.length > 0) {
      errBox.innerHTML = errores.map((e) => `<div class="error">${e}</div>`).join("");
      return;
    }
    errBox.innerHTML = "";

    onComplete({
      tipoSituacion,
      situacion: descripcion.trim(),
      decision: decision.trim(),
    });
  });
}
