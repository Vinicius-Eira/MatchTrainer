import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export interface ExerciseDefinition {
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string[];
  tips: string[];
  thumbnailUrl: string;
  mediaUrl: string; 
}

export interface ExercisePrescription {
  targetSets: number;
  targetReps: string;
  targetRir: number;
  restSeconds: number;
}

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  prescription: ExercisePrescription;
  onSubstituteRequest?: () => void; 
}

export function ExerciseCard({ exercise, prescription, onSubstituteRequest }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);

  return (
    <View className="bg-base-surface border border-base-border rounded-3xl overflow-hidden mb-8">
      
      <View className="w-full h-56 bg-base-surfaceLight relative justify-center items-center">
        {isPlayingMedia ? (
          <View className="absolute inset-0 bg-base-borderLight items-center justify-center">
             <Text className="text-primary font-body font-bold">▶ Reproduzindo GIF: {exercise.mediaUrl}</Text>
          </View>
        ) : (
          <>
            <View className="absolute inset-0 bg-base-background/50 items-center justify-center">
               <Text className="text-textSecondary font-body text-sm">Miniatura: {exercise.thumbnailUrl}</Text>
            </View>
            
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsPlayingMedia(true)}
              className="w-16 h-16 bg-primary/90 rounded-full items-center justify-center shadow-lg z-10"
            >
              <Text className="text-base-pure text-2xl ml-1">▶</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View className="p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-4xl text-text font-title tracking-wide mb-1">
              {exercise.name}
            </Text>
            <Text className="text-textSecondary font-body text-sm tracking-wide">
              {exercise.muscleGroup} • {exercise.equipment}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={onSubstituteRequest}
            className="w-12 h-12 rounded-xl bg-base-surfaceLight border border-base-borderLight items-center justify-center"
          >
            <Text className="text-text text-xl">🔄</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Prescription */}
        <View className="flex-row justify-between bg-base-background rounded-xl p-4 mb-4 border border-base-borderLight">
          <View className="items-center">
            <Text className="text-text font-title text-2xl">{prescription.targetSets}</Text>
            <Text className="text-textSecondary font-body text-xs uppercase">Séries</Text>
          </View>
          <View className="items-center">
            <Text className="text-text font-title text-2xl">{prescription.targetReps}</Text>
            <Text className="text-textSecondary font-body text-xs uppercase">Reps</Text>
          </View>
          <View className="items-center">
            <Text className="text-text font-title text-2xl">{prescription.targetRir}</Text>
            <Text className="text-textSecondary font-body text-xs uppercase">RIR</Text>
          </View>
          <View className="items-center">
            <Text className="text-text font-title text-2xl">{prescription.restSeconds}s</Text>
            <Text className="text-textSecondary font-body text-xs uppercase">Pausa</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-center py-2"
        >
          <Text className="text-primary font-body font-bold text-sm uppercase tracking-widest mr-2">
            {isExpanded ? 'Ocultar Instruções' : 'Como Executar'}
          </Text>
          <Text className="text-primary text-xs">{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-base-borderLight">
            <Text className="text-text font-body font-bold mb-3">Passo a Passo</Text>
            {exercise.instructions.map((step, index) => (
              <View key={index} className="flex-row mb-3 pr-4">
                <Text className="text-primary font-body font-bold mr-3">{index + 1}.</Text>
                <Text className="text-textBody font-body leading-relaxed flex-1">{step}</Text>
              </View>
            ))}

            {exercise.tips.length > 0 && (
              <View className="mt-4 bg-semantic-warning/10 border border-semantic-warning/30 rounded-xl p-4">
                <Text className="text-semantic-warning font-body font-bold mb-2 flex-row items-center">
                  ⚠️ Cuidados
                </Text>
                {exercise.tips.map((tip, index) => (
                  <Text key={index} className="text-textBody font-body text-sm mb-1 leading-relaxed">
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

      </View>
    </View>
  );
}