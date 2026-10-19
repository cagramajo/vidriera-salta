"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Tipo } from "@/lib/leads";
import { EVENTO_TIPO } from "./ElegirTipo";

type Estado = "editando" | "enviando" | "enviado";

const TEXTOS = {
  comercio: {
    etiqueta: "Nombre del comercio",
    ejemplo: "Ej.: Almacén de Gladis",
    boton: "Quiero mi primer mes gratis",
    gracias: "Te escribimos en estos días para armar tu ficha y tu primera publicación.",
    falta: "Escribí el nombre de tu comercio.",
  },
  vecino: {
    etiqueta: "Tu nombre",
    ejemplo: "Ej.: Ana",
    boton: "Avisame de las ofertas",
    gracias: "Te avisamos por email cuando arranquen las ofertas del barrio.",
    falta: "Escribí tu nombre.",
  },
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+$/;

type Errores = { nombre?: string; email?: string; consentimiento?: string };

export function LeadForm() {
  const [tipo, setTipo] = useState<Tipo>("comercio");
  const [estado, setEstado] = useState<Estado>("editando");
  const [fuente, setFuente] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [errorEnvio, setErrorEnvio] = useState(false);

  useEffect(() => {
    setFuente(new URLSearchParams(window.location.search).get("fuente") ?? "");
    const alElegir = (e: Event) => setTipo((e as CustomEvent<Tipo>).detail);
    window.addEventListener(EVENTO_TIPO, alElegir);
    return () => window.removeEventListener(EVENTO_TIPO, alElegir);
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre") ?? "").trim();
    const email = String(datos.get("email") ?? "").trim();
    const consentimiento = datos.get("consentimiento") === "on";

    const nuevos: Errores = {};
    if (!nombre) nuevos.nombre = TEXTOS[tipo].falta;
    if (!EMAIL.test(email)) nuevos.email = "Revisá el email: tiene que tener un @.";
    if (!consentimiento) nuevos.consentimiento = "Tildá la casilla para que podamos contactarte.";
    setErrores(nuevos);
    setErrorEnvio(false);
    if (Object.keys(nuevos).length > 0) return;

    setEstado("enviando");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          tipo,
          fuente,
          consentimiento,
          empresa: String(datos.get("empresa") ?? ""),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setEstado("enviado");
    } catch {
      setErrorEnvio(true);
      setEstado("editando");
    }
  }

  const t = TEXTOS[tipo];

  return (
    <section id="formulario" aria-labelledby="form-titulo" className="formulario">
      <div className="contenedor contenedor--angosto formulario__columna">
        <h2 id="form-titulo" className="titulo-seccion">Dejanos tus datos</h2>
        {estado === "enviado" ? (
          <div role="status" className="panel">
            <span className="panel__titulo">¡Listo, te anotamos!</span>
            <span>{t.gracias}</span>
            <button type="button" className="boton boton--blanco boton--chico" onClick={() => setEstado("editando")}>
              Cargar otro
            </button>
          </div>
        ) : (
          <form className="panel" onSubmit={enviar} noValidate>
            <div role="group" aria-label="¿Quién sos?" className="selector">
              <button
                type="button"
                aria-pressed={tipo === "comercio"}
                className="selector__opcion"
                onClick={() => setTipo("comercio")}
              >
                Tengo un comercio
              </button>
              <button
                type="button"
                aria-pressed={tipo === "vecino"}
                className="selector__opcion"
                onClick={() => setTipo("vecino")}
              >
                Soy vecino
              </button>
            </div>
            <input type="hidden" name="tipo" value={tipo} />
            <input type="hidden" name="fuente" value={fuente} />

            <div className="campo">
              <label htmlFor="nombre">{t.etiqueta}</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                placeholder={t.ejemplo}
                aria-invalid={errores.nombre ? true : undefined}
                aria-describedby={errores.nombre ? "nombre-error" : undefined}
              />
              {errores.nombre && <p id="nombre-error" className="campo__error">{errores.nombre}</p>}
            </div>

            <div className="campo">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                aria-invalid={errores.email ? true : undefined}
                aria-describedby={errores.email ? "email-error" : undefined}
              />
              {errores.email && <p id="email-error" className="campo__error">{errores.email}</p>}
            </div>

            <div className="campo">
              <div className="consentimiento">
                <input
                  id="consentimiento"
                  name="consentimiento"
                  type="checkbox"
                  aria-invalid={errores.consentimiento ? true : undefined}
                  aria-describedby={errores.consentimiento ? "consentimiento-error" : undefined}
                />
                <label htmlFor="consentimiento">
                  Acepto que Vidriera Salta me contacte. Mis datos se usan solo para eso, y puedo pedir que los borren
                  cuando quiera.
                </label>
              </div>
              {errores.consentimiento && (
                <p id="consentimiento-error" className="campo__error">{errores.consentimiento}</p>
              )}
            </div>

            <div className="trampa" aria-hidden="true">
              <input name="empresa" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>

            {errorEnvio && (
              <p role="alert" className="campo__error">No pudimos guardar tus datos. Probá de nuevo en un rato.</p>
            )}

            <button type="submit" className="boton boton--principal boton--alto" disabled={estado === "enviando"}>
              {t.boton}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
