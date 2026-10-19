#!/usr/bin/env bash
# Los evals del repo — un chequeo por criterio de aceptación de cada spec. Se corre: `evals/run.sh`
set -u

cd "$(dirname "$0")/.." || exit 1

passed=0
failed=0
ok() { printf 'PASS %s\n' "$1"; passed=$((passed + 1)); }
ko() { printf 'FAIL %s\n' "$1"; failed=$((failed + 1)); }
ev() { printf '     | %s\n' "$1"; }

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

c1
c2
c9
c10
c11
if [ -d .next ] && start_server; then
  c3; c4; c5; c6; c7; c8; c12; d2; d3
else
  ko "C3-C8, C12 no se pudieron correr: sin servidor"
fi
stop_server

printf '%s pasan · %s fallan\n' "$passed" "$failed"
[ "$failed" = "0" ]
