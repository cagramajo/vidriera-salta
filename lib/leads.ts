import { normalizarFuente } from "./fuente";

export type Tipo = "comercio" | "vecino";

export type Lead = {
  nombre: string;
  email: string;
  tipo: Tipo;
  fuente: string;
  consentimiento: true;
};

export type Validacion = { ok: true; lead: Lead; trampa: boolean } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+$/;
const NOMBRE_MAX = 120;
const EMAIL_MAX = 254;

export function validarLead(cuerpo: unknown): Validacion {
  if (typeof cuerpo !== "object" || cuerpo === null) return { ok: false, error: "Cuerpo inválido." };
  const c = cuerpo as Record<string, unknown>;

  if (c.consentimiento !== true) return { ok: false, error: "Tenés que aceptar que te contactemos." };

  const nombre = typeof c.nombre === "string" ? c.nombre.trim() : "";
  if (nombre.length === 0 || nombre.length > NOMBRE_MAX) {
    return { ok: false, error: "Escribí tu nombre." };
  }

  const email = typeof c.email === "string" ? c.email.trim().toLowerCase() : "";
  if (email.length > EMAIL_MAX || !EMAIL.test(email)) {
    return { ok: false, error: "Revisá el email: tiene que tener un @." };
  }

  if (c.tipo !== "comercio" && c.tipo !== "vecino") return { ok: false, error: "Elegí si tenés un comercio o sos vecino." };

  const trampa = typeof c.empresa === "string" && c.empresa.trim().length > 0;

  return {
    ok: true,
    trampa,
    lead: { nombre, email, tipo: c.tipo, fuente: normalizarFuente(c.fuente), consentimiento: true },
  };
}
