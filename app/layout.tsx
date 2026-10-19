import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--fuente-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vidriera Salta — el cartel de tu vereda, en el celular del barrio",
  description:
    "Publicidad para los comercios chicos del barrio. Nos contás tu oferta, la escribimos con IA a tu estilo, y les llega a los vecinos el día que vos elijas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
