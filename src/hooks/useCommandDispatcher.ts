// src/services/CommandDispatcher.ts

import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../services/supabase'; 
import { useCommandQueue } from '../store/useCommandQueue';
import { CommandAck } from '../types/commands';

const MAX_RETRIES = 5;
let isDispatching = false; 

export const CommandDispatcher = {
  
  async processQueue() {
    if (isDispatching) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;

    const { queue, updateStatus, removeCommand, incrementRetry } = useCommandQueue.getState();

    const processableCommands = queue.filter(
      (c) => (c.status === 'PENDENTE' || c.status === 'FALHOU') && c.retry_count < MAX_RETRIES
    );

    if (processableCommands.length === 0) return;

    isDispatching = true;

    try {
      for (const command of processableCommands) {
        
        const currentNetState = await NetInfo.fetch();
        if (!currentNetState.isConnected) {
          console.log('[Dispatcher] Conexão perdida. Pausando fila.');
          break; 
        }

        updateStatus(command.command_id, 'SINCRONIZANDO');

        try {
          const { data, error } = await supabase.rpc('sync_app_command', {
            p_command: command 
          });

          if (error) throw new Error('NETWORK_ERROR');

          const ack = data as CommandAck;

          if (ack.success) {
            removeCommand(command.command_id);
            useCommandQueue.setState({ lastAck: ack });
            console.log(`[Dispatcher] Comando ${ack.command_id} Sincronizado com Sucesso.`);
          } else {
            if (ack.error_type === 'PERMANENT') {
              console.error(`[Dispatcher] Erro PERMANENTE no comando ${command.command_id}:`, ack.error_message);
              updateStatus(command.command_id, 'FALHOU_PERMANENTE', ack.error_message);
            } else {
              console.warn(`[Dispatcher] Erro Transitório no servidor. Retentando depois.`);
              incrementRetry(command.command_id);
            }
          }

        } catch (err: any) {
          console.log(`[Dispatcher] Erro de Rede no comando ${command.command_id}. Ficará para a próxima.`);
          incrementRetry(command.command_id);
        }
      }
    } finally {
      isDispatching = false;
    }
  },

  init() {
    console.log('[Dispatcher] Serviço Inicializado.');

    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('[Dispatcher] Conexão restabelecida. Rodando fila...');
        this.processQueue();
      }
    });

    useCommandQueue.subscribe((state, prevState) => {
      const hasNewPending = state.queue.some(c => c.status === 'PENDENTE');
      const hadPending = prevState.queue.some(c => c.status === 'PENDENTE');
      
      if (hasNewPending && !hadPending) {
        this.processQueue();
      }
    });
  }
};