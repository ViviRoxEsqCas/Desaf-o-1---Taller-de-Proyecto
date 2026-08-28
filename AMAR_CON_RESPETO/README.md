# Amar con Respeto

Mockup funcional de 3 pantallas — Mención de Desarrollo de Software.

---

## 1. Nombre del proyecto
**Amar con Respeto**

## 2. Objetivo
Demostrar, mediante un prototipo funcional, el flujo **Usuario → Entrada → Proceso → Resultado**: el usuario introduce información sobre una situación personal, responde un cuestionario de 20 preguntas, el sistema procesa esas respuestas localmente y genera una reflexión personalizada (mediante IA real o simulada) que el usuario recibe como resultado.

## 3. Problema
Adolescentes y jóvenes (aprox. 15–24 años) suelen tener dificultad para distinguir hasta qué punto una decisión personal o afectiva responde a su propia voluntad y hasta qué punto está condicionada por expectativas familiares, de pareja, de amistades o del entorno social.

## 4. Usuario
Adolescente o joven que está considerando una decisión relacionada con una relación afectiva, su familia, sus amistades, sus estudios, un proyecto personal o su futuro.

## 5. Relación con la Leyenda del Illimani
El proyecto parte del conflicto entre Illi y Mana como punto de partida simbólico para reflexionar sobre autonomía, identidad, presión externa y límites — **sin reproducir literalmente la tragedia** ni presentar el sacrificio como modelo de amor. El conflicto se traslada a una pregunta contemporánea: ¿cuánto de mis decisiones es realmente mío?

## 6. Flujo Usuario → Entrada → Proceso → Resultado

```
USUARIO
  ↓
Pantalla 1: describe su situación y la decisión que está considerando
  ↓
Pantalla 2: responde 20 preguntas (progresivas, con validación)
  ↓
PROCESAMIENTO LOCAL (sin servidor): cálculo de 7 variables + detección de patrones
  ↓
Se arma un CONTEXTO COMPLETO (situación, decisión, variables, patrones, respuestas)
  ↓
AIService → IA (real o mock)
  ↓
Pantalla 3: reflexión personalizada + preguntas orientadoras
```

## 7. Las tres pantallas

| Pantalla | Nombre | Función |
|---|---|---|
| 1 | **Tu situación** | Captura tipo de situación, descripción y decisión considerada. |
| 2 | **Míralo desde dentro** | Cuestionario progresivo de 20 preguntas con barra de progreso, validación y navegación anterior/siguiente. |
| 3 | **Lo que identificaste** | Muestra las 7 variables, patrones detectados y la reflexión generada por IA (real o mock), con preguntas orientadoras. |

## 8. Variables (núcleo del análisis)

| Código | Variable |
|---|---|
| AUT | Autonomía |
| INF | Influencia externa |
| PRE | Presión |
| LIM | Límites |
| IND | Individualidad |
| CON | Consecuencias |
| CLA | Claridad |

No se genera un puntaje global único: cada variable se muestra por separado.

## 9. Algoritmo (`frontend/js/utils/scoring.js`)

```
AUT = (P05 + P06) / 2
INF = P09
PRE = (P10 + P11) / 2
LIM = (P12 + P13 + P14) / 3
IND = (P15 invertida + P16) / 2
CON = P19
CLA = P20

normalización: ((valor - 1) / 4) × 100
```

Niveles: **Baja** (≤40), **Moderada** (41–70), **Alta** (>70). Para `LIM`, el nivel bajo se muestra como "Por explorar" en vez de "Baja".

## 10. Sistema de patrones (`frontend/js/utils/patterns.js`)

Reglas independientes que combinan variables (ej. `PRE alto + AUT bajo`, `LIM bajo`, `IND bajo`, `CLA bajo`, `CON bajo`, etc.) para generar frases de contexto que se envían a la IA. No producen etiquetas clínicas.

Existe además una **capa de seguridad separada** (`frontend/js/utils/safety.js`) que detecta, por palabras clave en las respuestas abiertas, posibles señales de riesgo (amenazas, control extremo, miedo por seguridad) — sin calcular un "índice de peligro" y sin diagnosticar. Si se activa, se incluye una instrucción adicional para que la IA priorice orientación de seguridad y apoyo.

## 11. Integración con IA

Arquitectura:

```
RESPUESTAS → PROCESAMIENTO LOCAL → VARIABLES → PATRONES → CONTEXTO COMPLETO → IA → REFLEXIÓN
```

La IA **no sustituye** el algoritmo interno: solo interpreta el contexto ya calculado (variables + patrones + texto libre) y redacta una reflexión humana, no genérica, sin diagnósticos ni órdenes.

El prompt interno enviado a la IA (ver `backend/server.js`, constante `SYSTEM_PROMPT`) instruye explícitamente: no diagnosticar, no etiquetar, no decidir por el usuario, reconocer lo expresado, identificar tensiones, no inventar información, y priorizar seguridad si hay señales de riesgo.

## 12. Modo MOCK

`AIService` (`frontend/js/services/aiService.js`) soporta dos modos:

- **mock** (por defecto): genera la reflexión 100% en el navegador (`mockGenerator.js`), sin backend ni API key. Permite hacer la demostración académica completa sin depender de conexión externa.
- modo `real` depende de tener una API key válida de Gemini configurada en el backend; sin ella, el sistema usa automáticamente el modo mock para no interrumpir la demostración.
- **real**: llama al backend (`/api/reflect`), que a su vez llama a la API de Gemini.

Se puede alternar sin tocar código añadiendo `?ai=mock` o `?ai=real` a la URL, o editando `AI_MODE` en `frontend/js/config.js`.

## 13. Configuración de la API (seguridad de la key)

**La API key nunca se coloca en el frontend.** Cuando se usa el modo `real`, la clave vive únicamente en el servidor (`backend/.env`, variable `GEMINI_API_KEY`) y el frontend solo llama a `/api/reflect` (endpoint propio).

```
FRONTEND → ENDPOINT PROPIO (/api/reflect) → API DE IA → RESPUESTA → FRONTEND
```

Si el backend no tiene API key configurada, o `AI_MODE=mock`, el propio servidor devuelve una reflexión de respaldo generada localmente (nunca se rompe la demo).

## 14. Instalación

### Opción A — Solo frontend (modo mock, recomendado para la demo académica)

No requiere instalación de dependencias. Basta con servir la carpeta `frontend/` con cualquier servidor estático (los módulos ES requieren `http://`, no `file://`):

```bash
cd frontend
python3 -m http.server 8080
# abrir http://localhost:8080
```

### Opción B — Con backend (para probar modo real con IA)

```bash
cd backend
npm install
cp .env.example .env
# completar GEMINI_API_KEY en .env y poner AI_MODE=real
npm start
# abrir http://localhost:3000  (el backend también sirve el frontend)
```

## 15. Ejecución

1. Abrir la app → Pantalla 1: elegir tipo de situación, describirla y la decisión considerada → **COMENZAR REFLEXIÓN**.
2. Pantalla 2: responder las 20 preguntas (texto libre, escala 1–5 o selección) → **VER MI REFLEXIÓN** en la última.
3. Pantalla 3: ver las 7 variables, patrones destacados, la reflexión generada y las preguntas orientadoras. Se puede volver a las respuestas o iniciar una nueva reflexión.

## 16. Arquitectura y estructura de carpetas

```
AMAR_CON_RESPETO/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js                  (orquestador / estado de sesión)
│       ├── config.js                (AI_MODE, endpoint)
│       ├── data/questions.js        (20 preguntas)
│       ├── utils/
│       │   ├── validation.js
│       │   ├── scoring.js           (cálculo de variables)
│       │   ├── patterns.js          (detección de patrones)
│       │   └── safety.js            (capa de seguridad, separada)
│       ├── services/
│       │   ├── aiService.js         (decide mock vs real)
│       │   └── mockGenerator.js     (IA simulada, sin backend)
│       └── components/
│           ├── screen1.js
│           ├── screen2.js
│           └── screen3.js
└── backend/
    ├── server.js                    (Express: estático + /api/reflect)
    ├── package.json
    └── .env.example
```

Separación de responsabilidades: **presentación** (`components/`), **lógica/datos** (`data/`, `utils/`), **análisis** (`scoring.js`, `patterns.js`, `safety.js`) e **IA** (`services/`).

## 17. Análisis técnico del framework (comparación breve)

| Criterio | React | Vue | Svelte | HTML/CSS/JS (elegido) |
|---|---|---|---|---|
| Modularidad para 3 pantallas | Buena, pero requiere build | Buena, requiere build | Buena, requiere build/compilador | Suficiente con módulos ES nativos |
| Manejo de estado | Requiere hooks/librerías | Reactividad integrada | Reactividad integrada | Objeto de sesión simple en `app.js`, suficiente para 3 pantallas |
| Integración con APIs | Directa (fetch) | Directa (fetch) | Directa (fetch) | Directa (fetch), igual de simple |
| Mantenimiento/escalabilidad | Alta, pero sobredimensionada para el alcance | Alta, sobredimensionada | Alta, sobredimensionada | Adecuada al alcance real (3 pantallas, sin backend obligatorio) |
| Facilidad de desarrollo y demostración | Requiere Node, bundler, `npm run build` | Igual que React | Requiere compilador | Se ejecuta con un simple servidor estático, sin build step |

**Decisión:** se eligió **HTML/CSS/JavaScript con módulos ES nativos**, no por popularidad sino por adecuación: el proyecto tiene exactamente 3 pantallas, no requiere ruteo complejo ni gestión de estado avanzada, y el criterio académico prioriza demostrar claramente el flujo *entrada → proceso → resultado* sin la sobrecarga de un build system. La modularidad se logra igualmente mediante módulos ES (`import`/`export`) separando datos, lógica, análisis, servicios de IA y componentes de presentación. El backend Express se añade únicamente como capa opcional para proteger la API key en modo IA real, sin ser un requisito para la demostración.

## 18. Limitaciones

- Es un **mockup funcional**, no un producto comercial: no hay autenticación, perfiles ni panel administrativo (a propósito, según el alcance definido).
- El estado se mantiene en memoria de sesión (JavaScript); al recargar la página se pierde el progreso.
- La detección de "señales de seguridad" es una capa simple basada en palabras clave, **no un diagnóstico ni una evaluación clínica de riesgo**; su único propósito es decidir si se agrega una instrucción de orientación de apoyo a la reflexión.
- El diseño visual es funcional, no definitivo — la especificación indica explícitamente dejar la identidad visual para una segunda etapa.
- El modo `real` depende de tener una API key válida de Gemini configurada en el backend; sin ella, el sistema usa automáticamente el modo mock para no interrumpir la demostración.

## 19. Consideraciones de seguridad psicológica

- La aplicación **nunca** presenta un diagnóstico, una etiqueta clínica ni un puntaje global.
- La IA (real o mock) tiene instrucciones explícitas de no decidir por el usuario, no ordenar terminar o continuar una relación, no inventar emociones ni información, y reconocer primero lo que el usuario expresó.
- Ante señales de posible riesgo (violencia, coerción, control extremo, miedo por la seguridad), el sistema prioriza una orientación de apoyo y seguridad en vez de continuar con el análisis habitual, sin minimizar la señal ni convertirla en diagnóstico.
- No se solicita información personal innecesaria (nombre completo, teléfono, documento de identidad, dirección).

---

### Casos de prueba sugeridos (ver también sección 28 de la especificación original)

1. Alta autonomía + baja presión → reflexión que reconoce decisión propia y clara.
2. Alta influencia + baja presión → reconoce influencia sin obligación.
3. Alta presión + baja autonomía → patrón de tensión entre presión y voluntad propia.
4. Límites poco claros (LIM bajo) → sugiere explorar límites.
5. Baja individualidad (IND bajo) → señala afectación a identidad/proyectos personales.
6. Baja claridad (CLA bajo) → señala aspectos aún no definidos.
7. Baja consideración de consecuencias (CON bajo) → sugiere considerar consecuencias.
8. Señales de seguridad (palabras clave de control/miedo en texto libre) → activa `orientacion_seguridad` con recomendación de apoyo, sin diagnosticar.

Todos estos casos pueden verificarse ejecutando la app en modo mock: las reflexiones cambian según las respuestas, las variables se calculan correctamente y ningún caso produce un diagnóstico ni una orden de decisión.
