"use client";

import { useEffect, useState } from "react";
import type { Comercio, Oferta as OfertaDato } from "@/lib/vidriera-ejemplo";
import { Oferta, type Abrir } from "./Oferta";

const CADA_MS = 3000;

type Props = {
  ofertas: OfertaDato[];
  comercios: Comercio[];
  ahora: Date | null;
  /** Con la ficha abierta el carrusel espera. */
  pausado: boolean;
  abrir: Abrir;
};

export function Carrusel({ ofertas, comercios, ahora, pausado, abrir }: Props) {
  const [actual, setActual] = useState(0);
  const n = ofertas.length;

  // Cada cambio (solo o a mano) reinicia la cuenta, porque `actual` está en las dependencias.
  useEffect(() => {
    if (n < 2 || pausado) return;
    const reloj = setTimeout(() => setActual((i) => (i + 1) % n), CADA_MS);
    return () => clearTimeout(reloj);
  }, [actual, n, pausado]);

  if (n === 0) return null;
  const oferta = ofertas[actual % n];
  const comercio = comercios.find((c) => c.id === oferta.comercio);
  if (!comercio) return null;
  const ir = (i: number) => setActual((i + n) % n);

  return (
    <div className="carrusel" role="region" aria-roledescription="carrusel" aria-label="Ofertas que vencen hoy">
      <div className="carrusel__escenario">
        <Oferta key={actual} oferta={oferta} comercio={comercio} ahora={ahora} destacada abrir={abrir} />
      </div>
      <div className="carrusel__controles">
        <button type="button" className="carrusel__flecha" aria-label="Oferta anterior" onClick={() => ir(actual - 1)}>
          ←
        </button>
        <div className="carrusel__puntos">
          {ofertas.map((o, i) => (
            <button
              key={o.producto}
              type="button"
              className="carrusel__punto"
              aria-label={`Ver oferta ${i + 1}: ${o.producto}`}
              aria-current={i === actual}
              onClick={() => ir(i)}
            />
          ))}
        </div>
        <button type="button" className="carrusel__flecha" aria-label="Oferta siguiente" onClick={() => ir(actual + 1)}>
          →
        </button>
      </div>
    </div>
  );
}
