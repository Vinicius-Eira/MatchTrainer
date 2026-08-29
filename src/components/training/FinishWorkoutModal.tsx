import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '../Onboarding/ui/Button';
import { useCommandQueue } from '../../store/useCommandQueue';
import * as Crypto from 'expo-crypto';

interface FinishWorkoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  session_id: string;
  stats: {
    durationSeconds: number;
    exercisesCompleted: number;
    totalExercises: number;
    setsCompleted: number;
    totalSets: number;
  };
}

const RPE_SCALE = [
  { value: 2, emoji: '🙂', label: 'Leve' },
  { value: 4, emoji: '😐', label: 'Moderado' },
  { value: 6, emoji: '😕', label: 'Difícil' },
  { value: 8, emoji: '😫', label: 'Muito Difícil' },
  { value: 10, emoji: '🔥', label: 'Máximo' },
];

export function FinishWorkoutModal({ isVisible, onClose, session_id, stats }: FinishWorkoutModalProps) {
  const { addCommand } = useCommandQueue();
  const [selectedRpe, setSelectedRpe] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleFinish = () => {
    const comando = {
      command_id: Crypto.randomUUID(),
      type: 'CMD_ALUNO_FINALIZAR_TREINO',
      status: 'PENDENTE' as const,
      created_at: new Date().toISOString(),
      retry_count: 0,
      payload: {
        session_id,
        rpe_session: selectedRpe,
        duration_seconds: stats.durationSeconds,
      }
    };
    addCommand(comando as any);

    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-base-pure/90 justify-center items-center px-4">
        
        <View className="w-full bg-base-surface rounded-3xl p-6 border border-base-borderLight shadow-2xl">
          
          <View className="items-center mb-8">
            <Text className="text-6xl mb-2">🎉</Text>
            <Text className="text-3xl text-text font-title tracking-wide text-center">
              Treino Concluído!
            </Text>
          </View>

          <Text className="text-textSecondary font-body font-bold text-center mb-4 uppercase tracking-widest text-sm">
            Como foi seu treino?
          </Text>
          
          <View className="flex-row justify-between items-center mb-2 px-2">
            {RPE_SCALE.map((item) => {
              const isSelected = selectedRpe === item.value;
              return (
                <TouchableOpacity 
                  key={item.value}
                  activeOpacity={0.7}
                  onPress={() => setSelectedRpe(item.value)}
                  className={`items-center justify-center p-2 rounded-xl transition-all ${
                    isSelected ? 'bg-primary/20 border border-primary' : 'border border-transparent'
                  }`}
                >
                  <Text className={`text-3xl mb-1 ${!isSelected && selectedRpe !== null ? 'opacity-40' : 'opacity-100'}`}>
                    {item.emoji}
                  </Text>
                  <Text className={`font-title text-lg ${isSelected ? 'text-primary' : 'text-textSecondary'}`}>
                    {item.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedRpe && (
            <Text className="text-primary font-body font-bold text-center mb-8">
              RPE Selecionado: {selectedRpe}/10
            </Text>
          )}
          {!selectedRpe && <View className="h-4 mb-8" />} 

          <View className="h-px bg-base-borderLight w-full mb-6" />

          <View className="flex-row justify-between bg-base-surfaceLight rounded-2xl p-4 mb-8">
            <View className="items-center">
              <Text className="text-text font-title text-2xl">{formatDuration(stats.durationSeconds)}</Text>
              <Text className="text-textSecondary font-body text-xs">Duração</Text>
            </View>
            <View className="items-center">
              <Text className="text-text font-title text-2xl">{stats.exercisesCompleted}/{stats.totalExercises}</Text>
              <Text className="text-textSecondary font-body text-xs">Exercícios</Text>
            </View>
            <View className="items-center">
              <Text className="text-text font-title text-2xl">{stats.setsCompleted}/{stats.totalSets}</Text>
              <Text className="text-textSecondary font-body text-xs">Séries</Text>
            </View>
          </View>

          <Button 
            title="Finalizar Treino" 
            variant="primary" 
            onPress={handleFinish} 
            className="w-full shadow-lg shadow-primary/30"
          />
          
        </View>
      </View>
    </Modal>
  );
}