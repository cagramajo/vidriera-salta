"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ZonaMapa } from "@/app/components/ZonaMapa";
import { contadores, cuadras, estaAbierto, fechaLarga, filtrarOfertas, venceHoy, vigentes } from "@/lib/vidriera";
import { COMERCIOS, OFERTAS } from "@/lib/vidriera-ejemplo";
import { Carrusel } from "./Carrusel";
import { Ficha } from "./Ficha";
import { Oferta, type Abrir } from "./Oferta";

const ACTIVAS = vigentes(OFERTAS);
const RUBROS = ["Todo", ...Array.from(new Set(ACTIVAS.map((o) => COMERCIOS.find((c) => c.id === o.comercio)!.rubro)))];
const DE_HOY = ACTIVAS.filter(venceHoy);
const FORMULARIO = "/?tipo=comercio#formulario";

export function VidrieraApp() {
  // "Hoy" y "ahora" se calculan en el navegador, en hora de Salta: la página sale estática y no muestra la fecha del build.
  const [ahora, setAhora] = useState<Date | null>(null);
  const [rubro, setRubro] = useState("Todo");
  const [soloHoy, setSoloHoy] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [abierta, setAbierta] = useState<number | null>(null);
  const origen = useRef<HTMLElement | SVGElement | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const reloj = setInterval(() => setAhora(new Date()), 60_000);
    return () => clearInterval(reloj);
  }, []);

  const abrir: Abrir = (id, el) => {
    origen.current = el;
    setAbierta(id);
  };
  const cerrar = () => setAbierta(null);

  // Al cerrar la ficha el foco vuelve a donde estaba (recién cuando la página dejó de estar inerte).
  useEffect(() => {
    if (abierta === null && origen.current) {
      origen.current.focus();
      origen.current = null;
    }
  }, [abierta]);

  useEffect(() => {
    if (abierta === null) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierta]);

  const visibles = useMemo(
    () => filtrarOfertas(OFERTAS, COMERCIOS, { rubro, soloHoy, busqueda }),
    [rubro, soloHoy, busqueda],
  );
  const conOferta = new Set(visibles.map((o) => o.comercio));
  const cuenta = contadores(OFERTAS, COMERCIOS);
  const comercioDe = (id: number) => COMERCIOS.find((c) => c.id === id)!;
  const fichaAbierta = abierta === null ? null : comercioDe(abierta);

  return (
    <>
      <div className="pagina vd" inert={abierta !== null} data-listo={ahora ? "si" : "no"}>
        <div className="aviso" role="note">
          Comercios y ofertas de ejemplo · los precios, direcciones y teléfonos son inventados
        </div>

        <header className="encabezado">
          <div className="contenedor encabezado__fila">
            <a className="logo" href="#hoy">
              <span className="logo__marca" aria-hidden="true">VS</span>
              <span className="logo__texto">Vidriera Salta</span>
            </a>
            <label className="buscador" htmlFor="buscar">
              <input
                id="buscar"
                type="search"
                placeholder="Buscá: pan, asado…"
                aria-label="Buscar en las ofertas del barrio"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            <a className="boton boton--principal boton--chico" href={FORMULARIO}>
              <span className="solo-escritorio">Publicá tu oferta</span>
              <span className="solo-movil">Publicá</span>
            </a>
          </div>
        </header>

        <section className="hoy" id="hoy">
          <div className="contenedor hoy__fila">
            <div className="hoy__texto">
              <span className="rotulo rotulo--claro">{ahora ? `${fechaLarga(ahora)} · ` : ""}Rosas y Felipe Varela</span>
              <h1 className="angosto">
                Lo que hay hoy <em>a la vuelta</em>
              </h1>
              <p className="hoy__bajada">
                Las ofertas de los comercios del barrio, todas a pocas cuadras. Tocá una y le escribís directo al comercio.
              </p>
              <div className="contadores">
                <span className="contador"><b>{cuenta.ofertas}</b> ofertas activas</span>
                <span className="contador"><b>{cuenta.vencenHoy}</b> vencen hoy</span>
                <span className="contador"><b>{cuenta.comercios}</b> comercios</span>
              </div>
            </div>
            <Carrusel ofertas={DE_HOY} comercios={COMERCIOS} ahora={ahora} pausado={abierta !== null} abrir={abrir} />
          </div>
        </section>

        <div className="contenedor cuerpo">
          <main className="feed" id="ofertas">
            <div className="feed__cabeza">
              <div>
                <span className="rotulo rotulo--monte">Ofertas del barrio</span>
                <h2 className="angosto titulo-seccion">Elegí qué buscás</h2>
              </div>
              <label className="interruptor" htmlFor="solo-hoy">
                <input id="solo-hoy" type="checkbox" checked={soloHoy} onChange={(e) => setSoloHoy(e.target.checked)} />{" "}
                Solo las que vencen hoy
              </label>
            </div>
            <div className="filtros" role="group" aria-label="Filtrar por rubro">
              {RUBROS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="filtro"
                  data-rubro={r}
                  aria-pressed={r === rubro}
                  onClick={() => setRubro(r)}
                >
                  {r}
                  <span className="n">
                    {r === "Todo" ? ACTIVAS.length : ACTIVAS.filter((o) => comercioDe(o.comercio).rubro === r).length}
                  </span>
                </button>
              ))}
            </div>
            <p className="solo-lector" role="status">
              {visibles.length === 0 ? "Nada por acá, por ahora" : visibles.length === 1 ? "1 oferta" : `${visibles.length} ofertas`}
            </p>
            <div className="grilla">
              {visibles.length ? (
                visibles.map((o) => (
                  <Oferta key={o.producto} oferta={o} comercio={comercioDe(o.comercio)} ahora={ahora} abrir={abrir} />
                ))
              ) : (
                <div className="vacio">
                  <strong className="angosto">Nada por acá, por ahora</strong>
                  <p>No hay ofertas con ese filtro. Probá con &quot;Todo&quot; o sacá &quot;Solo las que vencen hoy&quot;.</p>
                </div>
              )}
            </div>
          </main>

          <aside className="lateral" aria-label="Mapa del barrio">
            <span className="rotulo rotulo--monte">Dónde queda cada uno</span>
            <figure className="mapa">
              <ZonaMapa etiqueta="Esquema de la zona de Vidriera Salta alrededor del cruce de Juan Manuel de Rosas y Felipe Varela, con un punto por cada comercio">
                <g>
                  {COMERCIOS.map((c) => (
                    <g
                      key={c.id}
                      className={`pin${conOferta.has(c.id) ? " pin--oferta" : ""}${abierta === c.id ? " pin--activo" : ""}`}
                      data-comercio={c.id}
                      tabIndex={0}
                      role="button"
                      aria-label={c.nombre}
                      onClick={(e) => abrir(c.id, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          abrir(c.id, e.currentTarget);
                        }
                      }}
                    >
                      <circle className="pin__area" cx={c.x} cy={c.y} r="64" />
                      <circle className="pin__punto" cx={c.x} cy={c.y} r="40" />
                      <text x={c.x} y={c.y}>{c.id}</text>
                    </g>
                  ))}
                </g>
              </ZonaMapa>
              <figcaption className="mapa__pie">Esquema, no a escala. Tocá un punto para ver la ficha.</figcaption>
            </figure>
            <div className="leyenda">
              <span><i className="leyenda__oferta" />Con oferta hoy</span>
              <span><i className="leyenda__ficha" />Ficha del comercio</span>
            </div>
            <div className="caja-comercio">
              <span className="rotulo rotulo--claro">¿Tenés un comercio acá?</span>
              <h3 className="angosto">Tu oferta en esta lista mañana</h3>
              <p>
                Mandanos una foto de tu cartel por WhatsApp. La escribimos a tu estilo y vos elegís el día. El primer mes
                es gratis.
              </p>
              <a className="boton boton--principal boton--chico" href={FORMULARIO}>Sumá tu comercio</a>
            </div>
          </aside>
        </div>

        <section className="directorio" id="comercios">
          <div className="contenedor directorio__columna">
            <div>
              <span className="rotulo rotulo--monte">Directorio</span>
              <h2 className="angosto titulo-seccion">Los comercios del barrio</h2>
            </div>
            <ul className="fichas">
              {COMERCIOS.map((c) => {
                const n = ACTIVAS.filter((o) => o.comercio === c.id).length;
                const abierto = ahora ? estaAbierto(c.horario, ahora) : null;
                return (
                  <li key={c.id}>
                    <button type="button" className="ficha-mini" onClick={(e) => abrir(c.id, e.currentTarget)}>
                      <span className="ficha-mini__fila">
                        <span className="num">{c.id}</span>
                        {abierto === null ? null : (
                          <span className={`estado${abierto ? "" : " estado--cerrado"}`}>
                            {abierto ? "Abierto ahora" : "Cerrado ahora"}
                          </span>
                        )}
                      </span>
                      <span className="ficha-mini__nombre angosto">{c.nombre}</span>
                      <span className="ficha-mini__dato">
                        {c.rubro} · {c.direccion} · {cuadras(c.cuadras)}
                      </span>
                      <span className="ficha-mini__dato">
                        {n === 0 ? "Sin ofertas esta semana" : n === 1 ? "1 oferta activa" : `${n} ofertas activas`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <footer className="pie">
          <div className="contenedor pie__fila">
            <span className="pie__marca">Vidriera Salta</span>
            <p className="pie__texto">
              Publicidad para los comercios chicos de la zona de Juan Manuel de Rosas y Felipe Varela, en el sudoeste de
              Salta. Sin supermercados ni cadenas: solo lo que tenés a pocas cuadras.
            </p>
          </div>
        </footer>
      </div>

      {fichaAbierta ? (
        <Ficha
          comercio={fichaAbierta}
          ofertas={ACTIVAS.filter((o) => o.comercio === fichaAbierta.id)}
          ahora={ahora}
          cerrar={cerrar}
        />
      ) : null}
    </>
  );
}
