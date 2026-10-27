---
status: pendiente
depends_on: [003]
---

# 004 — Vidriera v1: las ofertas del barrio en una página

Sumar la página `/vidriera`, que muestra las ofertas de los comercios del barrio con buscador, filtros
por rubro, carrusel de lo que vence hoy, mapa con un punto por comercio y su ficha, siguiendo el mock
aprobado. Sale con comercios y ofertas **de ejemplo**, avisados como tales en pantalla. Cambia también
el logo a "VS" en toda la web.

**Tipo:** feature · **Flujo:** requirements-first · **Gate 1:** aprobada por Edu el 2026-10-27 · **Riesgo:** usuarios externos, sin pagos (compuertas: Ready to Build y Ready to Release de Edu; el merge lo deciden los evals y el revisor adversarial)

## Estado previo

- `main` en `6681e7d` (merge de la spec 003). Antes de arrancar: `git log 6681e7d..main --stat`.
- Página única `app/page.tsx`; secciones en `app/components/`; tokens Yungas como variables CSS en
  `app/globals.css`; el mapa de la zona es un `<svg>` inline en `Neighbors.tsx`, copia de
  `docs/design/mapa-zona.svg`. As-built completo: `ARCHITECTURE.md`.
- Logo actual: cuadrado monte con "V" en `app/components/Chrome.tsx`.
- `evals/run.sh` pasa 14/14.

## Entradas

| Archivo | Qué es |
|---|---|
| `docs/design/mock-vidriera.html` | Mock aprobado por Edu el 2026-10-20: estructura, textos, comportamiento y los datos de ejemplo (`COMERCIOS`, `OFERTAS`) |
| `docs/design/mapa-zona.svg` | El dibujo de la zona: no cambia, solo se le agregan los puntos encima |
| `docs/design/handoff-landing.md` | Design system vigente |

## Criterios de aceptación

| # | Criterio | Eval |
|---|---|---|
| V1 | No se rompe nada | `evals/run.sh`: todos los chequeos previos pasan |
| V2 | La página existe y avisa que es un ejemplo | `curl localhost:3100/vidriera` → 200 y contiene `Lo que hay hoy a la vuelta`, `Vencen hoy`, `Elegí qué buscás`, `Dónde queda cada uno`, `Los comercios del barrio` y `Comercios y ofertas de ejemplo` |
| V3 | Los datos de ejemplo son los del mock | Unit test: `lib/vidriera-ejemplo.ts` exporta 8 comercios y 8 ofertas con los mismos nombres, productos y precios que `COMERCIOS`/`OFERTAS` del mock |
| V4 | El vencimiento es relativo a hoy | Unit test: con `vence: 0` la etiqueta es `Solo hoy`; con `vence: 1`, `Hasta mañana`; con `vence: n ≥ 2`, `Hasta el <día>` según la fecha de referencia del test. La página nunca queda vacía con el paso de los días |
| V5 | Abierto o cerrado se calcula del horario | Unit test de `estaAbierto(horario, ahora)` en hora de Salta (`America/Argentina/Salta`): `8 a 13 y 17 a 21` → abierto 10:00, cerrado 15:00, abierto 18:30, cerrado 21:30; `24 horas` → siempre abierto; `7:30 a 22` → cerrado 7:00, abierto 7:30 |
| V6 | El contador cuenta | Unit test: con los datos de ejemplo, 8 ofertas activas, 3 vencen hoy, 8 comercios |
| V7 | Buscar y filtrar funciona | Playwright en `/vidriera`: filtro `Carnicería` → 1 tarjeta; "Solo las que vencen hoy" → 3 tarjetas; buscar `yerba` → 1 tarjeta; un filtro sin resultados muestra `Nada por acá, por ahora` |
| V8 | El carrusel pasa solo | Playwright: el carrusel muestra las 3 ofertas que vencen hoy; la visible cambia sola en ≤ 4 s; las flechas la cambian a mano |
| V9 | Mapa y ficha | Playwright: hay 8 puntos sobre el mapa; al tocar uno se abre la ficha con nombre, dirección, horario y `Abierto ahora` o `Cerrado ahora`; `Cerrar` y Escape la cierran y el foco vuelve a donde estaba. La forma de la zona es la de `mapa-zona.svg` (mismo `path` del contorno) |
| V10 | Ningún WhatsApp lleva a un número real | `grep -rn "wa.me\|api.whatsapp" app lib` no devuelve nada; los botones "Escribile por WhatsApp" de los ejemplos no son links y la ficha muestra `387 4XX-XXXX (ejemplo)` |
| V11 | Los llamados a sumarse van al formulario | "Publicá", "Publicá tu oferta" y "Sumá tu comercio" llevan a `/#formulario` y dejan elegido el tipo `comercio` |
| V12 | Logo "VS" en toda la web | `curl /` y `curl /vidriera` contienen el logo con el texto `VS`; no queda el logo con "V" sola |
| V13 | En celular, el encabezado va en una fila y no hay desborde | Playwright a 390 px en `/vidriera`: logo, buscador y "Publicá" con el mismo `top` (±4 px); `scrollWidth <= 390` |
| V14 | La landing lleva a la vidriera | `curl /` contiene un link a `/vidriera` |
| V15 | Se ve como el mock | **Rúbrica** (Edu en Ready to Release, sobre la URL de prueba y las capturas de `npm run capturas` a 390 y 1440 px, sí/no): (a) mismo orden de secciones que el mock; (b) tokens Yungas, sin colores nuevos; (c) carrusel con flechas sin recuadro y puntitos chicos; (d) puntos del mapa legibles y sin tapar los nombres de las calles; (e) el aviso de ejemplo se ve sin buscarlo pero no tapa el contenido; (f) se parece al mock |
| V16 | Pasó la revisión adversarial | Un agente de otro modelo revisa el diff contra esta spec; cada hallazgo con `archivo:línea` queda corregido o descartado con su motivo en "Evidencia" |

## Decisiones

### Cerradas antes de delegar

- DECIDIDO por Edu (2026-10-26): la v1 sale con los comercios y ofertas de ejemplo del mock, avisados como tales.
- DECIDIDO por Edu (2026-10-26): entran todos: logo "VS", contador, filtros de rubro, abierto/cerrado y carrusel.
- DECIDIDO por Edu (2026-10-20, ver `decisions.md` del brain): carrusel de las ofertas que vencen hoy, cada 3 s, controles sutiles; la zona del mapa no cambia; logo "VS" en Archivo angosta; en celular, encabezado en una fila.
- DECIDIDO por Edu (Gate 1, 2026-10-27), a propuesta de Claude: **los datos de ejemplo viven en el código** (`lib/vidriera-ejemplo.ts`), con el vencimiento en días desde hoy como en el mock, no en Supabase. Así los ejemplos no se vencen, las URLs de prueba funcionan sin la base y la pausa de Supabase no deja la vidriera vacía. Los campos de los tipos copian las tablas que vendrán, para que el cambio a la base sea solo de origen.
- En el mock dice "todas a menos de cinco cuadras": va "a pocas cuadras" (spec 003).

### Delegadas al agente, con su criterio

- Qué partes son client components: lo mínimo para buscador, filtros, carrusel y ficha; el resto en el servidor.
- Cómo se calcula "hoy" y "ahora": en hora de Salta, en el navegador, para que la página siga siendo estática y no muestre la fecha del build.
- Cómo se dibujan los puntos: capa encima del SVG existente, sin modificar sus `path`.
- Qué modelo hace la revisión adversarial: uno distinto del que implementó.

### Condiciones de parada

- Si el mock y el design system se contradicen (un color o componente que no está en el handoff): se para y se muestran las dos opciones.
- Si los puntos del mapa no entran legibles a 390 px sin tapar las calles: se para con la captura.
- Si algún criterio pide tocar la base o las variables de Vercel: se para. Esta spec no las toca.

## Efectos que escapan del sistema

- Ninguno hasta que Edu publica la rama. La URL de prueba de Vercel es pública para quien tenga el link; muestra solo datos de ejemplo.
- Al mergear a `main`, Vercel publica solo (con OK de Edu en Ready to Release).

## Fuera de alcance

| Qué | Lo trae de vuelta |
|---|---|
| Tablas `comercios` y `ofertas` en Supabase | El primer comercio real que acepte salir |
| Links de WhatsApp a los comercios | Lo mismo: comercio real con su número y su permiso |
| Que el comercio cargue su oferta solo (login) | Más de 10 comercios activos, o que Edu no llegue a cargarlas |
| Actualizar `docs/design/landing.dc.html` | Que Edu lo pida (tsk-007) |

## Evidencia

<!-- La completa el agente: salida de evals/run.sh, capturas, hallazgos del revisor y qué se hizo con cada uno. -->
