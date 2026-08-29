import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { DomainEvent } from "../_shared/types.ts";
import { evaluateRules } from "./rulesEngine.ts";

export async function processEvent(supabase: SupabaseClient, event: DomainEvent) {
  const { data: dbEvent, error: fetchError } = await supabase
    .from("domain_events")
    .select("ingestion_status")
    .eq("id", event.id)
    .single();

  if (fetchError || !dbEvent) {
    throw new Error(`Evento não encontrado no banco de dados: ${event.id}`);
  }

  if (dbEvent.ingestion_status === "PROCESSADO") {
    console.log(`Evento ${event.id} já processado. Ignorando.`);
    return;
  }

  await evaluateRules(supabase, event);

  const { error: updateError } = await supabase
    .from("domain_events")
    .update({ 
      ingestion_status: "PROCESSADO", 
      processed_at: new Date().toISOString() 
    })
    .eq("id", event.id);

  if (updateError) {
    throw new Error(`Falha ao atualizar status do evento ${event.id}: ${updateError.message}`);
  }

  console.log(`Evento ${event.id} processado com sucesso.`);
}