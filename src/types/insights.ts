export type InsightPriority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type InsightType = 'DOR_RELATADA' | 'SUBSTITUICAO_SOLICITADA' | 'QUEDA_PERFORMANCE';

export interface Insight {
  id: string;
  aluno: {
    id: string;
    nome: string;
    avatarUrl?: string;
  };
  type: InsightType;
  priority: InsightPriority;
  exerciseName: string;
  painLocation?: string;
  painIntensity?: number;
  createdAt: string;
  isResolved: boolean;
}