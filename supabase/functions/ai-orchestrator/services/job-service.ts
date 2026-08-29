import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

export async function claimNextJob(supabase: SupabaseClient, workerId: string) {
  const { data, error } = await supabase.rpc("claim_next_ai_job", { p_worker_id: workerId });
  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function completeJob(supabase: SupabaseClient, jobId: string, workerId: string) {
  await supabase.from("ai_jobs")
    .update({ status: "CONCLUIDO", locked_by: null })
    .eq("id", jobId)
    .eq("locked_by", workerId)
    .eq("status", "PROCESSANDO");
}

export async function failJob(supabase: SupabaseClient, jobId: string, workerId: string, attempts: number, errorMsg: string) {
  const MAX_ATTEMPTS = 3;
  const isDead = attempts >= MAX_ATTEMPTS;
  const nextAttempt = new Date(Date.now() + (attempts * 5 * 60000)).toISOString();

  await supabase.from("ai_jobs")
    .update({ 
      status: isDead ? "FALHOU" : "RETRY", 
      last_error: errorMsg,
      next_attempt_at: nextAttempt,
      locked_by: null
    })
    .eq("id", jobId)
    .eq("locked_by", workerId)
    .eq("status", "PROCESSANDO");
}