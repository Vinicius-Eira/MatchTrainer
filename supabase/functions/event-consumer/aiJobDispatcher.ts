import { createClient } from '@supabase/supabase-js';
import { ContextPurpose } from "../_shared/types.ts";

export async function dispatchAiJob(
  supabase: SupabaseClient,
  params: { source_event_id: string; insight_id: string; purpose: ContextPurpose }
) {
  const { error } = await supabase
    .from("ai_jobs")
    .insert({
      source_event_id: params.source_event_id,
      insight_id: params.insight_id,
      purpose: params.purpose,
      status: "PENDENTE"
    });

  if (error && error.code !== '23505') {
    throw error;
  }
  
  if (!error) console.log(`AI Job despachado para evento ${params.source_event_id}`);
}