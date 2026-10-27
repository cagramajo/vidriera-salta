// C13 y V15: capturas de la landing y de /vidriera (con y sin la ficha abierta) a 390 y 1440 px en docs/research/<fecha>-capturas/.
// Requiere `npm run build` hecho. Levanta su propio servidor en el puerto 3101 y lo baja al terminar.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const PUERTO = 3101;
const base = `http://localhost:${PUERTO}/`;
const fecha = new Date().toLocaleDateString("sv-SE");
const carpeta = `docs/research/${fecha}-capturas`;
mkdirSync(carpeta, { recursive: true });

const servidor = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PUERTO)], {
  stdio: "ignore",
});

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("El servidor no levantó");
}

let browser;
try {
  await esperarServidor();
  browser = await chromium.launch();
  for (const ancho of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width: ancho, height: 900 } });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const archivo = `${carpeta}/landing-${ancho}.png`;
    await page.screenshot({ path: archivo, fullPage: true });
    console.log(archivo);

    await page.goto(`${base}vidriera`, { waitUntil: "networkidle" });
    await page.waitForSelector('.vd[data-listo="si"]');
    await page.evaluate(() => document.fonts.ready);
    const vidriera = `${carpeta}/vidriera-${ancho}.png`;
    await page.screenshot({ path: vidriera, fullPage: true });
    console.log(vidriera);

    await page.locator('.pin[data-comercio="1"]').click();
    await page.locator(".ficha").waitFor();
    const ficha = `${carpeta}/vidriera-ficha-${ancho}.png`;
    await page.screenshot({ path: ficha });
    console.log(ficha);
    await page.close();
  }
} finally {
  await browser?.close();
  servidor.kill();
}
