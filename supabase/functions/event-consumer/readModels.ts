import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { InsightPriority, InsightType } from "../_shared/types.ts";

export async function createInsight(
  supabase: SupabaseClient, 
  params: {
    aluno_id: string; actor_id: string; source_event_id: string;
    type: InsightType; priority: InsightPriority; title: string;
    description: string; context_data: any;
  }
): Promise<string | null> {
  const { data: vinculo } = await supabase
    .from("vinculos_personal_aluno")
    .select("personal_id")
    .eq("aluno_id", params.aluno_id)
    .eq("status", "ATIVO")
    .single();

  if (!vinculo) return null;

  const { data, error } = await supabase
    .from("insights")
    .insert({
      personal_id: vinculo.personal_id,
      aluno_id: params.aluno_id,
      source_event_id: params.source_event_id,
      type: params.type,
      priority: params.priority,
      title: params.title,
      description: params.description,
      context_data: params.context_data
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === '23505') { 
      console.log(`Insight já existe para o evento ${params.source_event_id}`);
      return null;
    }
    throw error;
  }
  return data.id;
}

export async function updateSessionStatus(supabase: SupabaseClient, sessionId: string, status: string) {
  await supabase.from("training_sessions").update({ status }).eq("id", sessionId);
}