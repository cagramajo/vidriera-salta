const PROBLEMAS = [
  { titulo: "La vereda", texto: "Sacás el cartel con tus precios y ofertas todos los días. Llega a los que pasan, nada más." },
  { titulo: "Facebook", texto: "Publicás en el grupo y tu oferta se pierde entre cientos de posts de toda la ciudad." },
  {
    titulo: "Las apps",
    texto: "Google Maps, Instagram, WhatsApp Business: todo existe, pero aprenderlo lleva un tiempo que no tenés.",
  },
];

const PASOS = [
  { titulo: "Nos contás qué querés ofrecer", texto: "Por WhatsApp o en persona. Una foto del cartel alcanza." },
  {
    titulo: "La IA la escribe a tu estilo",
    texto: "Tu publicación sale con la impronta de tu negocio. La ves antes de que se publique.",
  },
  {
    titulo: "Vos elegís el día y cuánto dura",
    texto: "El día que la necesites, de 1 a 7 días. Tu ficha queda fija con dirección y contacto.",
  },
];

export function Problem() {
  return (
    <section aria-labelledby="problema-titulo" className="seccion">
      <div className="contenedor seccion__columna">
        <h2 id="problema-titulo" className="titulo-seccion titulo-seccion--ancho">
          Tu cartel solo lo ve quien pasa por la puerta
        </h2>
        <div className="fila-tarjetas">
          {PROBLEMAS.map((p) => (
            <div key={p.titulo} className="tarjeta">
              <span className="tarjeta__titulo">{p.titulo}</span>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section id="comercios" aria-labelledby="como-titulo" className="seccion seccion--sombra">
      <div className="contenedor seccion__columna seccion__columna--ancha">
        <div className="seccion__cabeza">
          <p className="rotulo rotulo--claro">Para comercios</p>
          <h2 id="como-titulo" className="titulo-seccion">Nosotros hacemos el trabajo. Vos atendés.</h2>
        </div>
        <ol className="fila-tarjetas pasos">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="paso">
              <span aria-hidden="true" className="paso__numero">{i + 1}</span>
              <span className="paso__titulo">{p.titulo}</span>
              <span>{p.texto}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section aria-labelledby="precios-titulo" className="seccion">
      <div className="contenedor seccion__columna">
        <h2 id="precios-titulo" className="titulo-seccion">Probalo un mes sin pagar nada</h2>
        <div className="fila-tarjetas fila-tarjetas--estirar">
          <div className="precio precio--destacado">
            <span className="precio__rotulo">Primer mes</span>
            <span className="precio__cifra">Gratis</span>
            <span>Tu ficha del comercio + 1 publicación por semana.</span>
          </div>
          <div className="precio">
            <span className="precio__rotulo">Por mes</span>
            <span className="precio__cifra">$5.000</span>
            <span>La ficha + 1 publicación por semana, el día que elijas.</span>
          </div>
          <div className="precio">
            <span className="precio__rotulo">Pack 3 meses</span>
            <span className="precio__cifra precio__cifra--monte">$10.000</span>
            <span>Lo mismo, tres meses, por menos.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
