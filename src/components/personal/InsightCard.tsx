import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme'; 
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

export type InsightPriority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Insight {
  id: string;
  aluno: {
    id: string;
    nome: string;
  };
  priority: InsightPriority;
  exerciseName: string;
  painLocation?: string;
  painIntensity?: number;
}

interface InsightCardProps {
  insight: Insight;
  onPress: (insightId: string) => void;
}

export function InsightCard({ insight, onPress }: InsightCardProps) {
  
  const priorityConfig: Record<InsightPriority, { border: string; text: string }> = {
    'CRITICA': { border: theme.colors.danger, text: theme.colors.danger },
    'ALTA': { border: theme.colors.warning, text: theme.colors.warning },
    'MEDIA': { border: theme.colors.primary, text: theme.colors.primary },
    'BAIXA': { border: theme.colors.textSecondary, text: theme.colors.textSecondary },
  };

  const config = priorityConfig[insight.priority] || priorityConfig['MEDIA'];

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onPress(insight.id)}
      style={[styles.cardContainer, { borderLeftColor: config.border }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{insight.aluno.nome.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{insight.aluno.nome}</Text>
        </View>
        <Text style={styles.timeText}>Há 2 min</Text>
      </View>

      <Text style={styles.bodyText}>
        Relatou dor durante <Text style={styles.exerciseName}>{insight.exerciseName}</Text>
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.tagsContainer}>
          {insight.painLocation && (
            <View style={styles.tagNeutral}>
              <Text style={styles.tagNeutralText}>{insight.painLocation}</Text>
            </View>
          )}
          {insight.painIntensity && (
            <View style={styles.tagDanger}>
              <Text style={styles.tagDangerText}>
                Nível {insight.painIntensity}/10
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.actionText}>Ver Insight →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  avatarText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: moderateScale(14),
  },
  studentName: {
    color: theme.colors.text,
    fontSize: moderateScale(15),
    fontWeight: 'bold',
  },
  timeText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(11),
  },
  bodyText: {
    color: theme.colors.textBody,
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(20),
  },
  exerciseName: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: scale(8),
  },
  tagNeutral: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tagNeutralText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(11),
  },
  tagDanger: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  tagDangerText: {
    color: theme.colors.danger,
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  actionText: {
    color: theme.colors.primary,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});