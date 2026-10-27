// Chequeos de /vidriera con Playwright (spec 004). Uso: node evals/check-vidriera.mjs <v7|v8|v9|v10|v11|v13> <url-base>
// Imprime una línea de evidencia por cada comprobación y sale con 0 solo si todas pasan.
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const [caso, base = "http://localhost:3100"] = process.argv.slice(2);
const url = `${base.replace(/\/$/, "")}/vidriera`;
let fallas = 0;

function comprobar(descripcion, condicion, detalle = "") {
  console.log(`${condicion ? "ok  " : "FALLA"} ${descripcion}${detalle ? ` (${detalle})` : ""}`);
  if (!condicion) fallas++;
}

async function abrir(browser, ancho = 1440) {
  const page = await browser.newPage({ viewport: { width: ancho, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  // La página sale estática y completa fecha y horarios al montarse.
  await page.waitForSelector('.vd[data-listo="si"]');
  return page;
}

const tarjetas = (page) => page.locator(".grilla .oferta").count();

const casos = {
  async v7(browser) {
    const page = await abrir(browser);
    comprobar("sin filtros hay 8 tarjetas", (await tarjetas(page)) === 8, `${await tarjetas(page)}`);
    await page.click('.filtro[data-rubro="Carnicería"]');
    comprobar("filtro Carnicería -> 1 tarjeta", (await tarjetas(page)) === 1, `${await tarjetas(page)}`);
    await page.click('.filtro[data-rubro="Todo"]');
    await page.check("#solo-hoy");
    comprobar("Solo las que vencen hoy -> 3 tarjetas", (await tarjetas(page)) === 3, `${await tarjetas(page)}`);
    await page.uncheck("#solo-hoy");
    await page.fill("#buscar", "yerba");
    comprobar("buscar yerba -> 1 tarjeta", (await tarjetas(page)) === 1, `${await tarjetas(page)}`);
    await page.fill("#buscar", "");
    await page.click('.filtro[data-rubro="Almacén"]');
    await page.check("#solo-hoy");
    const vacio = await page.locator(".vacio", { hasText: "Nada por acá, por ahora" }).count();
    comprobar("filtro sin resultados (Almacén + vencen hoy) -> Nada por acá, por ahora", vacio === 1 && (await tarjetas(page)) === 0);
    await page.uncheck("#solo-hoy");
    await page.click('.filtro[data-rubro="Todo"]');
    await page.fill("#buscar", "zzzz");
    comprobar("buscar algo que no existe -> Nada por acá, por ahora", (await page.locator(".vacio", { hasText: "Nada por acá, por ahora" }).count()) === 1);
    comprobar("la grilla ya no es una región en vivo", (await page.locator(".grilla[aria-live]").count()) === 0);
    await page.fill("#buscar", "yerba");
    const estado = await page.locator('[role="status"].solo-lector').innerText();
    comprobar("el aviso en vivo es el conteo corto", estado === "1 oferta", estado);
    await page.close();
  },

  async v8(browser) {
    const page = await abrir(browser);
    const producto = () => page.locator(".carrusel .oferta__producto").textContent();
    const vistas = new Set();
    const primera = await producto();
    vistas.add(primera);
    const t0 = Date.now();
    await page.waitForFunction(
      (antes) => document.querySelector(".carrusel .oferta__producto")?.textContent !== antes,
      primera,
      { timeout: 4000 },
    );
    comprobar("la oferta visible cambia sola en <= 4 s", true, `${Date.now() - t0} ms`);
    vistas.add(await producto());
    const puntos = await page.locator(".carrusel__punto").count();
    comprobar("el carrusel tiene 3 puntos (las 3 ofertas que vencen hoy)", puntos === 3, `${puntos}`);
    for (let i = 0; i < 2; i++) {
      await page.click('.carrusel__flecha[aria-label="Oferta siguiente"]');
      vistas.add(await producto());
    }
    comprobar("con las flechas se recorren las 3 ofertas de hoy", vistas.size === 3, [...vistas].join(" | "));
    const antes = await producto();
    await page.click('.carrusel__flecha[aria-label="Oferta anterior"]');
    comprobar("la flecha anterior la cambia a mano", (await producto()) !== antes);
    const etiquetas = await page.locator(".carrusel .etiqueta").allInnerTexts();
    comprobar("todas las del carrusel dicen Solo hoy", etiquetas.every((t) => t === "Solo hoy"), etiquetas.join(","));
    await page.close();
  },

  async v9(browser) {
    const page = await abrir(browser);
    const pines = await page.locator(".mapa .pin").count();
    comprobar("hay 8 puntos sobre el mapa", pines === 8, `${pines}`);
    const svg = readFileSync("docs/design/mapa-zona.svg", "utf8");
    const esperado = /<polygon points="([^"]+)"/.exec(svg)?.[1];
    const real = await page.locator(".mapa svg polygon").first().getAttribute("points");
    comprobar("el contorno de la zona es el de mapa-zona.svg", Boolean(esperado) && real === esperado);

    const pin = page.locator('.pin[data-comercio="1"]');
    await pin.click();
    const ficha = page.locator(".ficha");
    await ficha.waitFor();
    const texto = await ficha.innerText();
    comprobar("la ficha muestra el nombre", texto.includes("Carnicería Don Pocho"));
    comprobar("la ficha muestra la dirección", texto.includes("Felipe Varela 2140"));
    comprobar("la ficha muestra el horario", texto.includes("8 a 13 y 17 a 21"));
    comprobar("la ficha dice Abierto ahora o Cerrado ahora", /Abierto ahora|Cerrado ahora/.test(texto), texto.match(/(Abierto|Cerrado) ahora/)?.[0]);
    comprobar("la ficha muestra 387 4XX-XXXX (ejemplo)", /387 4XX-XXXX\s+\(ejemplo\)/.test(texto));
    const links = await ficha.locator("a").count();
    comprobar("la ficha no tiene links (el WhatsApp no es un link)", links === 0, `${links}`);

    await page.click(".ficha__cerrar");
    comprobar("Cerrar la cierra", (await page.locator(".ficha").count()) === 0);
    const foco1 = await page.evaluate(() => document.activeElement?.getAttribute("data-comercio"));
    comprobar("al cerrar con el botón el foco vuelve al punto", foco1 === "1", `data-comercio=${foco1}`);

    await pin.click();
    await page.locator(".ficha").waitFor();
    await page.keyboard.press("Escape");
    comprobar("Escape la cierra", (await page.locator(".ficha").count()) === 0);
    const foco2 = await page.evaluate(() => document.activeElement?.getAttribute("data-comercio"));
    comprobar("al cerrar con Escape el foco vuelve al punto", foco2 === "1", `data-comercio=${foco2}`);

    // Desde el teclado: Enter sobre el punto abre, y el foco vuelve al mismo punto.
    await page.locator('.pin[data-comercio="6"]').focus();
    await page.keyboard.press("Enter");
    await page.locator(".ficha").waitFor();
    comprobar("con Enter sobre el punto 6 abre Kiosco Los Primos", (await page.locator(".ficha").innerText()).includes("Kiosco Los Primos"));
    comprobar("Kiosco 24 horas dice Abierto ahora", (await page.locator(".ficha").innerText()).includes("Abierto ahora"));
    await page.keyboard.press("Escape");
    const foco3 = await page.evaluate(() => document.activeElement?.getAttribute("data-comercio"));
    comprobar("el foco vuelve al punto 6", foco3 === "6", `data-comercio=${foco3}`);

    // Desde el directorio: el foco vuelve a la ficha chica que se tocó.
    await page.locator(".ficha-mini").nth(4).click();
    await page.locator(".ficha").waitFor();
    await page.keyboard.press("Escape");
    const foco4 = await page.evaluate(() => document.activeElement?.className);
    comprobar("desde el directorio el foco vuelve a la ficha chica", foco4 === "ficha-mini", foco4);
    await page.close();
  },

  async v10(browser) {
    const page = await abrir(browser);
    const links = await page.locator('a[href*="wa.me"], a[href*="whatsapp"]').count();
    comprobar("ningún link a WhatsApp en la página", links === 0, `${links}`);
    const botones = page.getByText("Escribile por WhatsApp");
    const n = await botones.count();
    comprobar("hay botones Escribile por WhatsApp", n >= 8, `${n}`);
    const comoLink = await page.locator("a", { hasText: "Escribile por WhatsApp" }).count();
    const comoBoton = await page.locator("button", { hasText: "Escribile por WhatsApp" }).count();
    comprobar("ninguno es un link ni un botón que navegue", comoLink === 0 && comoBoton === 0);
    await page.close();
  },

  async v11(browser) {
    // 1) El formulario obedece a ?tipo=: llegando con vecino queda vecino, o sea que el valor por defecto no tapa nada.
    const base0 = new URL(url).origin;
    const prueba = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await prueba.goto(`${base0}/?tipo=vecino#formulario`, { waitUntil: "networkidle" });
    await prueba.waitForSelector('input[name="tipo"]', { state: "attached" });
    const conVecino = await prueba.locator('input[name="tipo"]').inputValue();
    comprobar("la landing con ?tipo=vecino deja elegido vecino (el parámetro manda)", conVecino === "vecino", `tipo=${conVecino}`);
    await prueba.goto(`${base0}/?tipo=otra-cosa#formulario`, { waitUntil: "networkidle" });
    await prueba.waitForSelector('input[name="tipo"]', { state: "attached" });
    const conBasura = await prueba.locator('input[name="tipo"]').inputValue();
    comprobar("un ?tipo= desconocido se ignora (queda el valor por defecto)", conBasura === "comercio", `tipo=${conBasura}`);
    await prueba.close();

    // 2) Cada llamado de la vidriera lleva ?tipo=comercio y, al seguirlo, el formulario queda en comercio.
    const intentos = [
      { ancho: 1440, texto: "Publicá tu oferta", sel: ".encabezado .boton" },
      { ancho: 390, texto: "Publicá", sel: ".encabezado .boton" },
      { ancho: 1440, texto: "Sumá tu comercio", sel: ".caja-comercio .boton" },
    ];
    for (const { ancho, texto, sel } of intentos) {
      const page = await abrir(browser, ancho);
      const boton = page.locator(sel).first();
      comprobar(`a ${ancho} px el llamado dice "${texto}"`, (await boton.innerText()).trim() === texto, (await boton.innerText()).trim());
      const href = await boton.getAttribute("href");
      comprobar(`"${texto}" apunta a /#formulario y pide tipo=comercio`, /^\/\?tipo=comercio#formulario$/.test(href ?? ""), href ?? "");
      await boton.click();
      await page.waitForURL(/#formulario$/);
      await page.waitForSelector('input[name="tipo"]', { state: "attached" });
      const tipo = await page.locator('input[name="tipo"]').inputValue();
      const marcado = await page.getByRole("button", { name: "Tengo un comercio" }).getAttribute("aria-pressed");
      comprobar(`"${texto}" deja elegido comercio`, tipo === "comercio" && marcado === "true", `${page.url()} tipo=${tipo}`);
      await page.close();
    }
  },

  async v13(browser) {
    const page = await abrir(browser, 390);
    const top = (sel) => page.locator(sel).first().evaluate((el) => el.getBoundingClientRect().top);
    const [logo, buscador, boton] = [await top(".encabezado .logo"), await top("#buscar"), await top(".encabezado .boton")];
    const dentro = (a, b) => Math.abs(a - b) <= 4;
    comprobar("logo, buscador y Publicá en una fila (mismo top ±4 px)", dentro(logo, buscador) && dentro(logo, boton) && dentro(buscador, boton), `top logo=${logo} buscador=${buscador} boton=${boton}`);
    const texto = await page.locator(".encabezado .boton").innerText();
    comprobar("el botón dice Publicá", texto.trim() === "Publicá", texto.trim());
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    comprobar("scrollWidth <= 390", ancho <= 390, `${ancho}`);
    await page.click('.filtro[data-rubro="Carnicería"]');
    await page.locator(".pin").first().click();
    await page.locator(".ficha").waitFor();
    const anchoFicha = await page.evaluate(() => document.documentElement.scrollWidth);
    comprobar("con la ficha abierta scrollWidth <= 390", anchoFicha <= 390, `${anchoFicha}`);
    await page.close();
  },
};

if (!casos[caso]) {
  console.error(`caso desconocido: ${caso}`);
  process.exit(2);
}
const browser = await chromium.launch();
try {
  await casos[caso](browser);
} catch (e) {
  console.log(`FALLA excepción: ${String(e.message).split("\n")[0]}`);
  fallas++;
} finally {
  await browser.close();
}
process.exitCode = fallas === 0 ? 0 : 1;
