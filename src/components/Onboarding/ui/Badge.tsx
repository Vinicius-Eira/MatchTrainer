import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface BadgeProps extends TouchableOpacityProps {
  label: string | number;
  isSelected: boolean;
  onSelect: () => void;
}

export function Badge({ 
  label, 
  isSelected, 
  onSelect, 
  className = '', 
  ...rest 
}: BadgeProps) {
  
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className={`
        px-4 py-3 rounded-xl border flex-row justify-center items-center
        ${isSelected 
          ? 'bg-primary-light border-primary' 
          : 'bg-base-surface border-base-border'
        } 
        ${className}
      `}
      {...rest}
    >
      <Text 
        className={`
          font-body font-medium text-base
          ${isSelected ? 'text-primary' : 'text-textSecondary'}
        `}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}