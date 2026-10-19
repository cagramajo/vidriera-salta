---
status: pendiente
depends_on: [001]
---

# 002 — Base real y publicación de la landing de Vidriera Salta

Crear la base de datos en Supabase, conectarla a la landing y publicarla en Vercel con una URL
pública. Al terminar, un lead que se deja en esa URL queda guardado en la base.

**Tipo:** feature · **Flujo:** requirements-first · **Gate 1:** aprobada por Edu el 2026-10-18

## Estado previo

- `main` en `e5045a3`: la landing de la spec 001 completa, 12/12 evals en local.
  `supabase/migrations/001_leads.sql` escrita y sin aplicar. Sin variables, `POST /api/leads` responde 503.
- Supabase (2026-10-18): organización "Vidriera Salta" (`pgxqrrjmewvzmfrbahim`), sin proyectos.
- Vercel (2026-10-18): cuenta personal, sin equipos ni proyectos.
- Repo público: https://github.com/cagramajo/vidriera-salta

## Quién hace cada parte

| Parte | Quién | Dónde |
|---|---|---|
| A. Crear el proyecto Supabase y aplicar la migración | Sesión del brain (conexión Supabase), después del Gate 1 | Supabase |
| B. Proyecto Vercel conectado al repo, variables de entorno, primera publicación | Sesión del brain (conexión Vercel), con OK de Edu en el momento de publicar | Vercel |
| C. Evals contra la URL pública, `ARCHITECTURE.md`, `decisions.md` | Agente `complete-spec`, en su worktree, rama `spec-002` | Repo |
| D. Pruebas a mano (P12) | Edu | Celular y panel de Supabase |

## Criterios de aceptación

`PROD_URL` es la URL pública que devuelve B. Los chequeos de producción viven en `evals/prod.sh`
(`PROD_URL=… evals/prod.sh`). `evals/run.sh` sigue corriendo en local sin red.

| # | Criterio | Eval |
|---|---|---|
| P1 | La base existe en São Paulo, plan gratis | `list_projects`: `vidriera-salta`, región `sa-east-1`, estado `ACTIVE_HEALTHY` |
| P2 | La migración está aplicada | `list_tables`: `public.leads` con RLS activada; `list_migrations` incluye `001_leads` |
| P3 | Sin alertas de seguridad graves | `get_advisors` (security): ningún aviso de nivel `ERROR` |
| P4 | La URL pública muestra la landing | `curl $PROD_URL` → 200 y contiene las 15 cadenas de C3 de la spec 001 |
| P5 | En producción se rechaza lo inválido | Los 5 casos de C6 → 400; la trampa `empresa` llena → 200 `{"ok":true}` |
| P6 | Un lead válido queda guardado | `POST $PROD_URL/api/leads` con `prueba-auto-<timestamp>@example.com` → 200; `select count(*) from leads where email = …` → 1 |
| P7 | Un email repetido no duplica ni falla | Reenviar el mismo de P6 → 200 `{"ok":true}`; el conteo sigue en 1 |
| P8 | Desde afuera, la tabla no se puede leer | `GET <SUPABASE_URL>/rest/v1/leads?select=*` con la clave pública → cuerpo `[]` |
| P9 | Las claves están en Vercel y no en el repo | Variables del proyecto: `SUPABASE_URL` y `SUPABASE_ANON_KEY` solo en Production; la clave es la pública (anon/publishable), nunca `service_role` ni `sb_secret_`; C11 de la 001 sigue en verde |
| P10 | Cada merge a `main` se publica solo | `get_project`: enlazado a `cagramajo/vidriera-salta`, rama de producción `main` |
| P11 | En celular se ve bien en producción | Playwright a 390 px sobre `$PROD_URL`: `scrollWidth <= 390` |
| P12 | Edu lo prueba a mano | **Rúbrica** (sí/no cada punto, con emails que empiezan con `prueba-`): (a) desde el celular, la URL carga y se ve como el diseño; (b) anotarse como comercio con `?fuente=volante` → confirmación de comercio; (c) como vecino → confirmación de vecino; (d) repetir un email → la misma confirmación, sin error; (e) en el panel de Supabase están sus filas con `tipo` y `fuente` correctos; (f) el link compartido por WhatsApp abre bien |

## Decisiones

### Cerradas antes de delegar

- DECIDIDO por Edu (2026-10-18): región São Paulo — Supabase no ofrece Buenos Aires; es la única de Sudamérica.
- DECIDIDO por Edu (2026-10-18): Vercel conectado al repo de GitHub, con publicación automática desde `main`.
- DECIDIDO por Edu (2026-10-18): los leads de prueba no se borran al terminar; quedan para sus pruebas y se limpian cuando él lo pida (`delete from leads where email like 'prueba-%'`).
- DECIDIDO por Edu (2026-10-18): crear la base y publicar lo hace la sesión del brain; el repo, un agente en rama.
- DECIDIDO por Edu (2026-10-18): las variables solo en Production; las previews de ramas quedan sin base (el formulario responde 503 ahí).

### Delegadas al agente, con su criterio

- Cómo `evals/prod.sh` reutiliza los chequeos de `run.sh`: sin duplicar las listas de cadenas ni de casos.
- Cómo P6 lee el conteo: por un parámetro que le pasa la sesión del brain, nunca con una clave secreta en el repo.

### Condiciones de parada — se pregunta

- Si Vercel pide autorizar su app en GitHub (lo hace Edu en el navegador).
- Si cualquier paso tiene costo mayor a $0.
- Si `vidriera-salta` está tomado como nombre en Vercel.
- Si el insert falla con la clave pública que da Supabase.

## Efectos que escapan del sistema

- **Una URL pública**: cualquiera puede verla y los buscadores pueden indexarla. Se publica con OK de Edu en el momento.
- **Datos de prueba en una base real**: contenidos con el prefijo `prueba-` y el dominio `example.com`, reservado (nadie los recibe). No se manda ningún mail.
- **Proyecto Supabase y Vercel creados**: plan gratis, $0.

## Fuera de alcance

| Qué | Lo trae de vuelta |
|---|---|
| Evitar la pausa de Supabase a los 7 días sin actividad | Salir con los volantes (con tráfico real, una base pausada rompe el formulario) |
| Dominio propio | Primer pack cobrado |
| Panel para ver los leads | Más de 30 leads, o que Edu lo pida |
| Base en las previews de ramas | Que una spec necesite probar con datos en una rama |
