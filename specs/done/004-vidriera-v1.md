---
status: implementada
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
| V11 | Los llamados a sumarse van al formulario | "Publicá", "Publicá tu oferta" y "Sumá tu comercio" llevan a `/?tipo=comercio#formulario` (la landing, al formulario) y dejan elegido el tipo `comercio`; el formulario lee `?tipo=` y la landing con `?tipo=vecino` deja `vecino`, así el eval prueba que el parámetro es lo que elige |
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

Corrida de `evals/run.sh` sobre la rama `spec-004` (2026-10-27), salida completa:

```
PASS C1 npm ci && npm run build sale con 0
PASS C2 npm test sale con 0
     |       Tests  42 passed (42)
PASS C9 tests de normalizarFuente
     |       Tests  13 passed (13)
PASS C10 RLS activada, insert para anon, ninguna otra policy
PASS C11 sin .env versionado ni secretos (specs excluida: nombra el patrón en su texto)
PASS C3 la página contiene las 15 cadenas del handoff
PASS C4 name= de los 5 campos y un label for= por cada campo visible
PASS C5 el CSS compilado contiene los 5 colores Yungas
     | sin-consentimiento -> 400
     | consentimiento-false -> 400
     | email-sin-arroba -> 400
     | nombre-vacio -> 400
     | tipo-invalido -> 400
PASS C6 los 5 casos inválidos responden 400
     | status 200, cuerpo {"ok":true}
PASS C7 la trampa responde 200 {"ok":true}
     | status 503
PASS C8 lead válido sin base responde 503
PASS C12 a 390 px: scrollWidth=390
PASS D2 sin "5 cuadras"; los tres textos nuevos están
PASS D3 svg role=img con aria-label, sin zona__calle, #f59bbe, sin cuadrícula
PASS V1 los 14 chequeos previos pasan
PASS V2 /vidriera responde 200 y contiene los 6 textos
PASS V3 los datos de ejemplo son los del mock (8 comercios, 8 ofertas)
     |       Tests  4 passed | 17 skipped (21)
PASS V4 el vencimiento es relativo a hoy
     |       Tests  5 passed | 16 skipped (21)
PASS V5 abierto o cerrado se calcula del horario en hora de Salta
     |       Tests  6 passed | 15 skipped (21)
PASS V6 el contador cuenta: 8 ofertas, 3 vencen hoy, 8 comercios
     |       Tests  1 passed | 20 skipped (21)
     | ok   sin filtros hay 8 tarjetas (8)
     | ok   filtro Carnicería -> 1 tarjeta (1)
     | ok   Solo las que vencen hoy -> 3 tarjetas (3)
     | ok   buscar yerba -> 1 tarjeta (1)
     | ok   filtro sin resultados (Almacén + vencen hoy) -> Nada por acá, por ahora
     | ok   buscar algo que no existe -> Nada por acá, por ahora
PASS V7 buscar y filtrar funciona
     | ok   la oferta visible cambia sola en <= 4 s (2598 ms)
     | ok   el carrusel tiene 3 puntos (las 3 ofertas que vencen hoy) (3)
     | ok   con las flechas se recorren las 3 ofertas de hoy (Asado de novillo | Tomate perita | Gaseosa 2,25 L + alfajor)
     | ok   la flecha anterior la cambia a mano
     | ok   todas las del carrusel dicen Solo hoy (Solo hoy)
PASS V8 el carrusel pasa solo y con flechas
     | ok   hay 8 puntos sobre el mapa (8)
     | ok   el contorno de la zona es el de mapa-zona.svg
     | ok   la ficha muestra el nombre
     | ok   la ficha muestra la dirección
     | ok   la ficha muestra el horario
     | ok   la ficha dice Abierto ahora o Cerrado ahora (Abierto ahora)
     | ok   la ficha muestra 387 4XX-XXXX (ejemplo)
     | ok   la ficha no tiene links (el WhatsApp no es un link) (0)
     | ok   Cerrar la cierra
     | ok   al cerrar con el botón el foco vuelve al punto (data-comercio=1)
     | ok   Escape la cierra
     | ok   al cerrar con Escape el foco vuelve al punto (data-comercio=1)
     | ok   con Enter sobre el punto 6 abre Kiosco Los Primos
     | ok   Kiosco 24 horas dice Abierto ahora
     | ok   el foco vuelve al punto 6 (data-comercio=6)
     | ok   desde el directorio el foco vuelve a la ficha chica (ficha-mini)
PASS V9 mapa con 8 puntos, ficha, Cerrar/Escape y foco
     | ok   ningún link a WhatsApp en la página (0)
     | ok   hay botones Escribile por WhatsApp (9)
     | ok   ninguno es un link ni un botón que navegue
PASS V10 sin wa.me ni api.whatsapp en app y lib; los botones no son links
     | ok   a 1440 px el llamado dice "Publicá tu oferta" (Publicá tu oferta)
     | ok   "Publicá tu oferta" lleva a /#formulario con tipo comercio (http://localhost:3100/#formulario tipo=comercio)
     | ok   a 390 px el llamado dice "Publicá" (Publicá)
     | ok   "Publicá" lleva a /#formulario con tipo comercio (http://localhost:3100/#formulario tipo=comercio)
     | ok   a 1440 px el llamado dice "Sumá tu comercio" (Sumá tu comercio)
     | ok   "Sumá tu comercio" lleva a /#formulario con tipo comercio (http://localhost:3100/#formulario tipo=comercio)
PASS V11 los llamados a sumarse van a /#formulario con tipo comercio
PASS V12 / y /vidriera llevan el logo VS; no queda la V sola
     | ok   logo, buscador y Publicá en una fila (mismo top ±4 px) (top logo=68 buscador=66 boton=66)
     | ok   el botón dice Publicá (Publicá)
     | ok   scrollWidth <= 390 (390)
     | ok   con la ficha abierta scrollWidth <= 390 (390)
PASS V13 a 390 px el encabezado va en una fila y no hay desborde
PASS V14 / contiene un link a /vidriera
PEND V15 rúbrica de Edu en Ready to Release (capturas: npm run capturas)
PEND V16 revisión adversarial de otro modelo (hallazgos en la spec, Evidencia)
28 pasan · 0 fallan
```

Capturas (`npm run capturas`), en `docs/research/2026-10-27-capturas/`: `vidriera-390.png`, `vidriera-1440.png`,
`vidriera-ficha-390.png`, `vidriera-ficha-1440.png` (y `landing-390.png`, `landing-1440.png`, con el logo VS).
Los puntos del mapa a 390 px se revisaron ampliados (3x): legibles, ninguno toca las calles ni sus nombres; no se activó la condición de parada.

Desvíos respecto de la spec y del mock:

- V2: el h1 parte "a la vuelta" en un `<em>`; el chequeo busca los textos sobre el HTML sin etiquetas.
- Aviso de ejemplo: el mock decía "Mock de la vidriera · comercios, precios y direcciones de ejemplo"; va "Comercios y ofertas de ejemplo · los precios, direcciones y teléfonos son inventados" (lo exige V2).
- Bajada: "todas a menos de cinco cuadras" pasó a "todas a pocas cuadras" (decidido en la spec).
- El carrusel no anuncia sus cambios a lectores de pantalla (el mock tenía `aria-live="polite"` en el escenario): rotando cada 3 s lo repetiría sin parar. Las flechas y los puntos tienen `aria-label`.
- La ficha atrapa el foco (Tab) y el resto de la página queda `inert` mientras está abierta; el mock no lo hacía.
- Antes de montarse (HTML estático) las etiquetas de 2 o más días dicen "Esta semana" y no se muestra Abierto/Cerrado; al montarse en el navegador se completan con la hora de Salta.
- Se agregó un link "Ver la vidriera" al menú de la landing (V14).
- V15 y V16 quedan pendientes: V15 es de Edu; V16 la corre la sesión supervisora.

Revisión adversarial (V16): hecha. La corrió la sesión supervisora con otro modelo (Sonnet); no encontró nada bloqueante. Hallazgos y destino:

Corregidos (en el commit que cierra la rama, el último de `spec-004`):

1. V11 no estaba implementado de verdad: `LeadForm` ya arrancaba en `comercio` y los links eran `/#formulario`. Ahora los tres llamados van a `/?tipo=comercio#formulario`, `LeadForm` lee `?tipo=` (solo `comercio` o `vecino`, lo demás se ignora) junto con `fuente`, y el eval prueba que la landing con `?tipo=vecino` queda en `vecino` (el valor por defecto no tapa nada), que el `href` de cada llamado lleva `tipo=comercio` y que al seguirlo queda `comercio`. Falla si el link no fija nada.
2. Carrusel con 0 o 1 ofertas que vencen hoy: `Carrusel` ahora dibuja el bloque entero, con el rótulo "Vencen hoy · no te las pierdas". Con 0 no queda nada; con 1 muestra la tarjeta sin flechas ni puntitos. Cubierto por `app/vidriera/Carrusel.test.ts` (0, 1 y 3 ofertas), corrido en `run.sh` como V8.
3. "Vence hoy" tenía dos reglas (`vence === 0` y `vence <= 0`). Ahora es una: `venceHoy`, `estaVigente` y `vigentes` en `lib/vidriera.ts`; una oferta con `vence < 0` está vencida y no se muestra (ni en contadores, filtros, carrusel, directorio ni ficha). Test con `vence: -1` en `lib/vidriera.test.ts` (prefijo V4).
4. La grilla ya no es `aria-live`: el aviso en vivo es un texto corto con el conteo ("8 ofertas", "1 oferta", "Nada por acá, por ahora"), oculto a la vista. Chequeado en V7.

Descartados, con su motivo:

- La trampa de Tab con un solo elemento enfocable en la ficha: está documentada y es correcta hoy; se revisa cuando la ficha tenga un link real de WhatsApp.
- Que la búsqueda mire también el texto de la nota de la oferta: lo permite la spec (el mock busca en producto, comercio, rubro y nota).
- El refresco cada 60 s de "ahora": es lo que mantiene Abierto/Cerrado al día sin recargar y su costo es nulo.
- El grep literal de V10: lo cubren el chequeo sobre el HTML renderizado (ningún `href` a WhatsApp) y el de Playwright (ningún botón navega).
- Que V9 compare solo el contorno de la zona: es lo que pide la spec ("mismo `path` del contorno").
- La circularidad de V1 (cuenta los chequeos previos de la misma corrida): aceptable, los previos son los chequeos de las specs anteriores.

