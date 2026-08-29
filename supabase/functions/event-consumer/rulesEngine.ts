// supabase/functions/event-consumer/rulesEngine.ts

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { DomainEvent } from "../_shared/types.ts";
import { createInsight, updateSessionStatus } from "./readModels.ts";
import { dispatchAiJob } from "./aiJobDispatcher.ts";

export async function evaluateRules(supabase: SupabaseClient, event: DomainEvent) {
  switch (event.event_type) {
    
    case "DOR_RELATADA": {
      const insightId = await createInsight(supabase, {
        aluno_id: event.target_aluno_id,
        actor_id: event.actor_id,
        source_event_id: event.id,
        type: "DOR_RELATADA",
        priority: "CRITICA",
        title: "Aluno relatou dor no treino",
        description: `O aluno relatou dor. Intensidade: ${event.payload.intensidade || 'Não informada'}.`,
        context_data: event.payload
      });

      if (insightId) {
        await dispatchAiJob(supabase, {
          source_event_id: event.id,
          insight_id: insightId,
          purpose: "DOR_EXERCICIO"
        });
      }
      break;
    }

    case "EXERCICIO_SUBSTITUIDO": {
      await createInsight(supabase, {
        aluno_id: event.target_aluno_id,
        actor_id: event.actor_id,
        source_event_id: event.id,
        type: "AUTONOMIA_EXCESSIVA",
        priority: "MEDIA",
        title: "Exercício Substituído",
        description: `O aluno substituiu um exercício. Motivo: ${event.payload.motivo || 'N/A'}.`,
        context_data: event.payload
      });
      break;
    }

    case "EXERCICIO_PULADO": {
      await createInsight(supabase, {
        aluno_id: event.target_aluno_id,
        actor_id: event.actor_id,
        source_event_id: event.id,
        type: "AUTONOMIA_EXCESSIVA",
        priority: "BAIXA",
        title: "Exercício Pulado",
        description: `O aluno pulou o exercício. Motivo: ${event.payload.motivo || 'N/A'}.`,
        context_data: event.payload
      });
      break;
    }

    case "TREINO_FINALIZADO": {
      if (event.session_id) {
        await updateSessionStatus(supabase, event.session_id, "FINALIZADA");
      }
      break;
    }

    default:
      console.log(`Evento ${event.event_type} não tem regras na V1. Status atualizado.`);
      break;
  }
}