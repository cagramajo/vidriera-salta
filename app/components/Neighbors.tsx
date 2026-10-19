import { ElegirTipo } from "./ElegirTipo";

export function Neighbors() {
  return (
    <section id="vecinos" aria-labelledby="vecinos-titulo" className="seccion">
      <div className="contenedor vecinos__fila">
        <div className="vecinos__texto">
          <p className="rotulo rotulo--monte">Para vecinos</p>
          <h2 id="vecinos-titulo" className="titulo-seccion">Enterate de lo que hay a la vuelta</h2>
          <p className="vecinos__bajada">
            Las ofertas del almacén, la carnicería y los comercios de tu barrio, en un solo lugar. Sin buscar en
            grupos, sin publicidad de toda la ciudad: solo lo que tenés a 5 cuadras.
          </p>
          <ElegirTipo tipo="vecino" className="boton boton--oscuro boton--auto">Avisame cuando arranque</ElegirTipo>
        </div>
        <figure
          role="img"
          aria-label="Esquema de la zona: 5 cuadras alrededor de la esquina de Juan Manuel de Rosas y Felipe Varela"
          className="zona"
        >
          <div className="zona__mapa">
            <div className="zona__calle zona__calle--h" />
            <div className="zona__calle zona__calle--v" />
            <span className="zona__nombre zona__nombre--h">J. M. de Rosas</span>
            <span className="zona__nombre zona__nombre--v">Felipe Varela</span>
            <span className="zona__punto" />
          </div>
          <figcaption className="zona__pie">5 cuadras para cada lado de la esquina. Esquema, no a escala.</figcaption>
        </figure>
      </div>
    </section>
  );
}
