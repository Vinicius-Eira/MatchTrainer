/* eslint-disable import/no-unresolved */
import { z } from "npm:zod";

export const StructuredSuggestionSchema = z.object({
  category: z.enum(['ADAPTACAO_EXERCICIO', 'MUDANCA_VOLUME', 'MENSAGEM_MOTIVACIONAL']),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']),
  title: z.string(),
  summary: z.string(),
  recommended_action: z.object({
    action_type: z.enum(['SUBSTITUIR_EXERCICIO', 'AJUSTAR_CARGA', 'MANTER']),
    exercise_original_id: z.string().nullable().optional(),
    exercise_substitute_id: z.string().nullable().optional(),
    reason: z.string()
  }),
  message_to_student: z.string()
});

export type StructuredSuggestion = z.infer<typeof StructuredSuggestionSchema>;