export type EventIngestionStatus = 'RECEBIDO' | 'PROCESSADO';
export type InsightPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type InsightType = 'DOR_RELATADA' | 'ESTAGNACAO_CARGA' | 'QUEDA_FREQUENCIA' | 'MARCO_CELEBRACAO' | 'AUTONOMIA_EXCESSIVA';
export type ContextPurpose = 'DOR_EXERCICIO' | 'ADAPTACAO_TREINO' | 'ANALISE_EVOLUCAO' | 'FEEDBACK_VIDEO' | 'SUGESTAO_MENSAGEM';

export interface DomainEvent {
  id: string;
  event_type: string;
  schema_version: number;
  aggregate_type: string;
  aggregate_id: string;
  sequence_number: number;
  actor_id: string;
  target_aluno_id: string;
  session_id: string | null;
  payload: Record<string, any>;
  occurred_at: string;
  processed_at: string | null;
  ingestion_status: EventIngestionStatus;
  created_at: string;
}