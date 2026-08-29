import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from '../../utils/responsive'; 

interface Props {
  program: any;
  onPress?: () => void;
}

export const TrainingProgramCard = ({ program, onPress }: Props) => {
  const daysCount = program.workout_days?.length || 0;
  
  const exercisesCount = program.workout_days?.reduce((total: number, day: any) => {
    return total + (day.planned_exercises?.length || 0);
  }, 0) || 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="dumbbell" size={24} color="#FF5100" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{program.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Ativo</Text>
          </View>
        </View>
        
        {program.objective ? (
          <Text style={styles.objective} numberOfLines={1}>Foco: {program.objective}</Text>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Feather name="calendar" size={12} color="#A0A0A5" style={{ marginRight: 4 }} />
            <Text style={styles.statText}>{daysCount} Dias</Text>
          </View>
          <View style={styles.statPill}>
            <Feather name="list" size={12} color="#A0A0A5" style={{ marginRight: 4 }} />
            <Text style={styles.statText}>{exercisesCount} Exercícios</Text>
          </View>
        </View>
      </View>
      
      <Feather name="chevron-right" size={20} color="#666" style={{ marginLeft: scale(10) }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E1E24',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#2A2A32',
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255, 81, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  title: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: 'bold',
    flex: 1,
    marginRight: scale(8),
  },
  badge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#00E676',
  },
  badgeText: {
    color: '#00E676',
    fontSize: scale(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  objective: {
    color: '#A0A0A5',
    fontSize: scale(13),
    marginBottom: verticalScale(10),
  },
  statsRow: {
    flexDirection: 'row',
    gap: scale(10),
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  statText: {
    color: '#E0E0E0',
    fontSize: scale(11),
    fontWeight: '600',
  }
});