import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Button } from '../Onboarding/ui/Button';
import { Badge } from '../Onboarding/ui/Badge';
import { useCommandQueue } from '../../store/useCommandQueue';
import * as Crypto from 'expo-crypto';

export interface SubstituteOption {
  id: string;
  name: string;
  equipment: string;
  thumbnailUrl: string;
  confidenceIndicator?: string; 
}

interface ExerciseSubstitutionModalProps {
  isVisible: boolean;
  onClose: () => void;
  session_id: string;
  session_exercise_id: string;
  current_exercise_id: string;
  current_exercise_name: string;
  approvedSubstitutes: SubstituteOption[]; 
}

const MOTIVOS_SUBSTITUICAO = [
  'Equipamento ocupado', 
  'Dor/desconforto', 
  'Sem equipamento', 
  'Outro'
];

export function ExerciseSubstitutionModal({ 
  isVisible, 
  onClose, 
  session_id, 
  session_exercise_id,
  current_exercise_id,
  current_exercise_name,
  approvedSubstitutes
}: ExerciseSubstitutionModalProps) {
  
  const { addCommand } = useCommandQueue();

  const [motivo, setMotivo] = useState<string | null>(null);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!motivo || !selectedSubstituteId) return;

    const comando = {
      command_id: Crypto.randomUUID(),
      type: 'CMD_ALUNO_SUBSTITUIR_EXERCICIO',
      status: 'PENDENTE' as const,
      created_at: new Date().toISOString(),
      retry_count: 0,
      payload: {
        session_id,
        session_exercise_id,
        original_exercise_id: current_exercise_id,
        replacement_exercise_id: selectedSubstituteId,
        substitution_reason: motivo
      }
    };

    addCommand(comando as any);

    setMotivo(null);
    setSelectedSubstituteId(null);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-base-pure/80 justify-end">
          
          <View className="bg-base-surface rounded-t-3xl p-6 border-t border-base-borderLight max-h-[90%]">
            
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-3xl text-text font-title tracking-wide mb-1">
                  Substituir Exercício
                </Text>
                <Text className="text-textSecondary font-body font-medium">
                  Trocando: {current_exercise_name}
                </Text>
              </View>
              <TouchableWithoutFeedback onPress={onClose}>
                <Text className="text-textSecondary font-body font-medium p-2">Voltar</Text>
              </TouchableWithoutFeedback>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              
              {approvedSubstitutes.length === 0 ? (
                <View className="items-center justify-center py-10">
                  <Text className="text-6xl mb-4">🔒</Text>
                  <Text className="text-text font-body font-bold text-lg mb-2 text-center">
                    Nenhuma substituição disponível
                  </Text>
                  <Text className="text-textSecondary font-body text-center mb-8 px-4">
                    Seu treinador não definiu alternativas automáticas para este exercício.
                  </Text>
                  <Button 
                    title="Falar com o Personal" 
                    variant="primary" 
                    onPress={() => {
                      onClose();
                    }}
                    className="w-full"
                  />
                </View>
              ) : (
                
                <>
                  <Text className="text-base font-body font-bold text-textBody mb-3">
                    Qual o motivo da troca?
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-8">
                    {MOTIVOS_SUBSTITUICAO.map((m) => (
                      <Badge
                        key={m}
                        label={m}
                        isSelected={motivo === m}
                        onSelect={() => setMotivo(m)}
                      />
                    ))}
                  </View>

                  <Text className="text-base font-body font-bold text-textBody mb-3">
                    Alternativas Aprovadas
                  </Text>
                  <View className="gap-3 mb-8">
                    {approvedSubstitutes.map((sub) => {
                      const isSelected = selectedSubstituteId === sub.id;
                      return (
                        <TouchableOpacity
                          key={sub.id}
                          activeOpacity={0.7}
                          onPress={() => setSelectedSubstituteId(sub.id)}
                          className={`
                            flex-row items-center p-3 rounded-2xl border
                            ${isSelected 
                              ? 'bg-primary-light border-primary' 
                              : 'bg-base-surfaceLight border-base-borderLight'
                            }
                          `}
                        >
                          <View className="w-16 h-16 bg-base-background rounded-xl items-center justify-center mr-4">
                            <Text className="text-textSecondary text-xs">IMG</Text>
                          </View>
                          
                          <View className="flex-1">
                            <Text className={`font-body font-bold text-lg mb-1 ${isSelected ? 'text-primary' : 'text-text'}`}>
                              {sub.name}
                            </Text>
                            <Text className="text-textSecondary font-body text-xs">
                              {sub.equipment}
                            </Text>
                            {sub.confidenceIndicator && (
                              <Text className="text-semantic-success font-body text-xs mt-1 font-bold">
                                ✓ {sub.confidenceIndicator}
                              </Text>
                            )}
                          </View>

                          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-primary' : 'border-base-borderLight'}`}>
                            {isSelected && <View className="w-3 h-3 rounded-full bg-primary" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="mb-8">
                    <Button 
                      title="Confirmar Substituição" 
                      variant="primary" 
                      onPress={handleConfirm}
                      disabled={!motivo || !selectedSubstituteId} 
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}