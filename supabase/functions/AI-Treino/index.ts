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
    userText: string,
    base64Image?: string
  ): Promise<{ suggestion: any; telemetry: Telemetry }>;
}

export class GeminiProvider implements AIProvider {
  providerName = "GOOGLE_GEMINI";
  modelName = "gemini-1.5-flash"; 

  async generateSuggestion(systemPrompt: string, userText: string, base64Image?: string) {
    const startTime = Date.now();
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no Supabase Secrets.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: userText }];
    
    if (base64Image) {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg", 
          data: base64Image
        }
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: "user",
          parts: parts
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
    const body = await req.json();
    const { isImport, base64Image, rawText, nivel, objetivo, frequencia, restricoes } = body;
    
    const aiProvider = new GeminiProvider();
    
    let systemPrompt = "";
    let userText = "";

    if (isImport) {
      systemPrompt = `
      Você é um Personal Trainer de Elite e um Extrator Avançado de Dados.
      Sua missão é olhar para a ficha de treino fornecida (seja uma imagem, uma planilha ou um texto bagunçado) e estruturá-la EXATAMENTE no formato JSON exigido pelo nosso aplicativo.

      REGRAS DE EXTRAÇÃO:
      - Identifique os dias de treino (Ex: "Treino A", "Costas", "Dia 1") e agrupe os exercícios dentro dos seus respectivos dias.
      - Para cada exercício, extraia: Nome, Séries (sets), Repetições (reps_target) e Descanso (rest_seconds).
      - Se a ficha listar repetições como "10-12", mantenha "10-12". Se for "Fadiga" ou "Falha", escreva "Falha".
      - Se o tempo de descanso não estiver visível, presuma "60".
      - Agrupe quaisquer anotações extras do treino no campo "generalObservation".
      - O campo "programName" deve ser o título encontrado na ficha (ou um título coerente com o que foi lido).
      - Os IDs dos dias devem ser "day_1", "day_2", etc.
      - Os IDs dos exercícios devem ser "ex_1", "ex_2", etc.

      ESTRUTURA JSON OBRIGATÓRIA:
      {
        "programName": "Nome da Ficha",
        "objective": "Objetivo (Força, Hipertrofia, etc)",
        "generalObservation": "Observações do treinador (se houver)",
        "days": [
          {
            "id": "day_1",
            "name": "Treino A - Peito",
            "exercises": [
              {
                "id": "ex_1",
                "exercise_name": "Supino Reto",
                "sets": "4",
                "reps_target": "10-12",
                "rest_seconds": "90"
              }
            ]
          }
        ]
      }

      RETORNE EXATAMENTE UM JSON VÁLIDO. NADA ALÉM DISSO. SEM MARKDOWN.
      `;

      if (base64Image) {
        userText = "Analise a imagem da ficha de treinamento em anexo e extraia a estrutura de treino para o JSON.";
      } else {
        userText = `Aqui está o texto bruto da ficha que o personal colou:\n\n${rawText}\n\nAnalise e converta para o JSON.`;
      }

    } 

    else {
      systemPrompt = `
      Você é um Personal Trainer de Elite, especialista em prescrição de treinamento.
      Sua função é criar uma estrutura BASE de treino personalizada para um aluno a partir das informações fornecidas.

      IMPORTANTE:
      - A ficha deve ser coerente com o objetivo, nível de experiência e frequência.
      - Respeite rigorosamente a frequência semanal solicitada (Ex: 3 dias = 3 objetos na lista).
      - Os IDs dos dias devem seguir sequencialmente: "day_1", "day_2"...
      - Cada exercício deve possuir um ID sequencial: "ex_1", "ex_2"...
      - "sets", "reps_target" e "rest_seconds" devem ser strings contendo apenas números ou intervalos (ex: "8-10", "60").
      - Retorne APENAS um JSON estrito, pronto para JSON.parse(). Sem formatação markdown, sem comentários extras.

      ESTRUTURA DE SAÍDA OBRIGATÓRIA:
      {
        "programName": "Nome sugerido para o programa",
        "objective": "Objetivo do programa em 1 linha",
        "generalObservation": "Orientação geral curta",
        "days": [
          {
            "id": "day_1",
            "name": "Treino A - Exemplo",
            "exercises": [
              {
                "id": "ex_1",
                "exercise_name": "Nome do Exercício",
                "sets": "4",
                "reps_target": "8-10",
                "rest_seconds": "120"
              }
            ]
          }
        ]
      }
      `; 

      userText = JSON.stringify({
        aluno_nivel: nivel,
        objetivo_principal: objetivo,
        frequencia_semanal_dias: frequencia,
        restricoes_ou_foco_especifico: restricoes || "Nenhuma restrição"
      });
    }

    const { suggestion, telemetry } = await aiProvider.generateSuggestion(systemPrompt, userText, base64Image);

    return new Response(JSON.stringify({ success: true, data: suggestion, telemetry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})