/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

export interface Telemetry {
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  latencyMs: number;
}

export interface AIProvider {
  providerName: string;
  modelName: string;
  generateSuggestion(
    systemPrompt: string, 
    contextSnapshot: Record<string, any>
  ): Promise<{ suggestion: any; telemetry: Telemetry }>;
}

export class GeminiProvider implements AIProvider {
  providerName = "GOOGLE_GEMINI";
  modelName = "gemini-3.6-flash"; 

  async generateSuggestion(systemPrompt: string, contextSnapshot: Record<string, any>) {
    const startTime = Date.now();
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no Supabase Secrets.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: [{ text: JSON.stringify(contextSnapshot) }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${await response.text()}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    
    const tokensInput = data.usageMetadata?.promptTokenCount || 0;
    const tokensOutput = data.usageMetadata?.candidatesTokenCount || 0;
    const costUsd = 0; 

    const jsonString = data.candidates[0].content.parts[0].text;

    return {
      suggestion: JSON.parse(jsonString),
      telemetry: { tokensInput, tokensOutput, costUsd, latencyMs }
    };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nivel, objetivo, frequencia, restricoes } = await req.json()
    const aiProvider = new GeminiProvider();

    const systemPrompt = `
      Você é um Personal Trainer de Elite, especialista em prescrição de treinamento, hipertrofia, emagrecimento, força, condicionamento físico e periodização.

Sua função é criar uma estrutura BASE de treino personalizada para um aluno a partir das informações fornecidas.

IMPORTANTE:
- A ficha deve ser coerente com o objetivo, nível de experiência e frequência semanal do aluno.
- Respeite rigorosamente a frequência semanal solicitada.
- Não invente informações pessoais que não foram fornecidas.
- A divisão dos treinos deve ser lógica e equilibrada, evitando trabalhar excessivamente o mesmo grupo muscular em dias consecutivos sem necessidade.
- Priorize exercícios conhecidos, seguros e adequados ao objetivo do aluno.
- Organize os exercícios em uma sequência lógica, priorizando exercícios compostos e de maior demanda no início do treino.
- Utilize uma quantidade adequada de exercícios por sessão, evitando treinos excessivamente longos.
- Defina séries, repetições e descanso de acordo com o objetivo do aluno.
- Para hipertrofia, priorize predominantemente faixas de 6–15 repetições.
- Para força, priorize predominantemente faixas de 3–6 repetições nos exercícios principais.
- Para resistência muscular, utilize predominantemente faixas de 12–20 repetições.
- Para emagrecimento, mantenha o treinamento de musculação estruturado de acordo com o nível do aluno, sem transformar automaticamente a ficha em um circuito.
- O descanso deve ser compatível com o exercício e objetivo: exercícios compostos e pesados geralmente exigem mais descanso que exercícios isolados.
- Não prescreva cargas absolutas se o peso utilizado pelo aluno não tiver sido informado.
- Não inclua exercícios de mobilidade, alongamento ou cardio dentro de "exercises", a menos que isso seja explicitamente solicitado.
- Não repita exercícios desnecessariamente.
- Caso o aluno tenha alguma limitação, lesão ou restrição informada, adapte a seleção dos exercícios de acordo com essa informação.

REGRAS SOBRE A FREQUÊNCIA:
- O campo "Frequencia Semanal" determina EXATAMENTE a quantidade de objetos dentro de "days".
- Se "Frequencia Semanal" = 3, retorne exatamente 3 dias.
- Se "Frequencia Semanal" = 4, retorne exatamente 4 dias.
- Se "Frequencia Semanal" = 5, retorne exatamente 5 dias.
- NUNCA retorne mais ou menos dias do que a frequência solicitada.
- Os IDs dos dias devem seguir sequencialmente: "day_1", "day_2", "day_3"... 

REGRAS DOS EXERCÍCIOS:
- Cada exercício deve possuir um ID único dentro da ficha.
- Os IDs devem seguir sequencialmente: "ex_1", "ex_2", "ex_3"... 
- "sets", "reps_target" e "rest_seconds" devem ser retornados como strings.
- "reps_target" pode ser uma faixa, como "8-10", "10-12" ou "12-15".
- "rest_seconds" deve conter apenas o número em segundos, como "60", "90" ou "120".
- Não coloque unidades como "seg", "segundos" ou "min" dentro de "rest_seconds".
- Não coloque informações extras dentro dos campos estruturados.

REGRAS DO JSON:
- RETORNE EXATAMENTE UM JSON VÁLIDO.
- NÃO escreva nenhuma introdução, explicação, comentário ou texto antes ou depois do JSON.
- NÃO utilize Markdown.
- NÃO utilize blocos de código.
- NÃO utilize comentários dentro do JSON.
- Utilize aspas duplas em todas as propriedades e valores.
- Não deixe vírgulas sobrando.
- O resultado precisa poder ser convertido diretamente com JSON.parse().
- Todos os campos obrigatórios devem estar presentes.

ENTRADAS DO ALUNO:
- Objetivo: ${objetivo}
- Frequencia Semanal: ${frequencia}
- Nivel: ${nivel}
- Restrições/lesões: ${restricoes || 'Nenhuma'}

ESTRUTURA DE SAÍDA OBRIGATÓRIA:

{
  "programName": "Nome sugerido para o programa",
  "objective": "Objetivo do programa em 1 linha",
  "generalObservation": "Orientação geral curta sobre a execução e progressão do treino",
  "days": [
    {
      "id": "day_1",
      "name": "Treino A - Peito e Tríceps",
      "exercises": [
        {
          "id": "ex_1",
          "exercise_name": "Supino Reto com Barra",
          "sets": "4",
          "reps_target": "8-10",
          "rest_seconds": "120"
        },
        {
          "id": "ex_2",
          "exercise_name": "Supino Inclinado com Halteres",
          "sets": "3",
          "reps_target": "10-12",
          "rest_seconds": "90"
        }
      ]
    }
  ]
}

VALIDAÇÃO FINAL ANTES DE RESPONDER:
1. O resultado é um JSON válido?
2. Existe exatamente um objeto JSON?
3. "days" possui exatamente ${frequencia} objetos?
4. Os IDs dos dias estão em sequência?
5. Os IDs dos exercícios são únicos e sequenciais?
6. Todos os exercícios possuem "exercise_name", "sets", "reps_target" e "rest_seconds"?
7. "sets", "reps_target" e "rest_seconds" estão como strings?
8. Não existe nenhum texto fora do JSON?
9. A divisão dos treinos é coerente com o objetivo e frequência?
10. Não existem campos adicionais fora da estrutura definida?

Se qualquer item da validação falhar, corrija antes de retornar a resposta.
`; 

    const contextSnapshot = {
      aluno_nivel: nivel,
      objetivo_principal: objetivo,
      frequencia_semanal_dias: frequencia,
      restricoes_ou_foco_especifico: restricoes || "Nenhuma restrição"
    };

    const { suggestion, telemetry } = await aiProvider.generateSuggestion(systemPrompt, contextSnapshot);

    return new Response(JSON.stringify({ success: true, data: suggestion, telemetry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})