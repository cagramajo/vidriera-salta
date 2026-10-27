import { ElegirTipo } from "./ElegirTipo";
import { ZonaMapa } from "./ZonaMapa";

export function Neighbors() {
  return (
    <section id="vecinos" aria-labelledby="vecinos-titulo" className="seccion">
      <div className="contenedor vecinos__fila">
        <div className="vecinos__texto">
          <p className="rotulo rotulo--monte">Para vecinos</p>
          <h2 id="vecinos-titulo" className="titulo-seccion">Enterate de lo que hay a la vuelta</h2>
          <p className="vecinos__bajada">
            Las ofertas del almacén, la carnicería y los comercios de tu barrio, en un solo lugar. Sin buscar en
            grupos, sin publicidad de toda la ciudad: solo lo que tenés a pocas cuadras.
          </p>
          <ElegirTipo tipo="vecino" className="boton boton--oscuro boton--auto">Avisame cuando arranque</ElegirTipo>
        </div>
        <figure className="zona">
          <div className="zona__mapa">
            <ZonaMapa etiqueta="Esquema del barrio: la zona de Vidriera Salta alrededor del cruce de Juan Manuel de Rosas y Felipe Varela" />
          </div>
          <figcaption className="zona__pie">La zona de Vidriera Salta, a pocas cuadras del cruce. Esquema, no a escala.</figcaption>
        </figure>
      </div>
    </section>
  );
}
