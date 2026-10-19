// C12: a 390 px de ancho no hay scroll horizontal. Uso: node evals/check-mobile.mjs <url>
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3100/";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(`scrollWidth=${ancho}`);
  process.exitCode = ancho <= 390 ? 0 : 1;
} finally {
  await browser.close();
}
