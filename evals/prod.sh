#!/usr/bin/env bash
# Los evals de producción de la spec 002 (P4-P8, P11). Se corre contra la URL pública:
#
#   PROD_URL=https://vidriera-salta.vercel.app evals/prod.sh
#
# P6/P7 y P8 necesitan datos que la sesión del brain pasa por variable de entorno, nunca el repo:
#   Paso 1: sin PRUEBA_EMAIL. Manda un lead nuevo y su repetición, e imprime el email y la consulta SQL.
#   Paso 2: PRUEBA_EMAIL=<email del paso 1> LEADS_COUNT=<resultado de la consulta> evals/prod.sh
#           No manda nada: solo evalúa el conteo (debe ser 1).
#   P8:     SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY (la clave pública). Si faltan, queda pendiente.
# Pendiente no es falla; el script sale con 0 solo si nada falló.
set -u

cd "$(dirname "$0")/.." || exit 1
# shellcheck source=evals/casos.sh
. "$(dirname "$0")/casos.sh"

: "${PROD_URL:?Falta PROD_URL}"
PROD_URL="${PROD_URL%/}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

passed=0; failed=0; pending=0
ok() { printf 'PASS %s\n' "$1"; passed=$((passed + 1)); }
ko() { printf 'FAIL %s\n' "$1"; failed=$((failed + 1)); }
pe() { printf 'PEND %s\n' "$1"; pending=$((pending + 1)); }
ev() { printf '     | %s\n' "$1"; }

post() { curl -s -o "$TMP/body" -w '%{http_code}' -X POST "$PROD_URL/api/leads" -H 'Content-Type: application/json' -d "$1"; }

contiene() {
  local file="$1"; shift
  MISSING=""
  for t in "$@"; do grep -qF -- "$t" "$file" || MISSING="$MISSING [$t]"; done
  [ -z "$MISSING" ]
}

echo "Externos (los verifica la sesión del brain con sus conexiones, no este script): P1 P2 P3 P9 P10. P12 y P13 los aplica Edu."

if [ -z "${PRUEBA_EMAIL:-}" ]; then
  s="$(curl -s -o "$TMP/home.html" -w '%{http_code}' "$PROD_URL/")"
  if [ "$s" = "200" ] && contiene "$TMP/home.html" "${C3_CADENAS[@]}"; then
    ok "P4 $PROD_URL responde 200 y contiene las ${#C3_CADENAS[@]} cadenas de C3"
  else ko "P4 status $s, faltan:${MISSING:-}"; fi

  bad=""
  for i in "${!C6_CASOS[@]}"; do
    s="$(post "${C6_CASOS[$i]}")"; ev "${C6_NOMBRES[$i]} -> $s"
    [ "$s" = "400" ] || bad="$bad ${C6_NOMBRES[$i]}"
  done
  s="$(post "$TRAMPA")"; b="$(cat "$TMP/body")"; ev "trampa -> $s $b"
  { [ "$s" = "200" ] && [ "$b" = '{"ok":true}' ]; } || bad="$bad trampa"
  if [ -z "$bad" ]; then ok "P5 5 casos inválidos → 400 y la trampa → 200 {\"ok\":true}"; else ko "P5 fallaron:$bad"; fi

  email="prueba-auto-$(date +%s)@example.com"
  lead="{\"nombre\":\"Prueba automática\",\"email\":\"$email\",\"tipo\":\"vecino\",\"consentimiento\":true,\"fuente\":\"prueba-auto\"}"
  s1="$(post "$lead")"; b1="$(cat "$TMP/body")"
  s2="$(post "$lead")"; b2="$(cat "$TMP/body")"
  ev "email de prueba: $email"
  ev "primer envío -> $s1 $b1 · repetición -> $s2 $b2"
  if [ "$s1" = "200" ] && [ "$s2" = "200" ] && [ "$b2" = '{"ok":true}' ]; then
    pe "P6/P7 envíos 200 y 200. Falta el conteo: select count(*) from leads where email = '$email';  (debe dar 1). Después: PRUEBA_EMAIL=$email LEADS_COUNT=<n> evals/prod.sh"
  else ko "P6/P7 esperaba 200 y 200 {\"ok\":true}"; fi
else
  ev "email de prueba: $PRUEBA_EMAIL"
  case "${LEADS_COUNT:-}" in
    1) ok "P6 el lead quedó guardado y P7 la repetición no lo duplicó: conteo = 1 para $PRUEBA_EMAIL" ;;
    "") ko "P6/P7 falta LEADS_COUNT" ;;
    *) ko "P6/P7 el conteo es $LEADS_COUNT, esperaba 1" ;;
  esac
fi

if [ -z "${PRUEBA_EMAIL:-}" ]; then
  if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_PUBLISHABLE_KEY:-}" ]; then
    s="$(curl -s -o "$TMP/p8" -w '%{http_code}' "${SUPABASE_URL%/}/rest/v1/leads?select=*" \
      -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $SUPABASE_PUBLISHABLE_KEY")"
    b="$(tr -d ' \n\r' <"$TMP/p8")"; ev "status $s, cuerpo $b"
    if [ "$s" = "200" ] && [ "$b" = "[]" ]; then ok "P8 la tabla no se lee con la clave pública: []"; else ko "P8 esperaba 200 y []"; fi
  else pe "P8 faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY"; fi

  out="$(node evals/check-mobile.mjs "$PROD_URL/" 2>&1)"
  if [ $? -eq 0 ]; then ok "P11 a 390 px: $out"; else ko "P11 $out"; fi
fi

printf '%s pasan · %s fallan · %s pendientes\n' "$passed" "$failed" "$pending"
[ "$failed" = "0" ]
