"use client";

import { useEffect, useRef } from "react";
import { cuadras, estaAbierto } from "@/lib/vidriera";
import type { Comercio, Oferta as OfertaDato } from "@/lib/vidriera-ejemplo";
import { Oferta } from "./Oferta";

type Props = {
  comercio: Comercio;
  ofertas: OfertaDato[];
  ahora: Date | null;
  cerrar: () => void;
};

export function Ficha({ comercio, ofertas, ahora, cerrar }: Props) {
  const botonCerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    botonCerrar.current?.focus();
  }, [comercio.id]);

  const abierto = ahora ? estaAbierto(comercio.horario, ahora) : null;

  return (
    <>
      <div className="velo" onClick={cerrar} />
      <aside
        className="ficha"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-nombre"
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            // El único elemento enfocable es "Cerrar": el foco no sale de la ficha.
            e.preventDefault();
            botonCerrar.current?.focus();
          }
        }}
      >
        <div className="ficha__cabeza">
          <button type="button" className="ficha__cerrar" ref={botonCerrar} onClick={cerrar}>
            Cerrar ✕
          </button>
          <span className="rotulo rotulo--claro">
            {comercio.rubro} · {cuadras(comercio.cuadras)}
          </span>
          <h2 className="angosto ficha__nombre" id="ficha-nombre">
            {comercio.nombre}
          </h2>
          {abierto === null ? null : (
            <span className="estado estado--claro">{abierto ? "Abierto ahora" : "Cerrado ahora"}</span>
          )}
        </div>
        <div className="ficha__cuerpo">
          <p className="ficha__voz">{comercio.voz}</p>
          <dl className="datos">
            <dt>Dirección</dt>
            <dd>{comercio.direccion}</dd>
            <dt>Horario</dt>
            <dd>{comercio.horario}</dd>
            <dt>WhatsApp</dt>
            <dd>
              387 4XX-XXXX <span className="datos__ejemplo">(ejemplo)</span>
            </dd>
          </dl>
          <span className="rotulo rotulo--monte">
            {ofertas.length ? "Su oferta de esta semana" : "Esta semana no publicó ofertas"}
          </span>
          {ofertas.map((o) => (
            <Oferta key={o.producto} oferta={o} comercio={comercio} ahora={ahora} />
          ))}
          <span className="boton boton--principal ficha__wa">Escribile por WhatsApp</span>
        </div>
      </aside>
    </>
  );
}
