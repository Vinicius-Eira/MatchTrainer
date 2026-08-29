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