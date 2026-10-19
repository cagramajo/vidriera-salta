"use client";

import type { ReactNode } from "react";
import type { Tipo } from "@/lib/leads";

export const EVENTO_TIPO = "vs:tipo";

export function ElegirTipo({ tipo, className, children }: { tipo: Tipo; className: string; children: ReactNode }) {
  return (
    <a
      href="#formulario"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent<Tipo>(EVENTO_TIPO, { detail: tipo }))}
    >
      {children}
    </a>
  );
}
