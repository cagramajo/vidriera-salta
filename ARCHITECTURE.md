# vidriera-salta — Arquitectura (as-built)

> Describe lo construido, nunca lo planeado — lo que falta vive en `specs/`.

## Stack

| Pieza | Versión / detalle |
|---|---|
| Framework | Next.js 16.4.2, App Router, TypeScript |
| UI | React 19.3.1, CSS propio (`app/globals.css`) con los tokens Yungas como variables CSS |
| Tipografía | Archivo vía `next/font/google`, eje `wdth` (peso variable) |
| Base de datos | Supabase, vía `@supabase/supabase-js`. Sin proyecto creado: la migración está escrita, no aplicada |
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
| `evals/run.sh` | Un chequeo por criterio C1–C12; levanta y baja su propio servidor en el puerto 3100 |
| `evals/check-mobile.mjs` | C12, con Playwright |
| `scripts/capturas.mjs` | `npm run capturas`: capturas a 390 y 1440 px en `docs/research/<fecha>-capturas/` (servidor propio en el puerto 3101) |

## Flujos

- Los botones "Sumá tu comercio" / "Quiero ver las ofertas" / "Avisame cuando arranque" son `ElegirTipo`: disparan el evento `vs:tipo` en `window`; `LeadForm` lo escucha y fija `tipo`.
- `fuente` se lee de `?fuente=` en el navegador (`useEffect`), así la página sigue siendo estática. Se normaliza en el servidor.
- `POST /api/leads`, en este orden: JSON inválido o campo inválido → 400; campo trampa `empresa` lleno → 200 `{"ok":true}` sin tocar la base; sin `SUPABASE_URL`/`SUPABASE_ANON_KEY` → 503; insert; error `23505` → 200 `{"ok":true}`; otro error → 500.
- El insert no pide la fila de vuelta: la tabla no tiene policy de select.
- El campo trampa va fuera de pantalla (`.trampa`), con `tabindex="-1"`, `autocomplete="off"` y `aria-hidden="true"`.

## Entorno

`.env.example` nombra `SUPABASE_URL` y `SUPABASE_ANON_KEY`, sin valores. `npm start` sirve en el puerto 3100.
