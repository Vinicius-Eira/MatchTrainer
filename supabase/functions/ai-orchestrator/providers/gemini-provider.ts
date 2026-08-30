import { AIProvider, Telemetry } from "./ai-provider.ts";

export class GeminiProvider implements AIProvider {
  providerName = "GOOGLE_GEMINI";
  modelName = "gemini-1.5-flash"; 

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