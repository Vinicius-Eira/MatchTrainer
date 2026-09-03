import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';
import { theme } from '../../../../../../theme/theme';
import { scale, verticalScale, moderateScale } from '../../../../../../utils/responsive';

export default function TabTreinosEvolucao({ 
  aluno, 
  navigation, 
  mostrarAjudaAdesao,
  streak, 
  adesao, 
  ultimosLogs 
}: any) {
  
  const temDados = adesao && adesao.length > 0;

  return (
    <View style={styles.sectionContainer}>
      <View style={[styles.sectionHeaderRow, { marginBottom: verticalScale(12) }]}>
        <FontAwesome5 name="dumbbell" size={20} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Programas de Treino</Text>
      </View>

      <View style={styles.treinosMainCard}>
        <View style={styles.treinosCardHeader}>
          <View style={styles.treinosIconBg}>
            <Ionicons name="list" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.treinosCardTitle}>Gestão de Treinos</Text>
            <Text style={styles.treinosCardDesc}>Controle as fichas e rotinas deste aluno</Text>
          </View>
        </View>
        
        <View style={styles.treinosActionRow}>
          <TouchableOpacity 
            style={styles.btnVerTreinos} 
            onPress={() => navigation.navigate("ListaTreinosAluno", { 
              alunoId: aluno?.id, 
              alunoNome: aluno?.nome 
            })}
            activeOpacity={0.8}
          >
            <Ionicons name="eye" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Ver Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnVerTreinos} 
            onPress={() => navigation.navigate("HistoricoTreinosAluno", { 
                alunoId: aluno?.id, 
                alunoNome: aluno?.nome 
            })}
            activeOpacity={0.8}
          >
            <Ionicons name="archive-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.btnVerTreinosText}>Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionHeaderRow, { marginTop: verticalScale(30), marginBottom: verticalScale(16) }]}>
        <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
        <Text style={styles.sectionHeading}>Evolução & Progresso</Text>
      </View>

      <View style={styles.aiSummaryCard}>
        <LinearGradient colors={["rgba(255,107,0,0.15)", "rgba(255,107,0,0.02)"]} style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]} />
        <View style={styles.aiHeader}>
          <View style={styles.aiHeaderTitle}>
            <MaterialCommunityIcons name="radar" size={20} color={theme.colors.primary} />
            <Text style={styles.aiTitle} numberOfLines={1} ellipsizeMode="tail">Diagnóstico de Progresso</Text>
          </View>
          <Text style={styles.aiDateLabel}>Em breve</Text>
        </View>
        <Text style={styles.aiText}>
          {temDados 
            ? "O motor de IA começará a analisar o padrão de treinos do aluno nas próximas atualizações para gerar feedbacks preditivos."
            : "Aguardando os primeiros treinos do aluno para que o motor de inteligência analise a adesão e evolução de cargas."}
        </Text>
      </View>

      <View style={styles.gamificationRow}>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationEmoji}>🔥</Text>
          <Text style={styles.gamificationValue}>{streak || 0} Treinos</Text>
          <Text style={styles.gamificationLabel}>Sequência Atual</Text>
        </View>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationEmoji}>🏆</Text>
          <Text style={styles.gamificationValue}>{temDados ? "Em breve" : "--"}</Text>
          <Text style={styles.gamificationLabel}>Recorde Pessoal (PR)</Text>
        </View>
      </View>

      <View style={styles.adherenceCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(2) }}>
          <Text style={styles.adherenceCardTitle}>Frequência por Ficha</Text>
          <TouchableOpacity onPress={mostrarAjudaAdesao} style={{ marginLeft: scale(6), padding: scale(4) }}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.adherenceCardDesc}>Quais treinos o aluno mais conclui</Text>

        {!temDados ? (
          <View style={{ paddingVertical: verticalScale(10) }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: moderateScale(13) }}>Nenhum treino concluído ainda.</Text>
          </View>
        ) : (
          adesao.map((item: any, index: number) => {
            const isDanger = item.percentual < 50;
            const barColor = isDanger ? theme.colors.danger : theme.colors.success;
            return (
              <View key={index} style={styles.adherenceItem}>
                <View style={styles.adherenceRowLabel}>
                  <Text style={styles.adherenceLabelText}>{item.nome}</Text>
                  <Text style={[styles.adherencePercentText, isDanger && { color: theme.colors.danger }]}>
                    {item.percentual}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.percentual}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.progressionCard}>
        <View style={styles.progressionHeader}>
          <Ionicons name="swap-vertical" size={20} color={theme.colors.primary} />
          <Text style={styles.progressionTitle}>Últimos Exercícios</Text>
        </View>

        {!ultimosLogs || ultimosLogs.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: verticalScale(20) }}>
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={40} color={theme.colors.borderLight} />
            <Text style={{ color: theme.colors.textMuted, marginTop: 8, fontSize: moderateScale(12), textAlign: 'center' }}>
              A evolução de cargas aparecerá aqui após o primeiro treino.
            </Text>
          </View>
        ) : (
          <View style={styles.comparisonContainer}>
            {ultimosLogs.map((log: any, index: number) => (
              <View key={index} style={styles.comparisonRow}>
                <View style={styles.comparisonDotBox}>
                  <View style={[styles.comparisonDot, { backgroundColor: index === 0 ? theme.colors.success : theme.colors.textMuted }]} />
                  {index !== ultimosLogs.length - 1 && <View style={styles.comparisonLine} />}
                </View>
                <View style={styles.comparisonContent}>
                  <Text style={[styles.comparisonDate, index === 0 && { color: theme.colors.text }]}>
                    {log.exercise_name || "Exercício"}
                  </Text>
                  <Text style={[styles.comparisonData, index === 0 && { color: theme.colors.success }]}>
                    {log.weight_used ? `Carga: ${log.weight_used}kg` : "Sem carga"}  |  Esforço: RPE {log.rpe || "--"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}