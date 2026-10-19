import { describe, expect, it } from "vitest";
import { validarLead } from "./leads";

const valido = { nombre: "Ana", email: "ana@ejemplo.com", tipo: "vecino", consentimiento: true };

describe("validarLead", () => {
  it("acepta un lead válido y normaliza la fuente", () => {
    const r = validarLead({ ...valido, fuente: "<script>" });
    expect(r.ok && r.lead.fuente).toBe("directo");
  });

  it.each([
    ["sin consentimiento", { ...valido, consentimiento: undefined }],
    ["consentimiento false", { ...valido, consentimiento: false }],
    ["email sin @", { ...valido, email: "ana.ejemplo.com" }],
    ["nombre vacío", { ...valido, nombre: "  " }],
    ["tipo inválido", { ...valido, tipo: "otro" }],
    ["no es objeto", "hola"],
  ])("rechaza %s", (_, cuerpo) => {
    expect(validarLead(cuerpo).ok).toBe(false);
  });

  it("detecta la trampa", () => {
    const r = validarLead({ ...valido, empresa: "ACME" });
    expect(r.ok && r.trampa).toBe(true);
  });
});
