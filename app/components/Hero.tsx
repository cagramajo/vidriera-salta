import { ElegirTipo } from "./ElegirTipo";

export function Hero() {
  return (
    <section id="inicio" className="inicio">
      <div className="contenedor inicio__fila">
        <div className="inicio__texto">
          <p className="etiqueta-zona">A pocas cuadras de Juan Manuel de Rosas y Felipe Varela</p>
          <h1 className="titulo-inicio">El cartel de tu vereda, en el celular de todo el barrio</h1>
          <p className="bajada">
            Publicidad para los comercios chicos del barrio. Nos contás tu oferta, la escribimos con IA a tu estilo,
            y les llega a los vecinos el día que vos elijas.
          </p>
          <div className="botones">
            <ElegirTipo tipo="comercio" className="boton boton--principal">Sumá tu comercio — primer mes gratis</ElegirTipo>
            <ElegirTipo tipo="vecino" className="boton boton--secundario">Quiero ver las ofertas</ElegirTipo>
          </div>
        </div>
        <div className="inicio__ejemplo">
          <p className="rotulo">Así se ve una publicación</p>
          <article aria-label="Ejemplo de publicación" className="publicacion">
            <div className="publicacion__cabeza">
              <span className="publicacion__comercio">Carnicería [NOMBRE]</span>
              <span className="publicacion__etiqueta">Solo hoy</span>
            </div>
            <div className="publicacion__cuerpo">
              <span className="publicacion__producto">[PRODUCTO EN OFERTA]</span>
              <span className="publicacion__precio">
                $[PRECIO]<span className="publicacion__unidad"> el kilo</span>
              </span>
              <span className="publicacion__direccion">[Dirección] · a 2 cuadras de la esquina</span>
            </div>
            <a href="#formulario" className="boton boton--oscuro publicacion__boton">Escribile por WhatsApp</a>
          </article>
        </div>
      </div>
    </section>
  );
}
