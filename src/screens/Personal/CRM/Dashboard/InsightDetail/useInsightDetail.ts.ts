import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../../../services/supabase';
import * as Crypto from 'expo-crypto';
import { useCommandQueue } from '../../../../../store/useCommandQueue'; 

type CopilotState = 'IDLE' | 'PROCESSING' | 'READY' | 'ERROR';

export function useInsightDetail(navigation: any, route: any) {
  const [copilotState, setCopilotState] = useState<CopilotState>('IDLE');
  const [suggestion, setSuggestion] = useState<any>(null);
  
  const { addCommand } = useCommandQueue();

  const insightId = route.params?.insightId || '00000000-0000-0000-0000-000000000000';
  const exerciseNameRelatado = route.params?.exerciseName || 'Agachamento Livre'; 

  useEffect(() => {
    if (insightId === '00000000-0000-0000-0000-000000000000') return;

    const channel = supabase.channel('realtime_suggestions')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_suggestions', 
          filter: `insight_id=eq.${insightId}` 
      }, 
      (payload: any) => { 
        setSuggestion(payload.new);
        setCopilotState('READY');
      }).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [insightId]);

  const handleGenerateSuggestion = async () => {
    setCopilotState('PROCESSING');
    
    try {
      const { data, error } = await supabase.rpc('request_ai_insight', {
        p_insight_id: insightId 
      });

      if (error || !data?.success) {
        throw new Error(data?.error_message || 'Falha de comunicação com o servidor.');
      }

      console.log("Sucesso! Job criado na fila:", data.job_id);

    } catch (err) {
      console.error(err);
      setCopilotState('ERROR');
      Alert.alert('Erro', 'Falha ao acionar o Copilot.');
    }
  };

  const handleAccept = () => {
    if (!suggestion) return;

    const comando = {
      command_id: Crypto.randomUUID(),
      type: 'CMD_PERSONAL_APROVAR_SUGESTAO',
      status: 'PENDENTE',
      created_at: new Date().toISOString(),
      retry_count: 0,
      payload: {
        suggestion_id: suggestion.id,
        new_exercise_name: suggestion.suggested_exercise_name,
        insight_id: insightId
      }
    };

    addCommand(comando as any);
    console.log("Comando enviado para a fila offline:", comando);
    navigation.goBack();
  };

  return {
    copilotState,
    suggestion,
    exerciseNameRelatado,
    handleGenerateSuggestion,
    handleAccept
  };
}