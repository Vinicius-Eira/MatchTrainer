const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

export class GeminiProvider {
  async generateSuggestion(contextData: any) {
    const promptText = `
      Atue como um Especialista em Biomecânica.
      Analise o seguinte contexto de treino e forneça uma adaptação segura.
      
      Contexto da Dor: ${JSON.stringify(contextData.current_event)}
      Diretriz: ${contextData.system_directive}
      
      Retorne EXATAMENTE UM JSON válido com as seguintes chaves (sem formatação markdown extra):
      "suggested_exercise_name", "reasoning", "confidence" (deve ser ALTA, MEDIA ou BAIXA), "recommended_action".
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const usage = data.usageMetadata || {};

    if (!rawText) throw new Error("O Gemini retornou uma resposta vazia.");

    return {
      rawText,
      tokensInput: usage.promptTokenCount || 0,
      tokensOutput: usage.candidatesTokenCount || 0,
    };
  }
}