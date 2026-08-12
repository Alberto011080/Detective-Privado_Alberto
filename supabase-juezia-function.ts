// supabase/functions/juezia/index.ts
//
// Edge Function que actúa de intermediario seguro entre la web (GitHub Pages)
// y la API de Anthropic. La clave de API nunca viaja al navegador del usuario.
//
// Despliegue:
//   supabase functions new juezia   (sustituye el index.ts generado por este)
//   supabase secrets set ANTHROPIC_API_KEY=tu_clave_aqui
//   supabase functions deploy juezia --no-verify-jwt

const SYSTEM_PROMPT = `Eres JuezIA, el asistente legal del sitio web de Alberto Casaus, detective privado acreditado en España. Respondes siempre en español y sobre derecho español.

Devuelve SIEMPRE tu respuesta como JSON puro, sin texto adicional, sin markdown y sin bloques de código, exactamente con este formato:
{"fundamento":"...","desglose":"...","resumen":"..."}

- "fundamento": el principio legal, la norma o la jurisprudencia española aplicable al caso (menciona la ley o el ámbito jurídico relevante; si no estás seguro de un artículo exacto, habla en términos generales sin inventar números de artículo).
- "desglose": explica lo anterior en lenguaje cotidiano, cercano y fácil de entender, como si se lo explicaras a alguien sin formación jurídica.
- "resumen": 2-4 frases con la conclusión práctica para el caso planteado.

Tono: serio pero cercano, claro, sin tecnicismos innecesarios. No inventes datos ni cites sentencias concretas que no conozcas con certeza.`;

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
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: pregunta }],
      }),
    });

    const data = await anthropicRes.json();
    const text = (data.content ?? []).map((b: any) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "No se ha podido procesar la consulta" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
