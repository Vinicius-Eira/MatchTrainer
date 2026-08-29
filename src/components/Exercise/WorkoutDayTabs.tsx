import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { scale, verticalScale } from '../../utils/responsive';
import { useWorkoutCreatorStore } from '../../store/useWorkoutCreatorStore';

export const WorkoutDayTabs = () => {
  const { days, activeDayId, setActiveDay, addDay } = useWorkoutCreatorStore();

  const currentActiveId = activeDayId || (days.length > 0 ? days[0].id : null);

  const handleAddDay = () => {
    const nextChar = String.fromCharCode(65 + days.length); 
    addDay(`Treino ${nextChar}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {days.map((day) => {
          const isActive = day.id === currentActiveId;
          return (
            <TouchableOpacity 
              key={day.id} 
              onPress={() => setActiveDay(day.id)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {day.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddDay}>
          <Text style={styles.addButtonText}>+ Dia</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: verticalScale(50),
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A32',
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    alignItems: 'center',
    gap: scale(12),
  },
  tab: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#FF5100',
  },
  tabText: {
    color: '#A0A0A5',
    fontSize: scale(14),
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF5100',
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    backgroundColor: '#2A2A32',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: 'bold',
  }
});