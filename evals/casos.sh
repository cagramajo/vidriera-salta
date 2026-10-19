# Las listas que comparten evals/run.sh (local) y evals/prod.sh (producción). Se leen con `.`, no se corren.

# C3 (spec 001) / P4 (spec 002): las 15 cadenas que debe contener la página
C3_CADENAS=(
  'lang="es"' 'El cartel de tu vereda, en el celular de todo el barrio' 'Sumá tu comercio'
  'Quiero ver las ofertas' 'Tu cartel solo lo ve quien pasa por la puerta' 'Nosotros hacemos el trabajo'
  'Probalo un mes sin pagar nada' '$5.000' '$10.000' 'Enterate de lo que hay a la vuelta'
  'Juan Manuel de Rosas' 'Felipe Varela' 'Dejanos tus datos' 'Privacidad' 'mailto:echarly02@gmail.com'
)

# C6 (spec 001) / P5 (spec 002): los 5 cuerpos inválidos, todos → 400
C6_NOMBRES=(sin-consentimiento consentimiento-false email-sin-arroba nombre-vacio tipo-invalido)
C6_CASOS=(
  '{"nombre":"Ana","email":"ana@ejemplo.com","tipo":"vecino"}'
  '{"nombre":"Ana","email":"ana@ejemplo.com","tipo":"vecino","consentimiento":false}'
  '{"nombre":"Ana","email":"ana.ejemplo.com","tipo":"vecino","consentimiento":true}'
  '{"nombre":"","email":"ana@ejemplo.com","tipo":"vecino","consentimiento":true}'
  '{"nombre":"Ana","email":"ana@ejemplo.com","tipo":"otro","consentimiento":true}'
)

# C7 (spec 001) / P5: la trampa llena → 200 {"ok":true}
TRAMPA='{"nombre":"Ana","email":"ana@ejemplo.com","tipo":"vecino","consentimiento":true,"empresa":"ACME"}'
