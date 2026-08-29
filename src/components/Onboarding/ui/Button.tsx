import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  disabled, 
  className = '', 
  ...rest 
}: ButtonProps) {
  
  const baseClasses = "flex-row items-center justify-center py-4 px-6 rounded-xl active:opacity-80";
  
  const variantClasses = {
    primary: "bg-primary", 
    secondary: "bg-base-surfaceLight border border-base-borderLight", 
    danger: "bg-semantic-danger", 
  };

  const textClasses = {
    primary: "text-text font-title text-xl tracking-wide",
    secondary: "text-textBody font-body font-semibold text-base",
    danger: "text-text font-body font-semibold text-base",
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#E0E0E0' : '#FFFFFF'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}