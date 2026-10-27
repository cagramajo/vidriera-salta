import type { ReactNode } from "react";

// Dibujo aprobado de la zona: copia inline de docs/design/mapa-zona.svg (fuente de verdad).
// `children` se dibuja encima, en las mismas coordenadas del viewBox.
export function ZonaMapa({ etiqueta, children }: { etiqueta: string; children?: ReactNode }) {
  return (
    <svg
      viewBox="20 40 1740 860"
      role="img"
      aria-label={etiqueta}
    >
      <rect x="20" y="40" width="1740" height="860" fill="#fff" />
      <polygon
        points="55,297 470,290 560,262 700,235 850,200 920,195 1020,180 1180,152 1260,130 1430,100 1590,90 1630,330 1650,390 1675,560 1700,700 1710,815 1500,808 1300,815 1100,825 900,845 700,850 520,862 405,870 398,728 250,725 100,735 68,740"
        className="zona__borde"
      />
      <line x1="370" y1="604" x2="1620" y2="402" className="zona__trazo" />
      <line x1="880" y1="205" x2="948" y2="511" className="zona__trazo" />
      <circle cx="948" cy="511" r="34" fill="#f59bbe" stroke="#fff" strokeWidth="10" />
      <text x="1080" y="461.6688" transform="rotate(-9.2 1080 461.6688)" className="zona__rotulo">Felipe Varela</text>
      <text x="800" y="215" transform="rotate(77.5 800 215)" className="zona__rotulo">J. M. de Rosas</text>
      <text x="330" y="365.8688" transform="rotate(-7.2 330 365.8688)" className="zona__rotulo-borde">J. V. González</text>
      <text x="950" y="874" transform="rotate(-1.2 950 874)" className="zona__rotulo-borde">Castillo</text>
      <text x="85" y="712" transform="rotate(-1.2 85 712)" className="zona__rotulo-borde">Á. Vargas</text>
      <text x="352" y="655" transform="rotate(77.5 352 655)" className="zona__rotulo-borde">Chalimín</text>
      <text x="1612" y="102" transform="rotate(81.5 1612 102)" className="zona__rotulo-borde">Fortín Cerrillos</text>
      {children}
    </svg>
  );
}
