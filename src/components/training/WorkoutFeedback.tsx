import React from 'react';
import { View, Text } from 'react-native';

export type FeedbackType = 'record' | 'better' | 'on-track' | 'completed' | 'warning';

interface WorkoutFeedbackProps {
  type: FeedbackType;
  message: string;
  isVisible: boolean;
}

export function WorkoutFeedback({ type, message, isVisible }: WorkoutFeedbackProps) {
  if (!isVisible) return null;

  const config = {
    'record': { icon: '🔥', style: 'bg-primary/20 border-primary', text: 'text-primary' },
    'better': { icon: '↑', style: 'bg-semantic-success/20 border-semantic-success', text: 'text-semantic-success' },
    'on-track': { icon: '✓', style: 'bg-base-surfaceLight border-semantic-success/50', text: 'text-text' },
    'completed': { icon: '💪', style: 'bg-base-surfaceLight border-base-borderLight', text: 'text-textSecondary' },
    'warning': { icon: '⚠️', style: 'bg-semantic-warning/20 border-semantic-warning', text: 'text-semantic-warning' },
  };

  const { icon, style, text } = config[type];

  return (
    <View className={`flex-row items-center px-4 py-3 mb-4 rounded-xl border ${style}`}>
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className={`font-body font-bold text-sm ${text}`}>{message}</Text>
    </View>
  );
}