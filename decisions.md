# vidriera-salta — Decisiones

> Append-only: acá no se corrige nada. Cuatro campos por decisión — el formato está en
> `CLAUDE.md`.

## 2026-10-18 · [spec 001] El servidor de los evals se lanza con node directo, no con `npm start`

**Qué se decide**: `evals/run.sh` y `scripts/capturas.mjs` ejecutan `node node_modules/next/dist/bin/next start -p <puerto>` y matan ese proceso.
**Por qué**: `npm start` crea un proceso hijo que en Windows sobrevive a `kill` sobre el PID del padre; con node directo el PID guardado es el del servidor y no queda nada colgado. El resultado es el mismo servidor de producción en el puerto 3100.
**La invalidaría**: que `npm start` pase a bajarse completo con una sola señal en esta máquina.

## 2026-10-18 · [spec 001] El filtro de secretos de C11 excluye `specs/` y escribe el patrón partido

**Qué se decide**: `git grep` de C11 excluye `specs/`, y `evals/run.sh` escribe `service''_role` y `sb_secret''_` partidos.
**Por qué**: el texto de la spec nombra esos patrones y el propio script los contiene; sin esto el chequeo se encuentra a sí mismo y nunca pasa. Ningún otro archivo versionado los contiene.
**La invalidaría**: que la spec deje de nombrar los patrones literales.

## 2026-10-18 · [spec 001] La validación del formulario es propia, con errores por campo, y el servidor repite las mismas reglas

**Qué se decide**: el formulario usa `noValidate` y mensajes en voseo bajo cada campo; `lib/leads.ts` valida de nuevo en el servidor (email = algo con `@`, nombre de 1 a 120 caracteres, email hasta 254).
**Por qué**: C6 fija la regla del servidor (email sin `@` → 400); el cliente usa la misma regla para que no haya envíos que el servidor rechace.
**La invalidaría**: que aparezcan leads con emails inválidos que exijan una regla más estricta.

## 2026-10-18 · [spec 001] El email se guarda en minúsculas y sin espacios

**Qué se decide**: `validarLead` aplica `trim().toLowerCase()` al email antes de insertar.
**Por qué**: la columna `email` es única; sin normalizar, `Ana@x.com` y `ana@x.com` serían dos altas.
**La invalidaría**: que un proveedor de email distinga mayúsculas en la parte local y eso cause pérdidas reales.

## 2026-10-18 · [spec 001] TypeScript 7.0.2, Vitest 5.0.5 y Playwright 1.64.1, las últimas estables

**Qué se decide**: se fijan las últimas versiones estables al implementar (ver `package-lock.json`); incluye TypeScript 7.0.2.
**Por qué**: la spec delega la elección a la última estable de cada una y la compilación (C1) pasa con ellas.
**La invalidaría**: que una herramienta de Next.js deje de funcionar con TypeScript 7.
