import { describe, expect, it } from "vitest";
import { normalizarFuente } from "./fuente";

describe("normalizarFuente", () => {
  it.each(["volante", "sobrinos", "whatsapp", "directo", "qr-almacen-gladis"])("deja pasar %s", (f) => {
    expect(normalizarFuente(f)).toBe(f);
  });

  it.each([
    ["vacío", ""],
    ["mayúsculas", "QR-X"],
    ["guion final", "qr-"],
    ["script", "<script>"],
    ["60 caracteres", "a".repeat(60)],
    ["más de 60", "a".repeat(80)],
    ["no es texto", undefined],
  ])("devuelve directo para %s", (_, f) => {
    expect(normalizarFuente(f)).toBe("directo");
  });

  it("acepta 59 caracteres", () => {
    expect(normalizarFuente("a".repeat(59))).toBe("a".repeat(59));
  });
});
