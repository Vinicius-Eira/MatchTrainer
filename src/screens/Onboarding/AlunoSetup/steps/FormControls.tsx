import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { OpcaoMatch } from "../../../../shared/matchSchema";
import { theme } from "../../../../theme/theme";
import { moderateScale } from "../../../../utils/responsive";
import { styles } from "../styles";

interface ChipsSelectorProps {
  opcoes: string[];
  value: string | string[];
  onSelect: (opcao: string) => void;
  isSingle?: boolean;
}

export function ChipsSelector({ opcoes, value, onSelect, isSingle = false }: ChipsSelectorProps) {
  return (
    <View style={styles.chipsContainerCenter}>
      {opcoes.map((opcao) => {
        const ativo = isSingle ? value === opcao : Array.isArray(value) && value.includes(opcao);
        return (
          <TouchableOpacity
            key={opcao}
            style={[styles.chip, ativo && styles.chipAtivo]}
            onPress={() => onSelect(opcao)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{opcao}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface OptionGridProps {
  opcoes: OpcaoMatch[];
  value: string | string[];
  onSelect: (id: string) => void;
  isSingle?: boolean;
}

export function OptionGrid({ opcoes, value, onSelect, isSingle = false }: OptionGridProps) {
  return (
    <View style={styles.gridContainer}>
      {opcoes.map((opt, index) => {
        const ativo = isSingle ? value === opt.id : Array.isArray(value) && value.includes(opt.id);
        const isLastOdd = index === opcoes.length - 1 && opcoes.length % 2 !== 0;

        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.gridItemWithIcon, isLastOdd && { width: "100%" }, ativo && styles.gridItemAtivo]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.8}
          >
            {ativo && (
              <LinearGradient
                colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Ionicons
              name={opt.icon}
              size={moderateScale(24)}
              color={ativo ? theme.colors.primary : "#888"}
              style={{ marginBottom: moderateScale(7) }}
            />
            <Text style={[styles.gridItemText, ativo && styles.gridItemTextAtivo]}>{opt.titulo}</Text>
            {opt.desc ? (
              <Text style={[styles.gridItemDesc, ativo && { color: "#B4B4BC" }]}>{opt.desc}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}