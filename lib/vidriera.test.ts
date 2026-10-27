import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMERCIOS, OFERTAS } from "./vidriera-ejemplo";
import { contadores, estaAbierto, etiquetaVence, fechaLarga, filtrarOfertas } from "./vidriera";

// Hora de Salta = UTC-3, sin horario de verano. "2026-10-27" es martes.
const salta = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00-03:00`);

describe("V3 datos de ejemplo = los del mock", () => {
  // Se leen del propio mock aprobado, para que no diverjan.
  const mock = readFileSync("docs/design/mock-vidriera.html", "utf8");
  const bloque = (nombre: string) => {
    const m = new RegExp(`const ${nombre} = (\\[[\\s\\S]*?\\n\\]);`).exec(mock);
    if (!m) throw new Error(`no encontré ${nombre} en el mock`);
    return new Function(`return ${m[1]}`)() as Record<string, unknown>[];
  };
  const comerciosMock = bloque("COMERCIOS");
  const ofertasMock = bloque("OFERTAS");

  it("8 comercios y 8 ofertas", () => {
    expect(COMERCIOS).toHaveLength(8);
    expect(OFERTAS).toHaveLength(8);
    expect(comerciosMock).toHaveLength(8);
    expect(ofertasMock).toHaveLength(8);
  });

  it("mismos nombres, rubros, direcciones, horarios y posiciones", () => {
    COMERCIOS.forEach((c, i) => {
      const m = comerciosMock[i];
      expect([c.id, c.nombre, c.rubro, c.direccion, c.cuadras, c.horario, c.x, c.y, c.voz]).toEqual([
        m.id, m.nombre, m.rubro, m.dir, m.cuadras, m.horario, m.x, m.y, m.voz,
      ]);
    });
  });

  it("mismos productos, precios, unidades, vencimientos y notas", () => {
    OFERTAS.forEach((o, i) => {
      const m = ofertasMock[i];
      expect([o.comercio, o.producto, o.precio, o.unidad, o.vence, o.nota]).toEqual([
        m.comercio, m.producto, m.precio, m.unidad, m.vence, m.nota,
      ]);
    });
  });

  it("cada oferta apunta a un comercio que existe", () => {
    for (const o of OFERTAS) expect(COMERCIOS.some((c) => c.id === o.comercio)).toBe(true);
  });
});

describe("V4 el vencimiento es relativo a hoy", () => {
  const martes = salta("2026-10-27", "12:00");
  it("0 = Solo hoy, 1 = Hasta mañana", () => {
    expect(etiquetaVence(0, martes)).toBe("Solo hoy");
    expect(etiquetaVence(1, martes)).toBe("Hasta mañana");
  });
  it("n >= 2 = Hasta el <día>", () => {
    expect(etiquetaVence(2, martes)).toBe("Hasta el jueves");
    expect(etiquetaVence(3, martes)).toBe("Hasta el viernes");
    expect(etiquetaVence(6, martes)).toBe("Hasta el lunes");
  });
  it("cambia con el día de referencia", () => {
    expect(etiquetaVence(2, salta("2026-10-28", "12:00"))).toBe("Hasta el viernes");
  });
  it("usa el día de Salta, no el de UTC (22:30 en Salta ya es el día siguiente en UTC)", () => {
    expect(etiquetaVence(2, salta("2026-10-27", "22:30"))).toBe("Hasta el jueves");
    expect(fechaLarga(salta("2026-10-27", "22:30"))).toBe("Martes 27 de octubre");
  });
  it("fechaLarga", () => {
    expect(fechaLarga(salta("2026-10-19", "09:00"))).toBe("Lunes 19 de octubre");
  });
});

describe("V5 estaAbierto, en hora de Salta", () => {
  const dia = "2026-10-27";
  it("8 a 13 y 17 a 21", () => {
    const h = "8 a 13 y 17 a 21";
    expect(estaAbierto(h, salta(dia, "10:00"))).toBe(true);
    expect(estaAbierto(h, salta(dia, "15:00"))).toBe(false);
    expect(estaAbierto(h, salta(dia, "18:30"))).toBe(true);
    expect(estaAbierto(h, salta(dia, "21:30"))).toBe(false);
  });
  it("24 horas está siempre abierto", () => {
    for (const hora of ["00:00", "03:15", "12:00", "23:59"]) expect(estaAbierto("24 horas", salta(dia, hora))).toBe(true);
  });
  it("7:30 a 22", () => {
    expect(estaAbierto("7:30 a 22", salta(dia, "07:00"))).toBe(false);
    expect(estaAbierto("7:30 a 22", salta(dia, "07:30"))).toBe(true);
  });
  it("el cierre es exclusivo y los tramos con minutos funcionan", () => {
    expect(estaAbierto("8 a 13", salta(dia, "13:00"))).toBe(false);
    expect(estaAbierto("8:30 a 13 y 16:30 a 20:30", salta(dia, "16:45"))).toBe(true);
    expect(estaAbierto("8:30 a 13 y 16:30 a 20:30", salta(dia, "20:30"))).toBe(false);
  });
  it("usa la hora de Salta aunque el instante se exprese en UTC", () => {
    expect(estaAbierto("8 a 13 y 17 a 21", new Date("2026-10-27T13:00:00Z"))).toBe(true); // 10:00 en Salta
    expect(estaAbierto("8 a 13 y 17 a 21", new Date("2026-10-27T18:00:00Z"))).toBe(false); // 15:00 en Salta
  });
  it("un horario que no se entiende cuenta como cerrado", () => {
    expect(estaAbierto("cuando abro", salta(dia, "10:00"))).toBe(false);
  });
});

describe("V6 el contador cuenta", () => {
  it("8 ofertas activas, 3 vencen hoy, 8 comercios", () => {
    expect(contadores(OFERTAS, COMERCIOS)).toEqual({ ofertas: 8, vencenHoy: 3, comercios: 8 });
  });
});

describe("filtrarOfertas", () => {
  const f = (p: Partial<{ rubro: string; soloHoy: boolean; busqueda: string }>) =>
    filtrarOfertas(OFERTAS, COMERCIOS, { rubro: "Todo", soloHoy: false, busqueda: "", ...p });
  it("sin filtros devuelve todas", () => expect(f({})).toHaveLength(8));
  it("por rubro", () => expect(f({ rubro: "Carnicería" })).toHaveLength(1));
  it("solo las que vencen hoy", () => expect(f({ soloHoy: true })).toHaveLength(3));
  it("busca en producto, comercio, rubro y nota, sin importar mayúsculas", () => {
    expect(f({ busqueda: "YERBA" })).toHaveLength(1);
    expect(f({ busqueda: "pocho" })).toHaveLength(1);
  });
  it("filtros combinados sin resultados", () => expect(f({ rubro: "Almacén", soloHoy: true })).toHaveLength(0));
});
