// src/components/BotaoPrincipal.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme'; 

export default function BotaoPrincipal({ titulo, onPress, secundario = false }) {
  return (
    <TouchableOpacity 
      style={[
        styles.botao, 
        secundario ? styles.botaoSecundario : styles.botaoPrimario
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.texto,
        secundario ? styles.textoSecundario : styles.textoPrimario
      ]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  botaoPrimario: {
    backgroundColor: theme.colors.primary,
  },
  botaoSecundario: {
    backgroundColor: theme.colors.surface, 
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  texto: {
    fontFamily: theme.fonts.title,
    fontSize: 22,
    letterSpacing: 1,
  },
  textoPrimario: {
    color: theme.colors.background, 
  },
  textoSecundario: {
    color: theme.colors.primary, 
  }
});