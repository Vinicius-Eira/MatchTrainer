import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView
} from 'react-native';
import { Button } from '../Onboarding/ui/Button';
import { Badge } from '../Onboarding/ui/Badge';
import { useCommandQueue } from '../../store/useCommandQueue';
import { RelatarDorCommand } from '../../types/commands';
import * as Crypto from 'expo-crypto'; 

interface PainModalProps {
  isVisible: boolean;
  onClose: () => void;
  session_id: string;
  session_exercise_id: string;
}

const LOCAIS_DOR = ['Ombro', 'Cotovelo', 'Joelho', 'Lombar', 'Outro'];
const INTENSIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function PainModal({ isVisible, onClose, session_id, session_exercise_id }: PainModalProps) {
  const { addCommand } = useCommandQueue();

  const [localDor, setLocalDor] = useState<string | null>(null);
  const [intensidade, setIntensidade] = useState<number | null>(null);
  const [observacao, setObservacao] = useState<string>('');

  const handleSave = () => {
    if (!localDor || !intensidade) return;

    const novoComando: RelatarDorCommand = {
      command_id: Crypto.randomUUID(), 
      type: 'CMD_ALUNO_RELATAR_DOR',
      status: 'PENDENTE',
      created_at: new Date().toISOString(),
      retry_count: 0,
      payload: {
        session_id,
        session_exercise_id,
        local_dor: localDor,
        intensidade,
        observacao: observacao.trim() !== '' ? observacao : undefined,
      }
    };

    addCommand(novoComando);

    setLocalDor(null);
    setIntensidade(null);
    setObservacao('');
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
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="bg-base-surface rounded-t-3xl p-6 border-t border-base-borderLight">
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-3xl text-text font-title tracking-wide">Senti Dor</Text>
                <TouchableWithoutFeedback onPress={onClose}>
                  <Text className="text-textSecondary font-body font-medium p-2">Cancelar</Text>
                </TouchableWithoutFeedback>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
                
                <Text className="text-base font-body font-bold text-textBody mb-3">
                  Onde está doendo?
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {LOCAIS_DOR.map((local) => (
                    <Badge
                      key={local}
                      label={local}
                      isSelected={localDor === local}
                      onSelect={() => setLocalDor(local)}
                    />
                  ))}
                </View>

                <Text className="text-base font-body font-bold text-textBody mb-3">
                  Intensidade
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {INTENSIDADES.map((num) => (
                    <Badge
                      key={num}
                      label={num}
                      isSelected={intensidade === num}
                      onSelect={() => setIntensidade(num)}
                      className="w-12 h-12" 
                    />
                  ))}
                </View>

                <Text className="text-base font-body font-bold text-textBody mb-3">
                  Observação (opcional)
                </Text>
                <TextInput
                  className="bg-base-background border border-base-border rounded-xl p-4 text-text font-body text-base min-h-[100px]"
                  placeholder="Ex: Fisgada no fundo do ombro ao descer a barra..."
                  placeholderTextColor="#555555" 
                  multiline
                  textAlignVertical="top"
                  value={observacao}
                  onChangeText={setObservacao}
                />

                <View className="mt-8 mb-4">
                  <Button 
                    title="Registrar dor" 
                    variant="danger" 
                    onPress={handleSave}
                    disabled={!localDor || !intensidade} 
                  />
                </View>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}