# vidriera-salta — Arquitectura (as-built)

> Describe lo construido, nunca lo planeado — lo que falta vive en `specs/`.

## Stack

| Pieza | Versión / detalle |
|---|---|
| Framework | Next.js 16.4.2, App Router, TypeScript |
| UI | React 19.3.1, CSS propio (`app/globals.css`) con los tokens Yungas como variables CSS |
| Tipografía | Archivo vía `next/font/google`, eje `wdth` (peso variable) |
| Base de datos | Supabase, vía `@supabase/supabase-js`. Proyecto `vidriera-salta` (`lywucenqxjqjxfzrzrth`, región `sa-east-1`, plan gratis) con `001_leads` aplicada |
| Publicación | Vercel, proyecto `vidriera-salta` (equipo `vidriera-tech`) enlazado a `cagramajo/vidriera-salta`; producción en https://vidriera-salta.vercel.app, rama de producción `main` |
| Tests | Vitest (`lib/*.test.ts`), Playwright (C12, `evals/check-vidriera.mjs` y capturas) |

## Estructura

| Ruta | Qué es |
|---|---|
| `app/layout.tsx` | `<html lang="es">`, fuente, metadata |
| `app/page.tsx` | Página única: encabezado, inicio, problema, cómo funciona, precios, vecinos, formulario, pie |
| `app/components/` | Una pieza por sección de la landing. `LeadForm.tsx` y `ElegirTipo.tsx` son los únicos client components de la landing. `ZonaMapa.tsx`: el `<svg>` aprobado de la zona, compartido por la landing y la vidriera (acepta `children` dibujados encima) |
| `app/vidriera/` | `/vidriera`: `page.tsx` (servidor, metadata), `VidrieraApp.tsx` (client: buscador, filtros, mapa, directorio), `Carrusel.tsx`, `Oferta.tsx`, `Ficha.tsx`, `vidriera.css` |
| `lib/vidriera-ejemplo.ts` | Los 8 comercios y 8 ofertas de ejemplo, en el código; `vence` en días desde hoy; campos iguales a las tablas futuras |
| `lib/vidriera.ts` | `etiquetaVence`, `fechaLarga`, `estaAbierto` (hora de `America/Argentina/Salta`), `contadores`, `filtrarOfertas`, `cuadras` |
| `app/api/leads/route.ts` | `POST /api/leads` |
| `lib/fuente.ts` | `normalizarFuente`: solo `[a-z0-9]` con guiones internos, menos de 60 caracteres; si no, `directo` |
| `lib/leads.ts` | `validarLead`: valida el cuerpo y detecta el campo trampa |
| `supabase/migrations/001_leads.sql` | Tabla `leads`, RLS, una policy de insert para `anon` |
| `evals/run.sh` | Un chequeo por criterio C1–C12, D2–D3 y V1–V14 (V15 y V16 salen como PEND); levanta y baja su propio servidor en el puerto 3100. Sin red |
| `evals/casos.sh` | Las listas que comparten `run.sh` y `prod.sh`: las 15 cadenas de C3, los 5 casos de C6, la trampa de C7 |
| `evals/prod.sh` | Chequeos P4, P5, P6, P7, P8 y P11 contra `PROD_URL`. P6/P7 en dos pasos (ver Entorno) |
| `evals/check-mobile.mjs` | C12, con Playwright |
| `evals/check-vidriera.mjs` | V7, V8, V9, V10, V11 y V13, con Playwright: `node evals/check-vidriera.mjs <caso> <url-base>` |
| `scripts/capturas.mjs` | `npm run capturas`: capturas de la landing y de `/vidriera` (con y sin ficha abierta) a 390 y 1440 px en `docs/research/<fecha>-capturas/` (servidor propio en el puerto 3101) |

## Flujos

- Los botones "Sumá tu comercio" / "Quiero ver las ofertas" / "Avisame cuando arranque" son `ElegirTipo`: disparan el evento `vs:tipo` en `window`; `LeadForm` lo escucha y fija `tipo`.
- `fuente` se lee de `?fuente=` en el navegador (`useEffect`), así la página sigue siendo estática. Se normaliza en el servidor.
- `POST /api/leads`, en este orden: JSON inválido o campo inválido → 400; campo trampa `empresa` lleno → 200 `{"ok":true}` sin tocar la base; sin `SUPABASE_URL`/`SUPABASE_ANON_KEY` → 503; insert; error `23505` → 200 `{"ok":true}`; otro error → 500.
- El insert no pide la fila de vuelta: la tabla no tiene policy de select.
- Mapa de la zona (`Neighbors.tsx`, `.zona__*` en `globals.css`): `<svg>` inline con `role="img"` y `aria-label`, copia del dibujo aprobado `docs/design/mapa-zona.svg` (fuente de verdad). Recuadro apaisado 1740 × 860; contorno punteado `--monte` con relleno `--niebla`, sin cuadrícula; Felipe Varela y Rosas (solo hasta el cruce) en `#f59bbe`; punto lapacho claro en el cruce; rótulos en Archivo (la fuente de la página, por `--fuente-archivo`), los del borde abreviados (J. V. González, Á. Vargas, Chalimín, Fortín Cerrillos, Castillo). Los textos dicen "a pocas cuadras".
- El campo trampa va fuera de pantalla (`.trampa`), con `tabindex="-1"`, `autocomplete="off"` y `aria-hidden="true"`.

- `/vidriera`: página estática. "Hoy" y "ahora" se calculan en el navegador, en hora de Salta, tras montar (`data-listo="si"` en `.vd`); antes, las etiquetas de 2 o más días dicen "Esta semana" y no se muestra Abierto/Cerrado. El estado (búsqueda, rubro, solo hoy, ficha abierta) vive en `VidrieraApp`.
- Mapa de la vidriera: `ZonaMapa` con una capa de puntos encima (`.pin`, círculo de 40 unidades y área táctil de 64, número del comercio); `.pin--oferta` si el comercio tiene alguna oferta visible con los filtros.
- Ficha del comercio: `role="dialog"` fuera de `.pagina` (su `container-type` rompería el `position: fixed`); con la ficha abierta la página queda `inert`, el carrusel se pausa y al cerrar (botón, velo o Escape) el foco vuelve al elemento que la abrió.
- Los botones "Escribile por WhatsApp" de la vidriera son `<span>`, no links: los comercios son de ejemplo y no hay ningún número real en el repo. La ficha muestra `387 4XX-XXXX (ejemplo)`.
- "Publicá", "Publicá tu oferta" y "Sumá tu comercio" de la vidriera son links a `/#formulario`; el formulario arranca en `comercio`.

## Entorno

`SUPABASE_URL` y `SUPABASE_ANON_KEY` están cargadas en Vercel solo en Production; las previews de ramas quedan sin base y el formulario responde 503 ahí. La clave es la pública. Cada merge a `main` se publica solo.

`evals/prod.sh`: paso 1 `PROD_URL=<url> evals/prod.sh` manda un lead `prueba-auto-<timestamp>@example.com` y su repetición, e imprime el email y la consulta de conteo; paso 2 `PRUEBA_EMAIL=<email> LEADS_COUNT=<n> evals/prod.sh` evalúa el conteo (debe ser 1). P8 pide `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` por variable de entorno. P1, P2, P3, P9 y P10 los verifica la sesión del brain con sus conexiones.

`.env.example` nombra `SUPABASE_URL` y `SUPABASE_ANON_KEY`, sin valores. `npm start` sirve en el puerto 3100.
