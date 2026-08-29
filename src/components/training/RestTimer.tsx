import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface RestTimerProps {
  seconds: number;
  onSkip: () => void;
}

export function RestTimer({ seconds, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSkip();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onSkip]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View className="bg-base-surface border border-primary/30 rounded-2xl p-6 items-center my-6">
      <Text className="text-primary font-body font-bold tracking-widest uppercase mb-2">
        Descanso
      </Text>
      
      <Text className="text-6xl text-text font-title mb-6">
        {formatTime(timeLeft)}
      </Text>

      <Text className="text-textSecondary font-body text-sm mb-6 text-center">
        Respire fundo. Prepare-se para a próxima série.
      </Text>

      <TouchableOpacity 
        onPress={onSkip}
        className="py-3 px-8 rounded-xl border border-base-borderLight active:bg-base-surfaceLight"
      >
        <Text className="text-textBody font-body font-medium uppercase tracking-wide">
          Pular Descanso
        </Text>
      </TouchableOpacity>
    </View>
  );
}