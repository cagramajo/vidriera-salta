// Lógica de la vidriera (spec 004): fechas y horarios en hora de Salta, contadores y filtros.
import type { Comercio, Oferta } from "./vidriera-ejemplo";

export const ZONA_HORARIA = "America/Argentina/Salta";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const formato = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA_HORARIA,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

type Partes = { anio: number; mes: number; dia: number; minutos: number };

function partesSalta(ahora: Date): Partes {
  const p: Record<string, number> = {};
  for (const parte of formato.formatToParts(ahora)) {
    if (parte.type !== "literal") p[parte.type] = Number(parte.value);
  }
  return { anio: p.year, mes: p.month, dia: p.day, minutos: p.hour * 60 + p.minute };
}

/** Día de Salta de `ahora`, más `dias` días, como fecha UTC a medianoche. Sirve solo para nombrar día y mes. */
function fechaMasDias(ahora: Date, dias: number): Date {
  const { anio, mes, dia } = partesSalta(ahora);
  return new Date(Date.UTC(anio, mes - 1, dia + dias));
}

/** Una sola regla para "vence hoy" y "vencida": `vence` son los días desde hoy. */
export const venceHoy = (o: Oferta): boolean => o.vence === 0;
export const estaVigente = (o: Oferta): boolean => o.vence >= 0;
/** Las ofertas vencidas (`vence < 0`) no se muestran en ningún lado. */
export const vigentes = (ofertas: Oferta[]): Oferta[] => ofertas.filter(estaVigente);

/** "Solo hoy", "Hasta mañana" o "Hasta el <día>", según los días que faltan desde hoy en Salta. */
export function etiquetaVence(vence: number, ahora: Date): string {
  if (vence < 0) return "Venció";
  if (vence === 0) return "Solo hoy";
  if (vence === 1) return "Hasta mañana";
  return `Hasta el ${DIAS[fechaMasDias(ahora, vence).getUTCDay()]}`;
}

/** "Martes 27 de octubre", en hora de Salta. */
export function fechaLarga(ahora: Date): string {
  const f = fechaMasDias(ahora, 0);
  const dia = DIAS[f.getUTCDay()];
  return `${dia[0].toUpperCase()}${dia.slice(1)} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`;
}

const TRAMO = /^(\d{1,2})(?::(\d{2}))?\s+a\s+(\d{1,2})(?::(\d{2}))?$/;

function aMinutos(h: string, m: string | undefined): number {
  return Number(h) * 60 + Number(m ?? 0);
}

/** `horario` es "24 horas" o tramos como "8 a 13 y 17 a 21" o "7:30 a 22". Un horario que no se entiende cuenta como cerrado. */
export function estaAbierto(horario: string, ahora: Date): boolean {
  const texto = horario.trim();
  if (texto === "24 horas") return true;
  const minutos = partesSalta(ahora).minutos;
  return texto.split(/\s+y\s+/).some((tramo) => {
    const m = TRAMO.exec(tramo.trim());
    if (!m) return false;
    const desde = aMinutos(m[1], m[2]);
    const hasta = aMinutos(m[3], m[4]);
    return desde < hasta ? minutos >= desde && minutos < hasta : minutos >= desde || minutos < hasta;
  });
}

export function contadores(ofertas: Oferta[], comercios: Comercio[]) {
  const activas = vigentes(ofertas);
  return {
    ofertas: activas.length,
    vencenHoy: activas.filter(venceHoy).length,
    comercios: comercios.length,
  };
}

export type Filtro = { rubro: string; soloHoy: boolean; busqueda: string };

export function filtrarOfertas(ofertas: Oferta[], comercios: Comercio[], filtro: Filtro): Oferta[] {
  const q = filtro.busqueda.trim().toLowerCase();
  return vigentes(ofertas).filter((o) => {
    const c = comercios.find((x) => x.id === o.comercio);
    if (!c) return false;
    if (filtro.rubro !== "Todo" && c.rubro !== filtro.rubro) return false;
    if (filtro.soloHoy && !venceHoy(o)) return false;
    if (q && !`${o.producto} ${c.nombre} ${c.rubro} ${o.nota}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function cuadras(n: number): string {
  return n === 1 ? "a 1 cuadra" : `a ${n} cuadras`;
}
