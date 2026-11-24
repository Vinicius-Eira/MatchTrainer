import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/src/theme/theme"; 
import { styles } from "../../screens/User/Feed/styles";

interface MatchEmptyStateProps {
  isAlunoConsultoria: boolean;
  distanciaMaxima: number;
  onExpandirRadar: () => void;
  onAjustarPreferencias: () => void;
}

export function MatchEmptyState({
  isAlunoConsultoria,
  distanciaMaxima,
  onExpandirRadar,
  onAjustarPreferencias,
}: MatchEmptyStateProps) {
  const podeExpandirRadar = !isAlunoConsultoria && distanciaMaxima < 100;

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconGlow}>
        <MaterialCommunityIcons name="radar" size={40} color={theme.colors.primary} />
      </View>

      <Text style={styles.emptyTitle}>Nenhum Match de Elite encontrado</Text>
      <Text style={styles.emptyText}>
        Não exibimos profissionais incompatíveis apenas para preencher a tela. No momento, nenhum treinador ativo
        atingiu todos os seus requisitos obrigatórios com pelo menos 80% de compatibilidade real.
      </Text>

      <View style={styles.emptyActions}>
        {podeExpandirRadar ? (
          <TouchableOpacity style={styles.btnEmptyPrimary} onPress={onExpandirRadar} activeOpacity={0.85}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color={theme.colors.primary} />
            <Text style={styles.btnActionTextNeon}>Expandir Radar para 50 km</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.btnEmptySecondary} onPress={onAjustarPreferencias} activeOpacity={0.85}>
          <Ionicons name="options-outline" size={17} color="#E4E4E7" />
          <Text style={styles.btnEmptySecondaryText}>Ajustar Meu Raio-X de Treino</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}