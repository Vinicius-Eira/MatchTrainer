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
  ScrollView,
  TouchableOpacity
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
  onSaveSuccess?: () => void; 
}

const LOCAIS_DOR = ['Ombro', 'Cotovelo', 'Joelho', 'Lombar', 'Quadril', 'Tornozelo', 'Outro'];
const INTENSIDADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getPainColor = (level: number) => {
  if (level <= 3) return '#FBBF24'; 
  if (level <= 6) return '#F97316'; 
  if (level <= 8) return '#EF4444'; 
  return '#991B1B'; 
};

export function PainModal({ isVisible, onClose, session_id, session_exercise_id, onSaveSuccess }: PainModalProps) {
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
    
    if (onSaveSuccess) onSaveSuccess(); 
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
        <View className="flex-1 bg-[#000000CC] justify-end">
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View className="bg-[#111111] rounded-t-3xl p-6 border-t border-[#333333]">
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-white tracking-wide">⚠️ Relatar Dor</Text>
                <TouchableWithoutFeedback onPress={onClose}>
                  <Text className="text-gray-400 font-medium p-2 uppercase text-xs">Cancelar</Text>
                </TouchableWithoutFeedback>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
                
                <Text className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                  Onde está doendo?
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {LOCAIS_DOR.map((local) => (
                    <TouchableOpacity
                      key={local}
                      onPress={() => setLocalDor(local)}
                      style={{
                        backgroundColor: localDor === local ? 'rgba(239, 68, 68, 0.2)' : '#222',
                        borderColor: localDor === local ? '#EF4444' : '#333',
                        borderWidth: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20
                      }}
                    >
                      <Text style={{ color: localDor === local ? '#EF4444' : '#AAA', fontWeight: 'bold' }}>
                        {local}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                  Intensidade (1 a 10)
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {INTENSIDADES.map((num) => {
                    const isSelected = intensidade === num;
                    const color = getPainColor(num);
                    return (
                      <TouchableOpacity
                        key={num}
                        onPress={() => setIntensidade(num)}
                        style={{
                          backgroundColor: isSelected ? color : '#222',
                          width: 45, height: 45,
                          justifyContent: 'center', alignItems: 'center',
                          borderRadius: 22.5,
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: '#333'
                        }}
                      >
                        <Text style={{ color: isSelected ? '#FFF' : '#AAA', fontWeight: 'bold', fontSize: 16 }}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                  Observação (Opcional)
                </Text>
                <TextInput
                  className="bg-[#222222] border border-[#333333] rounded-xl p-4 text-white text-base min-h-[100px]"
                  placeholder="Ex: Fisgada no fundo do ombro ao descer a barra..."
                  placeholderTextColor="#666666" 
                  multiline
                  textAlignVertical="top"
                  value={observacao}
                  onChangeText={setObservacao}
                  keyboardAppearance="dark"
                />

                <View className="mt-8 mb-6">
                  <Button 
                    title="REGISTRAR DOR NO EXERCÍCIO" 
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