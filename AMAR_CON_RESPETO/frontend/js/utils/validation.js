// utils/validation.js

/**
 * Valida los campos de la Pantalla 1 (situación).
 */
export function validarSituacion({ tipoSituacion, descripcion, decision }) {
  const errores = [];
  if (!tipoSituacion) errores.push("Selecciona el tipo de situación.");
  if (!descripcion || descripcion.trim().length < 5) {
    errores.push("Cuéntanos brevemente qué está pasando (mínimo 5 caracteres).");
  }
  if (!decision || decision.trim().length < 3) {
    errores.push("Cuéntanos qué decisión estás considerando.");
  }
  return errores;
}

/**
 * Valida la respuesta actual de una pregunta del cuestionario (Pantalla 2).
 */
export function validarRespuesta(question, valor) {
  if (!question.required) return null;

  switch (question.type) {
    case "text":
      if (!valor || String(valor).trim().length === 0) {
        return "Por favor escribe una respuesta antes de continuar.";
      }
      return null;
    case "scale":
      if (valor === undefined || valor === null || valor === "") {
        return "Selecciona un valor en la escala antes de continuar.";
      }
      return null;
    case "single":
      if (!valor) return "Selecciona una opción antes de continuar.";
      return null;
    case "multi":
      if (!Array.isArray(valor) || valor.length === 0) {
        return "Selecciona al menos una opción antes de continuar.";
      }
      return null;
    default:
      return null;
  }
}
