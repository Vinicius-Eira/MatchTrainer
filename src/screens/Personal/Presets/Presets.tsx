import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale } from '../../../utils/responsive';
import { supabase } from '../../../services/supabase';

export const Presets = ({ navigation }: any) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPresets = async () => {
        setIsLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { data, error } = await supabase
            .from('training_programs')
            .select(`
              id, 
              name, 
              objective, 
              created_at,
              workout_days (id)
            `)
            .eq('personal_id', session.user.id)
            .is('student_id', null)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setPresets(data || []);
        } catch (error) {
          console.error("Erro ao buscar presets:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPresets();
    }, [])
  );

  const renderPresetCard = ({ item }: { item: any }) => {
    const qtdDias = item.workout_days ? item.workout_days.length : 0;

    return (
      <TouchableOpacity 
        style={styles.presetCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WorkoutCreator', { programIdToEdit: item.id, isPresetMode: true })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBg}>
            <MaterialCommunityIcons name="layers-outline" size={24} color="#FF5100" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.objective || 'Nenhum objetivo definido'}</Text>
          </View>
          <View style={styles.actionArrow}>
            <Feather name="arrow-right" size={18} color="#FF5100" />
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.tag}>
            <Ionicons name="calendar-clear-outline" size={14} color="#A0A0A5" />
            <Text style={styles.tagText}>{qtdDias} {qtdDias === 1 ? 'Dia' : 'Dias'} de Treino</Text>
          </View>
          <Text style={styles.dateText}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Feather name="chevron-left" size={26} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>BIBLIOTECA</Text>
            <Text style={styles.headerSubtitle}>Modelos e Presets</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF5100" />
            <Text style={{ color: '#555', marginTop: 12, fontSize: scale(13) }}>Carregando biblioteca...</Text>
          </View>
        ) : (
          <FlatList
            data={presets}
            keyExtractor={(item) => item.id}
            renderItem={renderPresetCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconGlow}>
                  <MaterialCommunityIcons name="folder-star-multiple-outline" size={56} color="#FF5100" />
                </View>
                <Text style={styles.emptyTitle}>Seu cofre está vazio</Text>
                <Text style={styles.emptySubtitle}>
                  Crie fichas de treino padronizadas (Ex: Hipertrofia Iniciante) para aplicar rapidamente em qualquer novo aluno.
                </Text>
              </View>
            }
          />
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={styles.fabNeon} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutCreator', { isPresetMode: true })}
          >
            <Feather name="plus" size={20} color="#FF5100" />
            <Text style={styles.fabNeonText}>CRIAR MODELO</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050505' },
  container: { flex: 1 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10), paddingBottom: verticalScale(20), borderBottomWidth: 1, borderBottomColor: '#121214' },
  backBtn: { padding: scale(4) },
  headerTitleBox: { alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: scale(16), fontWeight: '900', letterSpacing: 1 },
  headerSubtitle: { color: '#888', fontSize: scale(12), marginTop: verticalScale(2) },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: scale(16), paddingBottom: verticalScale(120) }, 
  
  presetCard: { backgroundColor: '#0A0A0C', borderRadius: scale(16), padding: scale(16), marginBottom: verticalScale(16), borderWidth: 1, borderColor: '#1A1A20' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(16) },
  iconBg: { width: scale(48), height: scale(48), borderRadius: scale(14), backgroundColor: 'rgba(255, 81, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 81, 0, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: scale(14) },
  cardInfo: { flex: 1, paddingRight: scale(10) },
  cardTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold', marginBottom: verticalScale(4), letterSpacing: 0.5 },
  cardSubtitle: { color: '#888', fontSize: scale(13) },
  actionArrow: { width: scale(32), height: scale(32), borderRadius: scale(16), backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center' },
  
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#15151A', paddingTop: verticalScale(12) },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121214', paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(8) },
  tagText: { color: '#A0A0A5', fontSize: scale(12), fontWeight: '600', marginLeft: scale(6) },
  dateText: { color: '#555', fontSize: scale(12) },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(80), paddingHorizontal: scale(30) },
  emptyIconGlow: { width: scale(100), height: scale(100), borderRadius: scale(50), backgroundColor: 'rgba(255, 81, 0, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 81, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(20), shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20 },
  emptyTitle: { color: '#FFF', fontSize: scale(20), fontWeight: 'bold', marginBottom: verticalScale(10) },
  emptySubtitle: { color: '#777', fontSize: scale(14), textAlign: 'center', lineHeight: 22 },

  fabContainer: { position: 'absolute', bottom: verticalScale(30), width: '100%', alignItems: 'center', justifyContent: 'center' },
  fabNeon: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(5, 5, 5, 0.6)', 
    borderWidth: 1.5, 
    borderColor: '#FF5100', 
    borderRadius: scale(30), 
    paddingVertical: verticalScale(16), 
    paddingHorizontal: scale(32),
    shadowColor: '#FF5100', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 15, 
    elevation: 10 
  },
  fabNeonText: { color: '#FF5100', fontSize: scale(14), fontWeight: '900', marginLeft: scale(8), letterSpacing: 1 }
});