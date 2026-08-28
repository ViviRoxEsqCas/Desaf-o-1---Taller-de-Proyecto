// app.js — Orquestador principal
import { renderScreen1 } from "./components/screen1.js";
import { renderScreen2 } from "./components/screen2.js";
import { renderScreen3 } from "./components/screen3.js";

const root = document.getElementById("app");

// Estado de sesión (memoria en tiempo de ejecución; no se persiste en servidor)
let session = {
  tipoSituacion: null,
  situacion: "",
  decision: "",
  respuestas: {},
};

function goToScreen1() {
  session = { tipoSituacion: null, situacion: "", decision: "", respuestas: {} };
  renderScreen1(root, {
    onComplete: (datos) => {
      session = { ...session, ...datos };
      goToScreen2();
    },
  });
}

function goToScreen2() {
  renderScreen2(root, {
    respuestasIniciales: session.respuestas,
    onComplete: (respuestas) => {
      session.respuestas = respuestas;
      goToScreen3();
    },
  });
}

function goToScreen3() {
  renderScreen3(root, {
    session,
    onVolver: () => goToScreen2(),
    onNuevaReflexion: () => goToScreen1(),
  });
}

goToScreen1();
