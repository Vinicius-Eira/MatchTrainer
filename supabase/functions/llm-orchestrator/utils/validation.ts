import { z } from "npm:zod";

const aiResponseSchema = z.object({
  suggested_exercise_name: z.string().min(1, "Nome do exercício é obrigatório"),
  reasoning: z.string().min(10, "Justificativa precisa ser detalhada"),
  confidence: z.enum(["ALTA", "MEDIA", "BAIXA"]),
  recommended_action: z.string().min(1, "Ação recomendada é obrigatória")
});

export type AiResponse = z.infer<typeof aiResponseSchema>;

export function validateAiResponse(rawText: string): AiResponse {
  try {
    const parsedJson = JSON.parse(rawText);
    return aiResponseSchema.parse(parsedJson);
  } catch (error: any) {
    throw new Error(`Falha de validação Zod/JSON: ${error.message}`);
  }
}