import React from "react";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { theme } from "../theme/theme";
import { moderateScale, scale, verticalScale } from "../utils/responsive";

interface BotaoPrincipalProps extends TouchableOpacityProps {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
  disabled?: boolean;
}

export default function BotaoPrincipal({
  titulo,
  onPress,
  secundario = false,
  disabled = false,
  ...rest 
}: BotaoPrincipalProps) {
  return (
    <TouchableOpacity
      style={[
        styles.botao,
        secundario ? styles.botaoSecundario : styles.botaoPrimario,
        disabled && styles.botaoDesabilitado,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      {...rest}
    >
      <Text
        style={[
          styles.texto,
          secundario ? styles.textoSecundario : styles.textoPrimario,
          disabled && styles.textoDesabilitado,
        ]}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: verticalScale(15),
  },
  botaoPrimario: {
    backgroundColor: theme.colors.primary,
  },
  botaoSecundario: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  botaoDesabilitado: {
    opacity: 0.6, 
  },
  texto: {
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(22),
    letterSpacing: 1,
  },
  textoPrimario: {
    color: theme.colors.background,
  },
  textoSecundario: {
    color: theme.colors.primary,
  },
  textoDesabilitado: {
  },
});