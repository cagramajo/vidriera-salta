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
| Tests | Vitest (`lib/*.test.ts`), Playwright (C12 y capturas) |

## Estructura

| Ruta | Qué es |
|---|---|
| `app/layout.tsx` | `<html lang="es">`, fuente, metadata |
| `app/page.tsx` | Página única: encabezado, inicio, problema, cómo funciona, precios, vecinos, formulario, pie |
| `app/components/` | Una pieza por sección. `LeadForm.tsx` y `ElegirTipo.tsx` son los únicos client components |
| `app/api/leads/route.ts` | `POST /api/leads` |
| `lib/fuente.ts` | `normalizarFuente`: solo `[a-z0-9]` con guiones internos, menos de 60 caracteres; si no, `directo` |
| `lib/leads.ts` | `validarLead`: valida el cuerpo y detecta el campo trampa |
| `supabase/migrations/001_leads.sql` | Tabla `leads`, RLS, una policy de insert para `anon` |
| `evals/run.sh` | Un chequeo por criterio C1–C12; levanta y baja su propio servidor en el puerto 3100. Sin red |
| `evals/casos.sh` | Las listas que comparten `run.sh` y `prod.sh`: las 15 cadenas de C3, los 5 casos de C6, la trampa de C7 |
| `evals/prod.sh` | Chequeos P4, P5, P6, P7, P8 y P11 contra `PROD_URL`. P6/P7 en dos pasos (ver Entorno) |
| `evals/check-mobile.mjs` | C12, con Playwright |
| `scripts/capturas.mjs` | `npm run capturas`: capturas a 390 y 1440 px en `docs/research/<fecha>-capturas/` (servidor propio en el puerto 3101) |

## Flujos

- Los botones "Sumá tu comercio" / "Quiero ver las ofertas" / "Avisame cuando arranque" son `ElegirTipo`: disparan el evento `vs:tipo` en `window`; `LeadForm` lo escucha y fija `tipo`.
- `fuente` se lee de `?fuente=` en el navegador (`useEffect`), así la página sigue siendo estática. Se normaliza en el servidor.
- `POST /api/leads`, en este orden: JSON inválido o campo inválido → 400; campo trampa `empresa` lleno → 200 `{"ok":true}` sin tocar la base; sin `SUPABASE_URL`/`SUPABASE_ANON_KEY` → 503; insert; error `23505` → 200 `{"ok":true}`; otro error → 500.
- El insert no pide la fila de vuelta: la tabla no tiene policy de select.
- Mapa de la zona (`Neighbors.tsx`, `.zona__*` en `globals.css`): Felipe Varela horizontal, remarcada de punta a punta; J. M. de Rosas vertical, remarcada del borde de arriba hasta el cruce y, debajo, una línea común de la cuadrícula (`.zona__calle-comun`); el punto lapacho va en el cruce.
- El campo trampa va fuera de pantalla (`.trampa`), con `tabindex="-1"`, `autocomplete="off"` y `aria-hidden="true"`.

## Entorno

`SUPABASE_URL` y `SUPABASE_ANON_KEY` están cargadas en Vercel solo en Production; las previews de ramas quedan sin base y el formulario responde 503 ahí. La clave es la pública. Cada merge a `main` se publica solo.

`evals/prod.sh`: paso 1 `PROD_URL=<url> evals/prod.sh` manda un lead `prueba-auto-<timestamp>@example.com` y su repetición, e imprime el email y la consulta de conteo; paso 2 `PRUEBA_EMAIL=<email> LEADS_COUNT=<n> evals/prod.sh` evalúa el conteo (debe ser 1). P8 pide `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` por variable de entorno. P1, P2, P3, P9 y P10 los verifica la sesión del brain con sus conexiones.

`.env.example` nombra `SUPABASE_URL` y `SUPABASE_ANON_KEY`, sin valores. `npm start` sirve en el puerto 3100.
