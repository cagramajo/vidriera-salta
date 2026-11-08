#!/usr/bin/env bash
# Los evals del repo — un chequeo por criterio de aceptación de cada spec. Se corre: `evals/run.sh`
set -u

cd "$(dirname "$0")/.." || exit 1

passed=0
failed=0
ok() { printf 'PASS %s\n' "$1"; passed=$((passed + 1)); }
ko() { printf 'FAIL %s\n' "$1"; failed=$((failed + 1)); }
ev() { printf '     | %s\n' "$1"; }
pend() { printf 'PEND %s\n' "$1"; }

# shellcheck source=evals/casos.sh
. "$(dirname "$0")/casos.sh"

PORT=3100
BASE="http://localhost:$PORT"
SERVER_PID=""
TMP="$(mktemp -d)"

stop_server() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    SERVER_PID=""
  fi
  rm -rf "$TMP"
}
trap stop_server EXIT

# contiene <archivo> <texto>...: cada texto aparece tal cual; devuelve los que faltan en $MISSING
contiene() {
  local file="$1"; shift
  MISSING=""
  for t in "$@"; do
    grep -qF -- "$t" "$file" || MISSING="$MISSING [$t]"
  done
  [ -z "$MISSING" ]
}

post() { # post <json> -> imprime el status HTTP; el cuerpo queda en $TMP/body
  curl -s -o "$TMP/body" -w '%{http_code}' -X POST "$BASE/api/leads" \
    -H 'Content-Type: application/json' -d "$1"
}

# --- Spec 001 ---

c1() { # C1 compila
  npm ci >"$TMP/ci.log" 2>&1 && npm run build >"$TMP/build.log" 2>&1
  local rc=$?
  if [ $rc -eq 0 ]; then ok "C1 npm ci && npm run build sale con 0"; else ko "C1 build falla"; tail -15 "$TMP/ci.log" "$TMP/build.log" | sed 's/^/     | /'; fi
}

c2() { # C2 tests
  if npm test >"$TMP/test.log" 2>&1; then
    ok "C2 npm test sale con 0"; ev "$(grep -E 'Tests ' "$TMP/test.log")"
  else ko "C2 npm test falla"; tail -15 "$TMP/test.log" | sed 's/^/     | /'; fi
}

start_server() {
  if curl -s -o /dev/null "$BASE/"; then echo "El puerto $PORT ya está ocupado"; return 1; fi
  env -u SUPABASE_URL -u SUPABASE_ANON_KEY node node_modules/next/dist/bin/next start -p "$PORT" >"$TMP/server.log" 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 60); do
    curl -s -o /dev/null "$BASE/" && return 0
    sleep 0.5
  done
  echo "El servidor no levantó"; return 1
}

c3() { # C3 secciones y textos
  curl -s "$BASE/" >"$TMP/home.html"
  if contiene "$TMP/home.html" "${C3_CADENAS[@]}"; then
    ok "C3 la página contiene las ${#C3_CADENAS[@]} cadenas del handoff"
  else ko "C3 faltan:$MISSING"; fi
}

c4() { # C4 campos con etiqueta
  if contiene "$TMP/home.html" 'name="nombre"' 'name="email"' 'name="consentimiento"' 'name="tipo"' 'name="fuente"' \
    'for="nombre"' 'for="email"' 'for="consentimiento"'; then
    ok "C4 name= de los 5 campos y un label for= por cada campo visible"
  else ko "C4 faltan:$MISSING"; fi
}

c5() { # C5 paleta
  local css; css="$(find .next/static -name '*.css' -exec cat {} + | tr 'A-Z' 'a-z')"
  local missing=""
  for c in '#1f4d35' '#d63a73' '#f59bbe' '#eef3ea' '#12241a'; do
    printf '%s' "$css" | grep -qF -- "$c" || missing="$missing $c"
  done
  if [ -z "$missing" ]; then ok "C5 el CSS compilado contiene los 5 colores Yungas"; else ko "C5 faltan:$missing"; fi
}

c6() { # C6 rechazos 400
  local bad=""
  local casos=("${C6_CASOS[@]}")
  local nombres=("${C6_NOMBRES[@]}")
  local i
  for i in "${!casos[@]}"; do
    local s; s="$(post "${casos[$i]}")"
    ev "${nombres[$i]} -> $s"
    [ "$s" = "400" ] || bad="$bad ${nombres[$i]}"
  done
  if [ -z "$bad" ]; then ok "C6 los 5 casos inválidos responden 400"; else ko "C6 no respondieron 400:$bad"; fi
}

c7() { # C7 trampa
  local s; s="$(post "$TRAMPA")"
  local b; b="$(cat "$TMP/body")"
  ev "status $s, cuerpo $b"
  if [ "$s" = "200" ] && [ "$b" = '{"ok":true}' ]; then ok "C7 la trampa responde 200 {\"ok\":true}"; else ko "C7 esperaba 200 {\"ok\":true}"; fi
}

c8() { # C8 sin base -> 503
  local s; s="$(post '{"nombre":"Ana","email":"ana@ejemplo.com","tipo":"vecino","consentimiento":true}')"
  ev "status $s"
  if [ "$s" = "503" ]; then ok "C8 lead válido sin base responde 503"; else ko "C8 esperaba 503"; fi
}

c9() { # C9 normalizarFuente (corre en C2; acá se aísla el archivo)
  if npx vitest run lib/fuente.test.ts >"$TMP/c9.log" 2>&1; then
    ok "C9 tests de normalizarFuente"; ev "$(grep -E 'Tests ' "$TMP/c9.log")"
  else ko "C9 falla"; tail -15 "$TMP/c9.log" | sed 's/^/     | /'; fi
}

c10() { # C10 RLS
  local f=supabase/migrations/001_leads.sql
  local sql; sql="$(tr 'A-Z' 'a-z' <"$f")"
  local bad=""
  printf '%s' "$sql" | grep -q 'enable row level security' || bad="$bad sin-RLS"
  printf '%s' "$sql" | tr '\n' ' ' | grep -Eq 'create policy[^;]*for insert[^;]*to anon' || bad="$bad sin-policy-insert-anon"
  printf '%s' "$sql" | grep -Eq 'for (select|update|delete|all)' && bad="$bad policy-prohibida"
  if [ -z "$bad" ]; then ok "C10 RLS activada, insert para anon, ninguna otra policy"; else ko "C10:$bad"; fi
}

c11() { # C11 sin secretos
  local bad=""
  git ls-files | grep -E '(^|/)\.env' | grep -vE '(^|/)\.env\.example$' | grep -q . && bad="$bad env-versionado"
  local hits; hits="$(git grep -nE 'eyJ[A-Za-z0-9_-]{20,}|service''_role|sb_secret''_' -- . ':!specs')"
  [ -n "$hits" ] && bad="$bad secretos:$hits"
  if [ -z "$bad" ]; then ok "C11 sin .env versionado ni secretos (specs excluida: nombra el patrón en su texto)"; else ko "C11:$bad"; fi
}

c12() { # C12 sin scroll horizontal a 390 px
  local out; out="$(node evals/check-mobile.mjs "$BASE/" 2>&1)"
  if [ $? -eq 0 ]; then ok "C12 a 390 px: $out"; else ko "C12 $out"; fi
}

# --- Spec 003 ---

d2() { # D2 no queda "5 cuadras" y están los textos nuevos
  local bad=""
  [ -n "$(git grep -n "5 cuadras" -- app docs/design/handoff-landing.md)" ] && bad="$bad queda-5-cuadras"
  contiene "$TMP/home.html" 'A pocas cuadras de Juan Manuel de Rosas y Felipe Varela' 'a pocas cuadras'     'La zona de Vidriera Salta, a pocas cuadras del cruce. Esquema, no a escala.' || bad="$bad faltan:$MISSING"
  if [ -z "$bad" ]; then ok "D2 sin \"5 cuadras\"; los tres textos nuevos están"; else ko "D2:$bad"; fi
}

d3() { # D3 el mapa es el SVG aprobado
  local bad=""
  grep -qE '<svg[^>]*role="img"[^>]*aria-label="[^"]*Juan Manuel de Rosas[^"]*Felipe Varela' "$TMP/home.html" || bad="$bad svg-sin-role-aria"
  [ -n "$(git grep -n "zona__calle" -- app)" ] && bad="$bad clase-zona__calle"
  git grep -qi "#f59bbe" -- app || bad="$bad sin-#f59bbe"
  awk '/^\.zona__mapa[ ,{]/,/^}/' app/globals.css | grep -q "gradient" && bad="$bad cuadricula"
  if [ -z "$bad" ]; then ok "D3 svg role=img con aria-label, sin zona__calle, #f59bbe, sin cuadrícula"; else ko "D3:$bad"; fi
}

# --- Spec 004 ---

v_unit() { # v_unit <V#> <descripción>: corre en toda la suite los tests cuyo nombre empieza con V#
  if npx vitest run -t "$1 " >"$TMP/$1.log" 2>&1; then
    ok "$1 $2"; ev "$(grep -E 'Tests ' "$TMP/$1.log")"
  else ko "$1 falla"; tail -15 "$TMP/$1.log" | sed 's/^/     | /'; fi
}

v_pw() { # v_pw <V#> <caso> <descripción>: chequeo con Playwright sobre /vidriera
  local out; out="$(node evals/check-vidriera.mjs "$2" "$BASE" 2>&1)"
  local rc=$?
  printf '%s
' "$out" | sed 's/^/     | /'
  if [ $rc -eq 0 ]; then ok "$1 $3"; else ko "$1 falla"; fi
}

v1() { # V1 no se rompe nada: ningún chequeo previo falló
  if [ "$failed" = "0" ]; then ok "V1 los $passed chequeos previos pasan"; else ko "V1 hay $failed chequeos previos en rojo"; fi
}

v2() { # V2 la página existe y avisa que es un ejemplo
  local s; s="$(curl -s -o "$TMP/vidriera.html" -w '%{http_code}' "$BASE/vidriera")"
  sed 's/<[^>]*>//g' "$TMP/vidriera.html" >"$TMP/vidriera.txt" # el h1 parte "a la vuelta" en un <em>
  if [ "$s" = "200" ] && contiene "$TMP/vidriera.txt" 'Lo que hay hoy a la vuelta' 'Vencen hoy' 'Elegí qué buscás' 'Dónde queda cada uno'     'Los comercios del barrio' 'Comercios y ofertas de ejemplo'; then
    ok "V2 /vidriera responde 200 y contiene los 6 textos"
  else ko "V2 status $s, faltan:$MISSING"; fi
}

v10() { # V10 ningún WhatsApp lleva a un número real
  local hits; hits="$(grep -rn "wa.me\|api.whatsapp" app lib)"
  local bad=""
  [ -n "$hits" ] && bad="$bad grep:$hits"
  [ -n "$(grep -oE 'href="[^"]*(wa\.me|whatsapp)[^"]*"' "$TMP/vidriera.html")" ] && bad="$bad link-en-html"
  node evals/check-vidriera.mjs v10 "$BASE" >"$TMP/v10.log" 2>&1 || bad="$bad playwright"
  sed 's/^/     | /' "$TMP/v10.log"
  if [ -z "$bad" ]; then ok "V10 sin wa.me ni api.whatsapp en app y lib; los botones no son links"; else ko "V10:$bad"; fi
}

v12() { # V12 logo VS en toda la web
  curl -s "$BASE/" >"$TMP/home.html"
  local bad=""
  for f in "$TMP/home.html" "$TMP/vidriera.html"; do
    grep -qE 'class="logo__marca"[^>]*>VS<' "$f" || bad="$bad sin-VS:$(basename "$f")"
    grep -qE 'class="logo__marca"[^>]*>V<' "$f" && bad="$bad queda-V:$(basename "$f")"
  done
  if [ -z "$bad" ]; then ok "V12 / y /vidriera llevan el logo VS; no queda la V sola"; else ko "V12:$bad"; fi
}

v14() { # V14 la landing lleva a la vidriera
  if grep -qF 'href="/vidriera"' "$TMP/home.html"; then ok "V14 / contiene un link a /vidriera"; else ko "V14 / no linkea a /vidriera"; fi
}

c1
c2
c9
c10
c11
if [ -d .next ] && start_server; then
  c3; c4; c5; c6; c7; c8; c12; d2; d3
  v1; v2
  v_unit V3 "los datos de ejemplo son los del mock (8 comercios, 8 ofertas)"
  v_unit V4 "el vencimiento es relativo a hoy"
  v_unit V5 "abierto o cerrado se calcula del horario en hora de Salta"
  v_unit V6 "el contador cuenta: 8 ofertas, 3 vencen hoy, 8 comercios"
  v_pw V7 v7 "buscar y filtrar funciona"
  v_pw V8 v8 "el carrusel pasa solo y con flechas"
  v_unit V8 "el carrusel con 0 ofertas no deja nada y con 1 no tiene flechas ni puntos"
  v_pw V9 v9 "mapa con 8 puntos, ficha, Cerrar/Escape y foco"
  v10
  v_pw V11 v11 "los llamados a sumarse van a /?tipo=comercio#formulario y dejan comercio"
  v12
  v_pw V13 v13 "a 390 px el encabezado va en una fila y no hay desborde"
  v14
  if grep -q 'Ready to Release (V15): aprobada' specs/done/004-vidriera-v1.md 2>/dev/null; then
    ok "V15 rúbrica de Edu aprobada en Ready to Release (Evidencia de specs/done/004-vidriera-v1.md)"
  else pend "V15 rúbrica de Edu en Ready to Release (capturas: npm run capturas)"; fi
  if grep -q 'Revisión adversarial (V16): hecha' specs/done/004-vidriera-v1.md 2>/dev/null; then
    ok "V16 revisión adversarial hecha: hallazgos y su destino en la Evidencia de specs/done/004-vidriera-v1.md"
  else ko "V16 falta la revisión adversarial en la Evidencia de la spec"; fi
else
  ko "C3-C8, C12, V1-V14 no se pudieron correr: sin servidor"
fi
stop_server

printf '%s pasan · %s fallan\n' "$passed" "$failed"
[ "$failed" = "0" ]
