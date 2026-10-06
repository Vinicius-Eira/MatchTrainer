import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../../theme/theme'; 
import { styles } from './styles';
import { useInsightDetail } from './useInsightDetail.ts';

export function InsightDetailScreen({ navigation, route }: any) {
  const {
    copilotState,
    suggestion,
    exerciseNameRelatado,
    handleGenerateSuggestion,
    handleAccept
  } = useInsightDetail(navigation, route);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análise de Insight</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.contextCard}>
          <View style={styles.contextHeader}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>J</Text>
            </View>
            <View>
              <Text style={styles.studentName}>João Silva</Text>
              <Text style={styles.studentGoal}>Foco: Hipertrofia</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.eventTitle}>⚠️ Dor Relatada no Treino</Text>
          <View style={styles.eventRow}>
            <Text style={styles.eventLabel}>Exercício:</Text>
            <Text style={styles.eventValue}>{exerciseNameRelatado}</Text>
          </View>
          <View style={styles.eventRow}>
            <Text style={styles.eventLabel}>Local da Dor:</Text>
            <View style={styles.tagNeutral}>
              <Text style={styles.tagNeutralText}>Articulação</Text>
            </View>
          </View>
          <View style={styles.eventRow}>
            <Text style={styles.eventLabel}>Intensidade:</Text>
            <View style={styles.tagDanger}>
              <Text style={styles.tagDangerText}>Crítica</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Copilot IA</Text>
        
        {(copilotState === 'IDLE' || copilotState === 'ERROR') && (
          <View style={styles.copilotIdle}>
            <Text style={styles.copilotIdleText}>
              Cruze os dados deste relato com o histórico de lesões e a biomecânica do aluno para encontrar a melhor adaptação.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleGenerateSuggestion} activeOpacity={0.8}>
              <Text style={styles.btnPrimaryText}>✨ Gerar Sugestão de Adaptação</Text>
            </TouchableOpacity>
          </View>
        )}

        {copilotState === 'PROCESSING' && (
          <View style={styles.copilotLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.copilotLoadingText}>Analisando biomecânica e histórico de treinos...</Text>
          </View>
        )}

        {copilotState === 'READY' && suggestion && (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTitle}>✨ Adaptação Sugerida</Text>
              <View style={styles.confidenceTag}>
                <Text style={styles.confidenceText}>{suggestion.confidence || 'ALTA'}</Text>
              </View>
            </View>
            
            <View style={styles.changeVisualizer}>
              <Text style={styles.changeTextStrike} numberOfLines={1}>{exerciseNameRelatado}</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} style={{ marginHorizontal: 10 }} />
              <Text style={styles.changeTextNew} numberOfLines={1}>{suggestion.suggested_exercise_name}</Text>
            </View>

            <Text style={styles.reasonTitle}>Por que esta mudança?</Text>
            <Text style={styles.reasonText}>
              {suggestion.reasoning}
            </Text>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7} onPress={() => navigation.goBack()}>
                <Text style={styles.btnSecondaryText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimaryFlex} onPress={handleAccept} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>Aceitar Mudança</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}