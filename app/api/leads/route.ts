import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validarLead } from "@/lib/leads";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const validacion = validarLead(cuerpo);
  if (!validacion.ok) {
    return NextResponse.json({ ok: false, error: validacion.error }, { status: 400 });
  }

  // Campo trampa: un bot lo llena; respondemos como si hubiera salido bien y no tocamos la base.
  if (validacion.trampa) return NextResponse.json({ ok: true });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Base no configurada." }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("leads").insert(validacion.lead);

  // Email repetido: se responde igual que un alta nueva.
  if (error && error.code !== "23505") {
    return NextResponse.json({ ok: false, error: "No se pudo guardar." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
