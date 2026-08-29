export type CommandStatus = 
  | 'PENDENTE'         
  | 'SINCRONIZANDO'    
  | 'FALHOU'           
  | 'FALHOU_PERMANENTE'; 
  
export interface BaseCommandInfo {
  command_id: string;    
  status: CommandStatus;
  created_at: string;     
  retry_count: number;   
  last_error?: string;    
}

export interface RelatarDorPayload {
  session_id: string;
  session_exercise_id: string;
  local_dor: string;
  intensidade: number;
  observacao?: string;
}

export interface RelatarDorCommand extends BaseCommandInfo {
  type: 'CMD_ALUNO_RELATAR_DOR';
  payload: RelatarDorPayload;
}

export interface SubstituirExercicioPayload {
  session_id: string;
  session_exercise_id: string;
  original_exercise_id: string;
  replacement_exercise_id: string;
  substitution_reason: string;
}

export interface SubstituirExercicioCommand extends BaseCommandInfo {
  type: 'CMD_ALUNO_SUBSTITUIR_EXERCICIO';
  payload: SubstituirExercicioPayload;
}

export interface FinalizarTreinoPayload {
  session_id: string;
  rpe_session: number | null; 
  duration_seconds: number;
}

export interface FinalizarTreinoCommand extends BaseCommandInfo {
  type: 'CMD_ALUNO_FINALIZAR_TREINO';
  payload: FinalizarTreinoPayload;
}

export type AppCommand = 
  | RelatarDorCommand
  | SubstituirExercicioCommand
  | FinalizarTreinoCommand;

export interface CommandAck {
  success: boolean;
  command_id: string;
  event_id?: string;
  error_type?: 'TRANSIENT' | 'PERMANENT';
  error_message?: string;
}

export interface AprovarSugestaoCommand extends BaseCommandInfo {
  type: 'CMD_PERSONAL_APROVAR_SUGESTAO';
  payload: {
    insight_id: string;
    session_id: string;
    session_exercise_id: string;
    new_exercise_id: string;
  };
}