---
status: esperando Gate 1
depends_on: []
---

# 001 — Landing de Vidriera Salta con captura de leads

Construir la landing de Vidriera Salta tal como está diseñada, con el formulario que le habla a
comercios y vecinos y guarda cada lead en Supabase. Esta spec deja todo listo y probado en local;
crear la base real y publicar en Vercel es la spec 002.

**Tipo:** feature · **Flujo:** requirements-first

## Estado previo

- `main` en `a012f4d`: solo el scaffold del repo (CLAUDE.md, ARCHITECTURE.md vacío, decisions.md
  vacío, `evals/run.sh` sin chequeos). No hay código.
- Qué se construye y por qué: el PRD, en el brain que montó este repo
  (`workspaces/curso-ai-first-product-builder/products/vidriera-salta/research/2026-10-15-prd.md`).
  Esta spec repite lo que la implementación necesita: no hace falta leerlo.
- El diseño aprobado está en `docs/design/` (lo trae esta spec, ver Entradas).

## Entradas

| Archivo | Qué es |
|---|---|
| `docs/design/handoff-landing.md` | Tokens, componentes, secciones y textos: la fuente de verdad del diseño |
| `docs/design/landing.dc.html` | El prototipo aprobado de la landing (referencia visual y de textos) |
| `docs/design/design-system.dc.html` | El design system aprobado |

Ante una diferencia entre el prototipo y el handoff, gana el handoff.

## Criterios de aceptación

Cada criterio tiene su chequeo en `evals/run.sh`. Un servidor de producción local (`npm run build`
+ `npm start` en el puerto 3100, sin variables de Supabase) es el entorno de los evals C3–C8.

| # | Criterio | Eval |
|---|---|---|
| C1 | El proyecto compila sin errores | `npm ci && npm run build` sale con 0 |
| C2 | Los tests unitarios pasan | `npm test` sale con 0 |
| C3 | La página tiene todas las secciones y textos del handoff | `curl -s localhost:3100/` contiene, cada uno: `lang="es"`, `El cartel de tu vereda, en el celular de todo el barrio`, `Sumá tu comercio`, `Quiero ver las ofertas`, `Tu cartel solo lo ve quien pasa por la puerta`, `Nosotros hacemos el trabajo`, `Probalo un mes sin pagar nada`, `$5.000`, `$10.000`, `Enterate de lo que hay a la vuelta`, `Juan Manuel de Rosas`, `Felipe Varela`, `Dejanos tus datos`, `Privacidad` |
| C4 | El formulario tiene sus campos con etiqueta | El HTML contiene `name="nombre"`, `name="email"`, `name="consentimiento"`, `name="tipo"`, `name="fuente"` y un `<label for=` por cada campo visible (nombre, email, consentimiento) |
| C5 | Los colores son los de la paleta Yungas | Los estilos compilados (`.next/static/**/*.css`) contienen `#1f4d35`, `#d63a73`, `#f59bbe`, `#eef3ea`, `#12241a` (sin distinguir mayúsculas) |
| C6 | El endpoint rechaza lo inválido | `POST /api/leads` con JSON responde **400** en cada caso: sin `consentimiento`; `consentimiento: false`; email sin `@`; `nombre` vacío; `tipo` distinto de `comercio`/`vecino` |
| C7 | El filtro anti-spam corta antes de la base | `POST /api/leads` válido con el campo trampa `empresa` lleno responde **200** `{"ok":true}` aun sin variables de Supabase |
| C8 | Sin base configurada, un lead válido no se pierde en silencio | `POST /api/leads` válido sin variables de Supabase responde **503** |
| C9 | La fuente se toma del link y se limpia | Test unitario de `normalizarFuente`: `volante`, `sobrinos`, `whatsapp`, `directo`, `qr-almacen-gladis` pasan tal cual; vacío, `QR-X`, `qr-`, `<script>` y 60+ caracteres devuelven `directo` |
| C10 | La tabla de leads deja escribir y nunca leer | `supabase/migrations/001_leads.sql` contiene `enable row level security`, una policy `for insert` `to anon`, y **ninguna** policy `for select`, `for update`, `for delete` ni `for all` |
| C11 | Sin secretos en el repo | `git ls-files` no incluye `.env*` salvo `.env.example`; `git grep -nE 'eyJ[A-Za-z0-9_-]{20,}|service_role|sb_secret_'` no devuelve nada |
| C12 | Se ve bien en celular | Con Playwright a 390 px de ancho: `document.documentElement.scrollWidth <= 390` |
| C13 | Se ve como el diseño | Capturas a 390 y 1440 px en `docs/research/<fecha>-capturas/`. **Rúbrica** (la aplica Edu en Gate 2, sí/no cada punto): el inicio es verde monte con texto claro; el botón principal es lapacho; la guarda/sombras y bordes de 2 px están; la tipografía es Archivo angosta en títulos; ningún texto se corta ni se superpone; la publicación de ejemplo se ve inclinada |

## Qué construye

- **Next.js 16** (la última estable al implementar), App Router, TypeScript, CSS propio con los
  tokens como variables CSS. Sin framework de UI.
- **Tipografía:** Archivo vía `next/font/google`, con los ejes `wdth` y `wght`.
- **Página única** con las secciones del handoff, en este orden: encabezado, inicio, problema, cómo
  funciona, precios, vecinos y zona, formulario, pie.
- **Formulario:** selector "Tengo un comercio" / "Soy vecino" (fija `tipo`), nombre, email,
  consentimiento obligatorio, campo trampa `empresa` oculto a personas (no `display:none`: fuera de
  pantalla, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`). Los botones del inicio y
  de la sección vecinos preseleccionan el tipo. `fuente` sale de `?fuente=` de la URL.
- **Al enviar:** confirmación en la misma página ("¡Listo, te anotamos!", con el texto según el
  tipo). Error de red o 5xx: mensaje "No pudimos guardar tus datos. Probá de nuevo en un rato." y
  los datos quedan en el formulario.
- **`POST /api/leads`** (Route Handler): valida, corta por la trampa, normaliza `fuente`, e inserta
  con `@supabase/supabase-js` usando `SUPABASE_URL` y `SUPABASE_ANON_KEY` del entorno. Email
  repetido (error `23505`): responde 200 `{"ok":true}`, igual que un alta nueva.
- **`supabase/migrations/001_leads.sql`**: tabla `leads` (`id` uuid default, `nombre` text not
  null, `email` text not null unique, `tipo` text check in (`comercio`,`vecino`), `fuente` text not
  null default `directo`, `consentimiento` boolean not null check true, `fecha` timestamptz default
  now()), RLS activada, una sola policy de insert para `anon`. No se aplica en esta spec.
- **`.env.example`** con los nombres de las dos variables, sin valores.
- **`evals/run.sh`**: un chequeo por criterio C1–C12.
- **`npm run capturas`**: script de Playwright que guarda las capturas de C13.
- **`ARCHITECTURE.md`** con lo construido; **`decisions.md`** con las decisiones de abajo.

## Decisiones

### Cerradas antes de delegar

- DECIDIDO por Edu (PRD, 2026-10-15): leads en Supabase, no en Google Apps Script — deja una base
  real para fichas y publicaciones.
- DECIDIDO por Edu (2026-10-18): hosting en Vercel — lo pide el curso y tiene MCP oficial.
- DECIDIDO por Edu (2026-10-18): paleta Yungas y diseño del canvas, aprobados sin cambios.
- DECIDIDO por Edu (2026-10-18): Next.js — se crece hacia fichas y publicaciones sin rehacer.
- DECIDIDO por Edu (2026-10-18): la inserción pasa por un endpoint propio y no directo desde el
  navegador — permite validar y cortar spam antes de la base; la clave anon con RLS de solo
  insert es la segunda barrera.
- DECIDIDO por Edu (2026-10-18): email de contacto del aviso de privacidad: `echarly02@gmail.com` (personal, para esta versión).

### Delegadas al agente, con su criterio

- Estructura de carpetas y componentes: la que sea convencional en Next.js App Router.
- Versiones exactas de dependencias: la última estable de cada una al implementar, fijadas en
  `package-lock.json`.
- Cómo correr los evals con servidor: levantarlo y bajarlo dentro de `evals/run.sh`, sin dejar
  procesos colgados.
- Textos que el handoff no cubre (mensajes de error de campos): cortos, en voseo rioplatense,
  diciendo qué corregir.

### Condiciones de parada — el agente no decide, pregunta

- Si un criterio contradice al handoff o a otro criterio.
- Si hace falta una dependencia paga, una cuenta o una clave para cumplir algo.
- Si Playwright no puede instalar su navegador en esta máquina (C12/C13).
- Si cualquier paso exige tocar Supabase o Vercel reales.

## Efectos que escapan del sistema

Ninguno. Todo corre en local; no se crea la base, no se publica nada y no se manda ningún mensaje.

## Fuera de alcance

| Qué | Lo trae de vuelta |
|---|---|
| Crear el proyecto Supabase, aplicar la migración, publicar en Vercel | Spec 002, al aprobarse esta |
| Fichas de comercios y publicaciones reales | Que 2 comercios arranquen el mes gratis (meta del PRD) |
| Clasificados de vecinos | Comercios publicando con regularidad (PRD) |
| Panel para ver los leads | Más de 30 leads, o que Edu lo pida: hasta entonces, el dashboard de Supabase |
| Dominio propio | Primer pack cobrado |
