# Handoff — landing de Vidriera Salta

Diseño aprobado por Edu el 2026-10-18. Canvas de origen: https://claude.ai/artifact/7C85wiRiL5CJK7jqnyp11B
(privado). Prototipo exportado: `landing.dc.html` y `design-system.dc.html`, en esta carpeta.
Ante una diferencia entre el prototipo y este documento, gana este documento.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--monte` | `#1F4D35` | Fondo del inicio y del formulario, precios, tarjeta "Gratis", acentos sobre claro |
| `--lapacho` | `#D63A73` | Botón principal, números de los pasos, punto de la esquina, sombras destacadas |
| `--lapacho-claro` | `#F59BBE` | Textos chicos sobre fondo oscuro, etiqueta "Solo hoy" |
| `--niebla` | `#EEF3EA` | Fondo general; texto sobre monte y sombra |
| `--sombra` | `#12241A` | Texto, bordes, fondos oscuros |
| `--blanco` | `#FFFFFF` | Fondo de tarjetas, publicación y campos |
| `--texto-suave` | `#46554B` | Pies de figura y textos secundarios sobre niebla |

Contraste: sobre `--lapacho` va texto `--sombra` de 19 px o más en negrita; nunca blanco. Texto
chico sobre `--sombra` o `--monte`: `--niebla` o `--lapacho-claro`.

## Tipografía

Una familia: **Archivo** (Google Fonts, ejes `wdth` 62–125 y `wght` 400–900).

| Rol | Ancho | Peso | Tamaño | Otros |
|---|---|---|---|---|
| Título del inicio (h1) | 68% | 900 | `clamp(44px, 7.4cqi, 104px)` | Mayúsculas, interlineado 0.95 |
| Título de sección (h2) | 70% | 900 | `clamp(34px, 4.6cqi, 60px)` | Mayúsculas, interlineado 1 |
| Cifras de precio | 68% | 900 | 64 px | Interlineado 1 |
| Cuerpo | 100% | 400 | 17 px | Interlineado 1.5 |
| Bajada del inicio | 100% | 400 | 20 px | |
| Etiquetas y botones | 100% | 700–800 | 14–19 px | Botones con lapacho: 19 px |

`cqi` usa la página como contenedor (`container-type: inline-size` en el contenedor raíz).

## Componentes

1. **Botón.** Alto mínimo 52 px (44 px en el encabezado), borde 2 px `--sombra`, radio 6 px,
   negrita. Variantes: principal (`--lapacho`, texto `--sombra`, 19 px), secundario (`--niebla`,
   texto `--sombra`), oscuro (`--sombra`, texto `--niebla`).
2. **Publicación.** Fondo blanco, borde 3 px `--sombra`, radio 8 px, sombra sólida 8×8 px
   `--lapacho`, rotada −2°. Encabezado con nombre del comercio y etiqueta "Solo hoy"
   (`--lapacho-claro`), separado por línea discontinua; producto en mayúsculas angostas; precio en
   `--monte`; dirección en `--texto-suave`; botón oscuro "Escribile por WhatsApp".
3. **Tarjeta.** Fondo blanco, borde 2 px `--sombra`, radio 8 px, padding 24 px; título angosto en
   mayúsculas y un párrafo.
4. **Campo.** Etiqueta en negrita arriba; input de 48 px de alto, fondo blanco, borde 2 px, radio
   6 px. Casilla de 24 px con `accent-color: --monte`.

Reglas: bordes de 2 px y esquinas de 6–8 px en todo; sombras sólidas desplazadas, sin difuminar,
solo en lo que se destaca; objetivos táctiles de 44 px como mínimo; ancho máximo del contenido
1200 px (formulario 720 px), márgenes laterales de 20 px.

## Secciones y textos

Los textos van tal cual. Lo que está entre corchetes en el ejemplo de publicación queda entre
corchetes: es un ejemplo, no un comercio real.

1. **Encabezado** (fondo `--niebla`, borde inferior 2 px). Logo: cuadrado 40 px `--monte` con "V"
   + "VIDRIERA SALTA". Links: "Para comercios" (#comercios), "Para vecinos" (#vecinos). Botón
   principal "Sumá tu comercio" (#formulario, preselecciona comercio).
2. **Inicio** (fondo `--monte`, texto `--niebla`). Etiqueta: "A pocas cuadras de Juan Manuel de Rosas y
   Felipe Varela". H1: "El cartel de tu vereda, en el celular de todo el barrio". Bajada:
   "Publicidad para los comercios chicos del barrio. Nos contás tu oferta, la escribimos con IA a tu
   estilo, y les llega a los vecinos el día que vos elijas." Botones: "Sumá tu comercio — primer mes
   gratis" (principal, preselecciona comercio) y "Quiero ver las ofertas" (secundario, preselecciona
   vecino). A la derecha (abajo en celular): "Así se ve una publicación" + Publicación de ejemplo:
   "Carnicería [NOMBRE]", "Solo hoy", "[PRODUCTO EN OFERTA]", "$[PRECIO] el kilo",
   "[Dirección] · a 2 cuadras de la esquina".
3. **Problema.** H2: "Tu cartel solo lo ve quien pasa por la puerta". Tres tarjetas:
   - "La vereda" — "Sacás el cartel con tus precios y ofertas todos los días. Llega a los que
     pasan, nada más."
   - "Facebook" — "Publicás en el grupo y tu oferta se pierde entre cientos de posts de toda la
     ciudad."
   - "Las apps" — "Google Maps, Instagram, WhatsApp Business: todo existe, pero aprenderlo lleva un
     tiempo que no tenés."
4. **Cómo funciona** (id `comercios`; fondo `--sombra`, texto `--niebla`). Etiqueta "Para
   comercios" (`--lapacho-claro`). H2: "Nosotros hacemos el trabajo. Vos atendés." Tres pasos
   numerados (círculo 48 px `--lapacho`):
   1. "Nos contás qué querés ofrecer" — "Por WhatsApp o en persona. Una foto del cartel alcanza."
   2. "La IA la escribe a tu estilo" — "Tu publicación sale con la impronta de tu negocio. La ves
      antes de que se publique."
   3. "Vos elegís el día y cuánto dura" — "El día que la necesites, de 1 a 7 días. Tu ficha queda
      fija con dirección y contacto."
5. **Precios.** H2: "Probalo un mes sin pagar nada". Tres tarjetas:
   - Destacada (fondo `--monte`, texto `--niebla`, sombra lapacho): "Primer mes" / "Gratis" / "Tu
     ficha del comercio + 1 publicación por semana."
   - "Por mes" / "$5.000" / "La ficha + 1 publicación por semana, el día que elijas."
   - "Pack 3 meses" / "$10.000" (en `--monte`) / "Lo mismo, tres meses, por menos."
6. **Vecinos y zona** (id `vecinos`). Etiqueta "Para vecinos" (`--monte`). H2: "Enterate de lo que
   hay a la vuelta". Texto: "Las ofertas del almacén, la carnicería y los comercios de tu barrio, en
   un solo lugar. Sin buscar en grupos, sin publicidad de toda la ciudad: solo lo que tenés a pocas
   cuadras." Botón oscuro "Avisame cuando arranque" (preselecciona vecino). Mapa de la zona: dibujo propio, aprobado
   por Edu, en `docs/design/mapa-zona.svg` (fuente de verdad), insertado inline como `<svg>` con
   `role="img"` y `aria-label` que nombra Juan Manuel de Rosas y Felipe Varela. Recuadro apaisado
   (1740 × 860), borde discontinuo `--sombra`, fondo blanco. Contorno de la zona punteado `--monte`
   con relleno `--niebla`, sin cuadrícula ni lugares de referencia. Felipe Varela y "J. M. de Rosas"
   en lapacho claro (#F59BBE), Rosas solo desde Joaquín V. González hasta el cruce; punto lapacho
   claro en el cruce. Nombres de las calles principales (Archivo 800) y del borde, abreviados (Archivo 700, 50 unidades
   del dibujo, unos 10 px a 390 px): J. V. González, Castillo, Á. Vargas, Chalimín, Fortín Cerrillos. Pie:
   "La zona de Vidriera Salta, a pocas cuadras del cruce. Esquema, no a escala."
7. **Formulario** (id `formulario`; fondo `--monte`). H2: "Dejanos tus datos". Tarjeta `--niebla`
   con sombra lapacho:
   - Selector de dos botones con `aria-pressed`: "Tengo un comercio" / "Soy vecino" (el elegido,
     fondo `--sombra`).
   - Nombre — etiqueta "Nombre del comercio" (ej. "Ej.: Almacén de Gladis") o "Tu nombre" (ej.
     "Ej.: Ana") según el tipo.
   - Email — ejemplo "nombre@ejemplo.com".
   - Casilla: "Acepto que Vidriera Salta me contacte. Mis datos se usan solo para eso, y puedo pedir
     que los borren cuando quiera."
   - Botón principal: "Quiero mi primer mes gratis" (comercio) / "Avisame de las ofertas" (vecino).
   - Confirmación: "¡Listo, te anotamos!" + "Te escribimos en estos días para armar tu ficha y tu
     primera publicación." (comercio) / "Te avisamos por email cuando arranquen las ofertas del
     barrio." (vecino), con `role="status"`.
8. **Pie** (fondo `--sombra`, texto `--niebla`). "VIDRIERA SALTA" + "Privacidad: guardamos tu nombre
   y tu email solo para contactarte por Vidriera Salta. Para pedir que los borremos, escribinos a
   echarly02@gmail.com." El email es un link `mailto:`.

## Comportamiento en celular

Todo en una columna: las filas de tarjetas y las dos mitades del inicio y de vecinos se apilan; el
menú del encabezado pasa abajo del logo. Sin scroll horizontal a 390 px.
