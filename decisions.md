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

## 2026-10-18 · [spec 002] Las listas de C3, C6 y C7 viven en `evals/casos.sh` y las leen `run.sh` y `prod.sh`

**Qué se decide**: las 15 cadenas, los 5 casos inválidos y la trampa se definen una vez en `evals/casos.sh`; los dos scripts lo cargan con `.`.
**Por qué**: la spec pide que los chequeos de producción no dupliquen las listas de local; una sola fuente evita que diverjan.
**La invalidaría**: que producción necesite casos o cadenas distintas de las de local.

## 2026-10-18 · [spec 002] P6/P7 se evalúan en dos pasos: el script manda y la sesión del brain cuenta

**Qué se decide**: `evals/prod.sh` manda el lead y su repetición e imprime el email y la consulta; el conteo vuelve por `PRUEBA_EMAIL` y `LEADS_COUNT` en una segunda corrida que no manda nada. P8 recibe `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` por variable de entorno.
**Por qué**: contar filas exige leer la base, y el repo no puede tener ninguna clave (C11); la sesión del brain tiene la conexión y pasa el resultado como parámetro. Lo que falta queda como PEND, que no cuenta como falla pero tampoco como pasa.
**La invalidaría**: que la tabla gane una policy de select acotada que permita contar con la clave pública.

## 2026-10-18 · [spec 002] El mapa de la zona rota las calles; debajo del cruce, Rosas es una línea común de la cuadrícula

**Qué se decide**: Felipe Varela horizontal y J. M. de Rosas vertical; Rosas remarcada solo del borde de arriba al cruce, y debajo una línea de 4 px del color de la cuadrícula. `landing.dc.html` (diseño fuente) no se toca y queda con el mapa anterior.
**Por qué**: lo decidió Edu el 2026-10-18 (P13) y gana sobre el handoff; la línea común mantiene la continuidad de Rosas sin remarcarla.
**Reemplaza a**: la descripción del mapa en `docs/design/handoff-landing.md` de la spec 001.
**La invalidaría**: que la rúbrica de Edu rechace el mapa o que la calle real tenga otro trazado.

## 2026-10-19 · [spec 003] El mapa de la zona es un SVG inline en el componente, con estilos en `globals.css`

**Qué se decide**: `Neighbors.tsx` contiene el `<svg>` copiado de `docs/design/mapa-zona.svg`; sus estilos son clases `.zona__*` de `globals.css` y la tipografía es `var(--fuente-archivo)`. Si el dibujo cambia, se cambia el SVG de `docs/design` y se copia al componente.
**Por qué**: un SVG importado como imagen no hereda la fuente Archivo de la página; inline la hereda y no agrega dependencias. El archivo de `docs/design` queda como fuente de verdad del dibujo.
**La invalidaría**: que el dibujo pase a generarse o a cambiar seguido, o que haya más de un mapa en la página.

## 2026-10-19 · [spec 003] La landing dice "a pocas cuadras", no un número de cuadras

**Qué se decide**: todos los textos de la landing y del handoff usan "a pocas cuadras"; "a 2 cuadras de la esquina" de la publicación de ejemplo no se toca. `docs/design/landing.dc.html` (diseño original) conserva el texto viejo.
**Por qué**: Edu lo decidió el 2026-10-19; el mapa real no tiene escala y un número prometía una distancia que el dibujo no muestra.
**La invalidaría**: que haya un radio de cobertura medido que se quiera comunicar.

## 2026-10-19 · [spec 003] Los nombres del borde del mapa van abreviados y a 50 unidades de dibujo, en todas las pantallas

**Qué se decide**: los rótulos del borde dicen "J. V. González", "Fortín Cerrillos", "Chalimín", "Á. Vargas" y "Castillo", en Archivo 700 a 50 unidades del viewBox; el mismo texto en `docs/design/mapa-zona.svg` y en `Neighbors.tsx`.
**Por qué**: con los nombres completos a 38 unidades medían unos 7,6 px a 390 px y no se leían; abreviados caben a 50 unidades (unos 10 px) sin pisarse entre sí, con las calles rosas ni con el punto. Lo decidió Edu el 2026-10-19 al ver las capturas.
**Reemplaza a**: el texto de los rótulos del dibujo aprobado en el boceto B (nombres completos).
**La invalidaría**: que el mapa se agrande en celular o se pase a un dibujo con más espacio para los rótulos.
