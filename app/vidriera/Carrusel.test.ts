import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { COMERCIOS, OFERTAS } from "@/lib/vidriera-ejemplo";
import { Carrusel } from "./Carrusel";

const html = (ofertas: typeof OFERTAS) =>
  renderToStaticMarkup(createElement(Carrusel, { ofertas, comercios: COMERCIOS, ahora: null, pausado: false, abrir: () => {} }));
const deHoy = OFERTAS.filter((o) => o.vence === 0);

describe("V8 Carrusel con 0, 1 y 3 ofertas que vencen hoy", () => {
  it("con 0 no queda nada: ni el rótulo ni el bloque", () => {
    expect(html([])).toBe("");
  });
  it("con 1 muestra la tarjeta, con el rótulo, sin flechas ni puntitos", () => {
    const h = html(deHoy.slice(0, 1));
    expect(h).toContain("Vencen hoy · no te las pierdas");
    expect(h).toContain("Asado de novillo");
    expect(h).not.toContain("carrusel__flecha");
    expect(h).not.toContain("carrusel__punto");
  });
  it("con 3 muestra flechas y 3 puntitos", () => {
    const h = html(deHoy);
    expect(h.match(/carrusel__flecha/g)).toHaveLength(2);
    expect(h.match(/class="carrusel__punto"/g)).toHaveLength(3);
  });
});
