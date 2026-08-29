/* eslint-disable import/no-unresolved */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAiResponse } from "../utils/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export class JobService {
  private supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  async claimNextJob() {
    const { data, error } = await this.supabase.rpc('rpc_reserve_next_ai_job');
    if (error) throw new Error(`Erro ao reservar job: ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
  }

  async getJobContext(insightId: string) {
    const { data, error } = await this.supabase.rpc('build_student_context', { p_insight_id: insightId });
    if (error || !data) throw new Error(`Erro ao montar contexto: ${error?.message}`);
    return data;
  }

  async completeJob(job: any, aiResult: any, context: any) {
    const validatedData = validateAiResponse(aiResult.rawText);

    const costUsd = (aiResult.tokensInput * 0.000000075) + (aiResult.tokensOutput * 0.0000003);

    const { error: insertError } = await this.supabase.from('ai_suggestions').insert({
      job_id: job.id,
      insight_id: job.insight_id,
      context_snapshot: context,
      suggested_exercise_name: validatedData.suggested_exercise_name,
      reasoning: validatedData.reasoning,
      confidence: validatedData.confidence,
      model_provider: 'google',
      model_name: 'gemini-1.5-flash',
      tokens_input: aiResult.tokensInput,
      tokens_output: aiResult.tokensOutput,
      cost_usd: costUsd,
      raw_response: validatedData 
    });

    if (insertError) throw new Error(`Falha ao salvar sugestão: ${insertError.message}`);

    // 4. Marca Job como Concluído
    await this.supabase.from('ai_jobs').update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    }).eq('id', job.id);
  }

  async failJob(job: any, errorMessage: string) {
    await this.supabase.from('ai_jobs').update({
      status: 'FAILED',
      last_error: errorMessage
    }).eq('id', job.id);
  }
}