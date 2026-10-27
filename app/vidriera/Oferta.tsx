import { cuadras, etiquetaVence } from "@/lib/vidriera";
import type { Comercio, Oferta as OfertaDato } from "@/lib/vidriera-ejemplo";

export type Abrir = (id: number, origen: HTMLElement | SVGElement) => void;

type Props = {
  oferta: OfertaDato;
  comercio: Comercio;
  /** Hora de Salta en el navegador; `null` hasta que la página se montó (la página sale estática). */
  ahora: Date | null;
  destacada?: boolean;
  /** Sin `abrir` la tarjeta no es interactiva (la que va dentro de la ficha). */
  abrir?: Abrir;
};

export function Oferta({ oferta, comercio, ahora, destacada = false, abrir }: Props) {
  const etiqueta =
    oferta.vence === 0 ? (
      <span className="etiqueta etiqueta--hoy">Solo hoy</span>
    ) : (
      <span className="etiqueta etiqueta--dias">{ahora ? etiquetaVence(oferta.vence, ahora) : "Esta semana"}</span>
    );
  const interactiva = abrir
    ? {
        tabIndex: 0,
        onClick: (e: React.MouseEvent<HTMLElement>) => abrir(comercio.id, e.currentTarget),
        onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir(comercio.id, e.currentTarget);
          }
        },
      }
    : {};
  return (
    <article
      className={`oferta${destacada ? " oferta--destacada" : ""}${abrir ? " oferta--abre" : ""}`}
      aria-label={`${oferta.producto} en ${comercio.nombre}`}
      {...interactiva}
    >
      <div className="oferta__cabeza">
        <span className="oferta__comercio">
          {comercio.nombre}
          <span className="oferta__rubro">{comercio.rubro}</span>
        </span>
        {etiqueta}
      </div>
      <div className="oferta__cuerpo">
        <span className="oferta__producto angosto">{oferta.producto}</span>
        <span className="oferta__precio">
          ${oferta.precio} <span className="oferta__unidad">{oferta.unidad}</span>
        </span>
        {destacada ? null : <p className="oferta__nota">{oferta.nota}</p>}
      </div>
      <div className="oferta__pie">
        <span className="distancia">{cuadras(comercio.cuadras)}</span>
        <span>{comercio.direccion}</span>
      </div>
      <span className="boton boton--oscuro oferta__wa">Escribile por WhatsApp</span>
    </article>
  );
}
