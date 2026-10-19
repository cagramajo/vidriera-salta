---
status: pendiente
depends_on: [002]
---

# 003 — Mapa real del barrio y "a pocas cuadras"

Reemplazar el esquema del cruce por el mapa de la zona aprobado por Edu (boceto B) y cambiar
"5 cuadras" por "a pocas cuadras" en toda la landing, para que los vecinos reconozcan su barrio.

**Tipo:** feature · **Flujo:** requirements-first · **Gate 1:** aprobada por Edu el 2026-10-19

## Estado previo

- `main` después del merge de la spec 002 (rama `spec-002`, `d857be7`): mapa rotado de P13 en
  `app/components/Neighbors.tsx` + `app/globals.css` (calles con `div`, cuadrícula de fondo, recuadro cuadrado).
  Si la 002 todavía no está mergeada, la rama de esta spec nace de `spec-002`.
- Textos con "5 cuadras": `Hero.tsx:8`, `Neighbors.tsx:12`, `:18` (aria-label), `:29` (pie);
  `docs/design/handoff-landing.md:63`, `:94`, `:98`. "a 2 cuadras de la esquina" (publicación de ejemplo) no se toca.

## Entradas

| Archivo | Qué es |
|---|---|
| `docs/design/mapa-zona.svg` | El mapa aprobado (boceto B, 2026-10-19): la fuente de verdad del dibujo |
| `docs/design/mapa-zona-boceto.png` | Captura del boceto aprobado, en escritorio y celular |

## Criterios de aceptación

| # | Criterio | Eval |
|---|---|---|
| D1 | No se rompe nada | `evals/run.sh`: todos pasan |
| D2 | No queda "5 cuadras" | `git grep -n "5 cuadras" -- app docs/design/handoff-landing.md` no devuelve nada; `curl localhost:3100/` contiene `A pocas cuadras de Juan Manuel de Rosas y Felipe Varela`, `a pocas cuadras` y `La zona de Vidriera Salta, a pocas cuadras del cruce. Esquema, no a escala.` |
| D3 | El mapa es el SVG aprobado | La página contiene un `<svg` con `role="img"` y un `aria-label` que nombra Juan Manuel de Rosas y Felipe Varela; no queda ninguna clase `zona__calle` en `app/`; el CSS o el SVG compilado usa `#f59bbe` para las calles y no hay cuadrícula de fondo en `.zona__mapa` |
| D4 | En celular no se desborda | C12: a 390 px, `scrollWidth <= 390` |
| D5 | Se ve como el boceto | **Rúbrica** (Edu en Gate 2, sobre las capturas de `npm run capturas`, sí/no): (a) contorno verde monte punteado con relleno niebla y sin cuadrícula; (b) Felipe Varela y Rosas en lapacho claro, Rosas solo de Joaquín V. González al cruce; (c) punto lapacho claro en el cruce; (d) nombres de las calles principales y del borde, sin superponerse; (e) recuadro apaisado, no cuadrado; (f) se parece al boceto aprobado |
| D6 | El handoff lo describe igual | `handoff-landing.md` describe el mapa nuevo y los textos con "a pocas cuadras" |

## Decisiones

### Cerradas antes de delegar

- DECIDIDO por Edu (2026-10-19): el mapa sigue la zona real de su marca sobre Google Maps:
  contorno (Joaquín V. González, Fortín Pacto de los Cerrillos, Castillo, Juan Chalimín,
  Ángel Vargas, avenida del oeste), Felipe Varela y Rosas hasta el cruce, sin cuadrícula y
  sin lugares de referencia.
- DECIDIDO por Edu (2026-10-19): calles en lapacho claro (#F59BBE), opción B entre dos.
- DECIDIDO por Edu (2026-10-19): "5 cuadras" pasa a "a pocas cuadras".
- No se usa la captura de Google Maps en la página: es un dibujo propio.

### Delegadas al agente, con su criterio

- Cómo se inserta el SVG (inline en el componente o importado): el que mantenga la tipografía
  Archivo de la página y no agregue dependencias.

### Condiciones de parada

- Si a 390 px los nombres del borde quedan ilegibles o se superponen: se para y se muestra la
  captura, Edu decide si se ocultan en celular.

## Efectos que escapan del sistema

Ninguno hasta el merge. Al mergear y subir a GitHub, Vercel publica solo (con OK de Edu).

## Fuera de alcance

| Qué | Lo trae de vuelta |
|---|---|
| Lugares de referencia en el mapa | Que Edu lo pida |
| Mapa interactivo (Google Maps embebido) | Fichas de comercios con dirección |
