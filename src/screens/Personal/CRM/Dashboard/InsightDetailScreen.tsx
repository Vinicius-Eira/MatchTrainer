import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { theme } from '../../../../theme/theme'; 
import { scale, verticalScale, moderateScale } from '../../../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../services/supabase'; 
import * as Crypto from 'expo-crypto';

import { useCommandQueue } from '../../../../store/useCommandQueue'; 

type CopilotState = 'IDLE' | 'PROCESSING' | 'READY' | 'ERROR';

export function InsightDetailScreen({ navigation, route }: any) {
  const [copilotState, setCopilotState] = useState<CopilotState>('IDLE');
  const [suggestion, setSuggestion] = useState<any>(null);
  
  const { addCommand } = useCommandQueue();

  const insightId = route.params?.insightId || '00000000-0000-0000-0000-000000000000';
  const exerciseNameRelatado = route.params?.exerciseName || 'Agachamento Livre'; 

  useEffect(() => {
    if (insightId === '00000000-0000-0000-0000-000000000000') return;

    const channel = supabase.channel('realtime_suggestions')
      .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_suggestions', 
          filter: `insight_id=eq.${insightId}` 
      }, 
      (payload) => {
        setSuggestion(payload.new);
        setCopilotState('READY');
      }).subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [insightId]);

  const handleGenerateSuggestion = async () => {
    setCopilotState('PROCESSING');
    
    try {
      const { data, error } = await supabase.rpc('request_ai_insight', {
        p_insight_id: insightId 
      });

      if (error || !data?.success) {
        throw new Error(data?.error_message || 'Falha de comunicação com o servidor.');
      }

      console.log("Sucesso! Job criado na fila:", data.job_id);

    } catch (err) {
      console.error(err);
      setCopilotState('ERROR');
      Alert.alert('Erro', 'Falha ao acionar o Copilot.');
    }
  };

  const handleAccept = () => {
    if (!suggestion) return;

    const comando = {
      command_id: Crypto.randomUUID(),
      type: 'CMD_PERSONAL_APROVAR_SUGESTAO',
      status: 'PENDENTE',
      created_at: new Date().toISOString(),
      retry_count: 0,
      payload: {
        suggestion_id: suggestion.id,
        new_exercise_name: suggestion.suggested_exercise_name,
        insight_id: insightId
      }
    };

    addCommand(comando as any);
    console.log("Comando enviado para a fila offline:", comando);
    navigation.goBack();
  };

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), paddingVertical: verticalScale(15), borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { padding: scale(5) },
  headerTitle: { color: theme.colors.text, fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 1 },
  scrollContent: { padding: scale(20), paddingBottom: verticalScale(40) },
  
  contextCard: { backgroundColor: theme.colors.surface, borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: theme.colors.borderLight, marginBottom: verticalScale(24) },
  contextHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
  avatarText: { color: theme.colors.text, fontFamily: theme.fonts.title, fontSize: moderateScale(18) },
  studentName: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold' },
  studentGoal: { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: verticalScale(16) },
  eventTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold', marginBottom: verticalScale(12) },
  eventRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(10) },
  eventLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(14) },
  eventValue: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: 'bold', flexShrink: 1, textAlign: 'right' },
  tagNeutral: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: theme.colors.borderLight },
  tagNeutralText: { color: theme.colors.textSecondary, fontSize: moderateScale(12) },
  tagDanger: { backgroundColor: 'rgba(255, 59, 48, 0.1)', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },
  tagDangerText: { color: theme.colors.danger, fontSize: moderateScale(12), fontWeight: 'bold' },
  observationBox: { backgroundColor: theme.colors.surfaceLight, padding: scale(12), borderRadius: moderateScale(8), marginTop: verticalScale(8), borderLeftWidth: 3, borderLeftColor: theme.colors.textSecondary },
  observationText: { color: theme.colors.textBody, fontSize: moderateScale(13), fontStyle: 'italic' },

  sectionTitle: { color: theme.colors.text, fontSize: moderateScale(20), fontFamily: theme.fonts.title, marginBottom: verticalScale(16), letterSpacing: 0.5 },
  
  copilotIdle: { backgroundColor: 'rgba(255, 107, 0, 0.05)', borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', alignItems: 'center' },
  copilotIdleText: { color: theme.colors.textBody, fontSize: moderateScale(14), textAlign: 'center', marginBottom: verticalScale(20), lineHeight: moderateScale(20) },
  
  btnPrimary: { backgroundColor: theme.colors.primary, paddingVertical: verticalScale(14), paddingHorizontal: scale(24), borderRadius: moderateScale(12), width: '100%', alignItems: 'center' },
  btnPrimaryFlex: { flex: 2, backgroundColor: theme.colors.primary, paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center', marginLeft: scale(8) },
  btnPrimaryText: { color: '#000', fontSize: moderateScale(14), fontWeight: 'bold', textTransform: 'uppercase' },
  
  copilotLoading: { alignItems: 'center', justifyContent: 'center', paddingVertical: verticalScale(40) },
  copilotLoadingText: { color: theme.colors.primary, fontSize: moderateScale(14), marginTop: verticalScale(16), fontWeight: '600' },

  suggestionCard: { backgroundColor: theme.colors.surfaceLight, borderRadius: moderateScale(16), padding: scale(20), borderWidth: 1, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  suggestionTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: 'bold' },
  confidenceTag: { backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: scale(8), paddingVertical: verticalScale(4), borderRadius: moderateScale(6), borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  confidenceText: { color: theme.colors.success, fontSize: moderateScale(10), fontWeight: 'bold', textTransform: 'uppercase' },
  
  changeVisualizer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, paddingVertical: verticalScale(16), borderRadius: moderateScale(12), marginBottom: verticalScale(20) },
  changeTextStrike: { flex: 1, color: theme.colors.textSecondary, fontSize: moderateScale(14), textDecorationLine: 'line-through', textAlign: 'right' },
  changeTextNew: { flex: 1, color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: '900', textAlign: 'left' },
  
  reasonTitle: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: 'bold', marginBottom: verticalScale(8) },
  reasonText: { color: theme.colors.textBody, fontSize: moderateScale(13), lineHeight: moderateScale(20), marginBottom: verticalScale(24) },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { flex: 1, backgroundColor: theme.colors.background, paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight, marginRight: scale(8) },
  btnSecondaryText: { color: theme.colors.textBody, fontSize: moderateScale(13), fontWeight: 'bold' },
});