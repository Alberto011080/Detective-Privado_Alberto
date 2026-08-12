// supabase/functions/juezia/index.ts
//
// Edge Function que actúa de intermediario seguro entre la web (GitHub Pages)
// y la API de Anthropic. La clave de API nunca viaja al navegador del usuario.
//
// Despliegue:
//   supabase functions new juezia   (sustituye el index.ts generado por este)
//   supabase secrets set ANTHROPIC_API_KEY=tu_clave_aqui
//   supabase functions deploy juezia --no-verify-jwt

const SYSTEM_PROMPT = `Eres el asistente de Orientación Legal del sitio web de Alberto Casaus, detective privado acreditado en España. Respondes siempre en español y sobre derecho español, de forma BREVE Y RESUMIDA.

Devuelve SIEMPRE tu respuesta como JSON puro, sin texto adicional, sin markdown y sin bloques de código, exactamente con este formato:
{"fundamento":"...","desglose":"...","resumen":"..."}

- "fundamento": 1-2 frases con el principio legal, la norma o la jurisprudencia española aplicable (menciona la ley o el ámbito jurídico relevante; si no estás seguro de un artículo exacto, habla en términos generales sin inventar números de artículo).
- "desglose": máximo 3 frases, en lenguaje cotidiano y cercano, como si se lo explicaras a alguien sin formación jurídica.
- "resumen": 1-2 frases con la conclusión práctica, y SIEMPRE termina recomendando expresamente consultar con un abogado o graduado social colegiado para el caso concreto.

Tono: serio pero cercano, muy directo y breve, sin tecnicismos innecesarios. No inventes datos ni cites sentencias concretas que no conozcas con certeza. Esto es una orientación general, no asesoramiento legal personalizado.`;

Deno.serve(async (req: Request) => {
  // Cabeceras CORS: necesarias para que GitHub Pages pueda llamar a esta función
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // en producción, mejor restringir a tu dominio exacto
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pregunta } = await req.json();

    if (!pregunta || typeof pregunta !== "string") {
      return new Response(JSON.stringify({ error: "Falta la pregunta" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: pregunta }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Error de Anthropic (${anthropicRes.status}): ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await anthropicRes.json();
    const text = (data.content ?? []).map((b: any) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("No se pudo parsear la respuesta de Claude:", text);
      return new Response(
        JSON.stringify({ error: "La IA no devolvió un JSON válido", raw: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error inesperado en la función:", err);
    return new Response(
      JSON.stringify({ error: "No se ha podido procesar la consulta: " + String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
