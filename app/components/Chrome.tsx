import { ElegirTipo } from "./ElegirTipo";

export function Header() {
  return (
    <header className="encabezado">
      <div className="contenedor encabezado__fila">
        <a href="#inicio" className="logo">
          <span className="logo__marca" aria-hidden="true">V</span>
          <span className="logo__texto">Vidriera Salta</span>
        </a>
        <nav aria-label="Secciones" className="menu">
          <a href="#comercios" className="menu__link">Para comercios</a>
          <a href="#vecinos" className="menu__link">Para vecinos</a>
          <ElegirTipo tipo="comercio" className="boton boton--principal boton--chico">Sumá tu comercio</ElegirTipo>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="pie">
      <div className="contenedor pie__fila">
        <span className="pie__marca">Vidriera Salta</span>
        <span className="pie__texto">
          Privacidad: guardamos tu nombre y tu email solo para contactarte por Vidriera Salta. Para pedir que los
          borremos, escribinos a <a href="mailto:echarly02@gmail.com">echarly02@gmail.com</a>.
        </span>
      </div>
    </footer>
  );
}
