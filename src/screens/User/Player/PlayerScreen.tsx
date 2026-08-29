import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/src/components/Onboarding/ui/Button';
import { SyncIndicator } from '../../../components/feedback/SyncIndicator';
import { PainModal } from '../../../components/training/PainModal';

export default function PlayerScreen({ route, navigation }: any) {
  const [isPainModalVisible, setPainModalVisible] = useState(false);

  const { 
    sessionId, 
    sessionExerciseId,
    exerciseName = "Máquina", 
    exerciseGroup = "Peito • Máquina"
  } = route?.params || {};

  return (
    <SafeAreaView className="flex-1 bg-base-background">
      
      <View className="z-50 items-center w-full">
        <SyncIndicator />
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between items-center mb-8">
          {/* 4. Adicionei a função de voltar na seta */}
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text className="text-primary font-body font-bold text-lg">← Treino A</Text>
          </TouchableOpacity>
          <Text className="text-textSecondary font-body font-medium">02/08</Text>
        </View>

        <View className="mb-8">
          <Text className="text-5xl text-text font-title tracking-wide mb-1">
             {exerciseName}
          </Text>
          <Text className="text-base text-textSecondary font-body font-medium">
            {exerciseGroup}
          </Text>
        </View>

        <View className="bg-base-surface rounded-3xl p-6 border border-base-border mb-8">
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-textSecondary font-body text-xs uppercase tracking-widest mb-1">Séries</Text>
              <Text className="text-3xl font-title text-text">3</Text>
            </View>
            <View>
              <Text className="text-textSecondary font-body text-xs uppercase tracking-widest mb-1">Reps</Text>
              <Text className="text-3xl font-title text-text">8–12</Text>
            </View>
            <View>
              <Text className="text-textSecondary font-body text-xs uppercase tracking-widest mb-1">RIR Alvo</Text>
              <Text className="text-3xl font-title text-text">2</Text>
            </View>
          </View>
          
          <View className="bg-primary-light border border-primary/20 rounded-xl p-3 items-center">
            <Text className="text-primary font-body font-bold tracking-wide">Carga sugerida: 60 kg</Text>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row justify-between items-center py-5 border-b border-base-border">
            <Text className="text-xl font-body font-bold text-text">Série 1</Text>
            <Text className="text-xl text-textBody font-body">60 kg × 10</Text>
          </View>
          <View className="flex-row justify-between items-center py-5 border-b border-base-border">
            <Text className="text-xl font-body font-bold text-text">Série 2</Text>
            <Text className="text-xl text-textBody font-body">60 kg × 9</Text>
          </View>
          <View className="flex-row justify-between items-center py-5 border-b border-base-border opacity-40">
            <Text className="text-xl font-body font-bold text-text">Série 3</Text>
            <Text className="text-xl text-textBody font-body">—</Text>
          </View>
        </View>

        <View className="gap-5 pb-12 mt-4">
          <Button 
            title="⚠️ Senti Dor" 
            variant="danger" 
            onPress={() => setPainModalVisible(true)} 
          />
          
          <TouchableOpacity className="py-4 items-center">
            <Text className="text-textSecondary font-body font-bold text-base tracking-wide uppercase">
              Finalizar treino
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

/      <PainModal 
        isVisible={isPainModalVisible} 
        onClose={() => setPainModalVisible(false)}
        session_id={sessionId}
        session_exercise_id={sessionExerciseId}
      />

    </SafeAreaView>
  );
}