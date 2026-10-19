const FUENTE_VALIDA = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FUENTE_MAX = 59;

export function normalizarFuente(valor: unknown): string {
  if (typeof valor !== "string") return "directo";
  if (valor.length === 0 || valor.length > FUENTE_MAX) return "directo";
  return FUENTE_VALIDA.test(valor) ? valor : "directo";
}
