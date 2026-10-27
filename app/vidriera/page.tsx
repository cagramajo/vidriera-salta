import type { Metadata } from "next";
import { VidrieraApp } from "./VidrieraApp";
import "./vidriera.css";

export const metadata: Metadata = {
  title: "Vidriera Salta — lo que hay hoy a la vuelta",
  description:
    "Las ofertas de los comercios del barrio de Juan Manuel de Rosas y Felipe Varela, en Salta. Versión de ejemplo.",
};

export default function Vidriera() {
  return <VidrieraApp />;
}
