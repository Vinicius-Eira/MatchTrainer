import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
        activeOpacity={0.8}
        onPress={() => navigation.navigate('WorkoutCreator', { programIdToEdit: item.id, isPresetMode: true })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBg}>
            <MaterialCommunityIcons name="dumbbell" size={20} color="#FF5100" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.objective || 'Sem objetivo definido'}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" />
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.tag}>
            <Feather name="calendar" size={12} color="#A0A0A5" />
            <Text style={styles.tagText}>{qtdDias} {qtdDias === 1 ? 'Dia' : 'Dias'} de Treino</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Biblioteca de Modelos</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* LISTA DE PRESETS */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF5100" />
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
                <MaterialCommunityIcons name="folder-open-outline" size={60} color="#333" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Nenhum modelo ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Crie fichas de treino globais (Ex: Hipertrofia Iniciante) para aplicar rapidamente em qualquer aluno.
                </Text>
              </View>
            }
          />
        )}

        {/* BOTÃO FLUTUANTE: CRIAR NOVO MODELO */}
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          // Envia o isPresetMode para avisar o WorkoutCreator que não é pra salvar num aluno!
          onPress={() => navigation.navigate('WorkoutCreator', { isPresetMode: true })}
        >
          <Feather name="plus" size={24} color="#000" />
          <Text style={styles.fabText}>Novo Modelo</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121214' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(16), paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10), paddingBottom: verticalScale(16), borderBottomWidth: 1, borderBottomColor: '#2A2A32' },
  backBtn: { padding: scale(4) },
  headerTitle: { color: '#FFF', fontSize: scale(18), fontWeight: 'bold' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { padding: scale(20), paddingBottom: verticalScale(100) },
  
  presetCard: { backgroundColor: '#1E1E24', borderRadius: scale(16), padding: scale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: '#2A2A32' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12) },
  iconBg: { width: scale(40), height: scale(40), borderRadius: scale(10), backgroundColor: 'rgba(255, 81, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
  cardInfo: { flex: 1, paddingRight: scale(10) },
  cardTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold', marginBottom: verticalScale(2) },
  cardSubtitle: { color: '#A0A0A5', fontSize: scale(13) },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A2A32', paddingTop: verticalScale(12) },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121214', paddingHorizontal: scale(10), paddingVertical: verticalScale(6), borderRadius: scale(8), borderWidth: 1, borderColor: '#333' },
  tagText: { color: '#A0A0A5', fontSize: scale(11), fontWeight: 'bold', marginLeft: scale(6) },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(80), paddingHorizontal: scale(40) },
  emptyTitle: { color: '#FFF', fontSize: scale(18), fontWeight: 'bold', marginBottom: verticalScale(8) },
  emptySubtitle: { color: '#888', fontSize: scale(14), textAlign: 'center', lineHeight: 22 },

  fab: { position: 'absolute', bottom: verticalScale(30), right: scale(20), left: scale(20), backgroundColor: '#FF5100', borderRadius: scale(16), paddingVertical: verticalScale(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#FF5100', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  fabText: { color: '#000', fontSize: scale(16), fontWeight: '900', marginLeft: scale(8), letterSpacing: 0.5 }
});