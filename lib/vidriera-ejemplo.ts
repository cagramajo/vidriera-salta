// Datos de ejemplo de la vidriera (spec 004). Los campos copian las tablas `comercios` y `ofertas`
// que vendrán, para que pasar a la base cambie solo el origen. `vence` son días desde hoy.
// Comercios, precios, direcciones y teléfonos son inventados.

export type Comercio = {
  id: number;
  nombre: string;
  rubro: string;
  direccion: string;
  cuadras: number;
  horario: string;
  x: number;
  y: number;
  voz: string;
};

export type Oferta = {
  comercio: number;
  producto: string;
  precio: string;
  unidad: string;
  vence: number;
  nota: string;
};

export const COMERCIOS: Comercio[] = [
  { id: 1, nombre: "Carnicería Don Pocho", rubro: "Carnicería", direccion: "Felipe Varela 2140", cuadras: 1, horario: "8 a 13 y 17 a 21", x: 700, y: 630, voz: "Siempre buena carne. Cuando hay oferta, es de verdad." },
  { id: 2, nombre: "Almacén de Gladis", rubro: "Almacén", direccion: "J. M. de Rosas 860", cuadras: 2, horario: "7:30 a 22", x: 1000, y: 330, voz: "Lo de todos los días, más barato que en el súper." },
  { id: 3, nombre: "Verdulería La Quebrada", rubro: "Verdulería", direccion: "Castillo 1320", cuadras: 4, horario: "8 a 14 y 17 a 21", x: 1150, y: 750, voz: "Verdura fresca de la feria, todas las mañanas." },
  { id: 4, nombre: "Panadería El Horno", rubro: "Panadería", direccion: "Felipe Varela 2310", cuadras: 2, horario: "6 a 13 y 16 a 21", x: 1300, y: 540, voz: "Pan casero y bollos calentitos desde las 6." },
  { id: 5, nombre: "Ferretería Chalimín", rubro: "Ferretería", direccion: "Chalimín 455", cuadras: 5, horario: "8:30 a 13 y 16:30 a 20:30", x: 530, y: 770, voz: "Si se rompió algo en tu casa, acá está el repuesto." },
  { id: 6, nombre: "Kiosco Los Primos", rubro: "Kiosco", direccion: "J. V. González 1180", cuadras: 3, horario: "24 horas", x: 620, y: 380, voz: "Abierto siempre, con carga SUBE." },
  { id: 7, nombre: "Pollería Doña Rosa", rubro: "Pollería", direccion: "Á. Vargas 770", cuadras: 4, horario: "8 a 14 y 17 a 21", x: 210, y: 520, voz: "Pollo fresco y milanesas armadas." },
  { id: 8, nombre: "Despensa Fortín", rubro: "Almacén", direccion: "Fortín Cerrillos 210", cuadras: 5, horario: "8 a 21", x: 1480, y: 270, voz: "La despensa de la esquina, con fiado para los de siempre." },
];

export const OFERTAS: Oferta[] = [
  { comercio: 1, producto: "Asado de novillo", precio: "8.900", unidad: "el kilo", vence: 0, nota: "Hasta agotar. Llevando 3 kilos, la tira de chorizo sale a mitad de precio." },
  { comercio: 2, producto: "Yerba 1 kg", precio: "3.450", unidad: "c/u", vence: 2, nota: "Marcas de primera. Máximo 4 por persona." },
  { comercio: 3, producto: "Tomate perita", precio: "1.200", unidad: "el kilo", vence: 0, nota: "Llegó hoy de la feria. Si llevás 2 kilos, el morrón va de regalo." },
  { comercio: 4, producto: "Docena de bollos", precio: "2.800", unidad: "la docena", vence: 6, nota: "Todos los días de la semana, de 17 a 20." },
  { comercio: 7, producto: "Milanesas de pollo", precio: "6.500", unidad: "el kilo", vence: 1, nota: "Ya rebozadas, listas para el horno." },
  { comercio: 6, producto: "Gaseosa 2,25 L + alfajor", precio: "2.990", unidad: "el combo", vence: 0, nota: "El combo de la tarde, solo hoy." },
  { comercio: 5, producto: "Cuerito para canilla", precio: "350", unidad: "c/u", vence: 4, nota: "Te explicamos cómo cambiarlo en dos minutos." },
  { comercio: 8, producto: "Aceite girasol 1,5 L", precio: "2.650", unidad: "c/u", vence: 3, nota: "Precio fijo toda la semana." },
];
