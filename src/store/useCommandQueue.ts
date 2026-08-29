import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppCommand, CommandStatus, CommandAck } from '../types/commands';

interface CommandQueueState {
  queue: AppCommand[];
  lastAck: CommandAck | null;
  
  addCommand: (command: AppCommand) => void;
  removeCommand: (commandId: string) => void;
  
  updateStatus: (commandId: string, status: CommandStatus, errorMsg?: string) => void;
  incrementRetry: (commandId: string) => void;
  clearLastAck: () => void;
  
  discardFailedCommands: () => void;
}

export const useCommandQueue = create<CommandQueueState>()(
  persist(
    (set) => ({
      queue: [],
      lastAck: null,

      addCommand: (command) => set((state) => {
        // Prevenção de duplicidade: se já existe um comando com esse ID, ignora
        if (state.queue.some(c => c.command_id === command.command_id)) {
          return state;
        }
        return { queue: [...state.queue, command] };
      }),

      removeCommand: (commandId) => set((state) => ({
        queue: state.queue.filter((c) => c.command_id !== commandId)
      })),

      updateStatus: (commandId, status, errorMsg) => set((state) => ({
        queue: state.queue.map((c) => 
          c.command_id === commandId 
            ? { ...c, status, last_error: errorMsg || c.last_error } 
            : c
        )
      })),

      incrementRetry: (commandId) => set((state) => ({
        queue: state.queue.map((c) => 
          c.command_id === commandId 
            ? { ...c, retry_count: c.retry_count + 1, status: 'FALHOU' } 
            : c
        )
      })),

      clearLastAck: () => set({ lastAck: null }),

      discardFailedCommands: () => set((state) => ({
        queue: state.queue.filter(c => c.status !== 'FALHOU_PERMANENTE')
      })),
    }),
    {
      name: 'matchtrainer-command-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);