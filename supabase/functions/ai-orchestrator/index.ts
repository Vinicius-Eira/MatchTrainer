import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { data: jobs, error: reserveError } = await supabaseAdmin.rpc('rpc_reserve_next_ai_job');
    if (reserveError || !jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: "No pending jobs" }), { status: 200 });
    }

    const job = jobs[0];

    try {
      const { data: contextData, error: contextError } = await supabaseAdmin.rpc('build_student_context', {
        p_insight_id: job.insight_id
      });
      if (contextError || !contextData) throw new Error("Falha ao construir contexto.");

      const promptText = `
        Analise o seguinte contexto de treino e forneça uma adaptação segura.
        Contexto: ${JSON.stringify(contextData.current_event)}
        Diretriz: ${contextData.system_directive}
        
        RETORNE EXATAMENTE UM JSON COM AS SEGUINTES CHAVES:
        "suggested_exercise_name" (string),
        "reasoning" (string),
        "confidence" (string: ALTA, MEDIA ou BAIXA),
        "recommended_action" (string)
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });

      if (!geminiResponse.ok) throw new Error(`Gemini API falhou: ${geminiResponse.status}`);
      const geminiData = await geminiResponse.json();
      
      const rawText = geminiData.candidates[0].content.parts[0].text;
      const structuredResult = JSON.parse(rawText);

      if (!structuredResult.suggested_exercise_name || !structuredResult.reasoning) {
        throw new Error("JSON retornado pela IA está incompleto.");
      }

      await supabaseAdmin.from('ai_suggestions').insert({
        job_id: job.id,
        insight_id: job.insight_id,
        context_snapshot: contextData,
        suggested_exercise_name: structuredResult.suggested_exercise_name,
        reasoning: structuredResult.reasoning,
        confidence: structuredResult.confidence
      });

      await supabaseAdmin.from('ai_jobs').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('id', job.id);

      return new Response(JSON.stringify({ success: true, job_id: job.id }), { status: 200 });

    } catch (processError) {
      await supabaseAdmin.from('ai_jobs').update({ 
        status: 'FAILED', 
        last_error: processError.message 
      }).eq('id', job.id);
      throw processError;
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});