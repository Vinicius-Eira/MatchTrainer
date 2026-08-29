import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 
import { exerciseRepository } from '../../../data/repositories/ExerciseRepository';
import { Exercise } from '../../../domain/entities/Exercise';
import { Video, ResizeMode } from 'expo-av';
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { CreateCustomExerciseModal } from '../../../components/Exercise/CreateCustomExerciseModal';
import { scale, verticalScale } from '../../../utils/responsive';

const MUSCLE_FILTERS = [
  'Todos',
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Tríceps',
  'Bíceps',
  'CORE',
];

export const ExerciseLibraryScreen = ({ navigation, route }: any) => {
  const params = route.params || {};
  const isSelectionMode = params.isSelectionMode || false;
  const dayId = params.dayId; 

  const addExerciseToDay = useWorkoutCreatorStore((state: any) => state.addExerciseToDay || state.addExercise);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadExercises = useCallback(
    async (pageNum: number, query: string, filter: string, isReset: boolean = false) => {
      if (isReset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const data = await exerciseRepository.getExercises(query, filter, pageNum);

        if (isReset) {
          setExercises(data);
        } else {
          setExercises((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === 20);
      } catch (error) {
        console.error('Erro ao carregar exercícios na tela:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    const timeoutId = setTimeout(() => {
      loadExercises(1, searchQuery, selectedFilter, true);
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter, loadExercises]);

  useFocusEffect(
    useCallback(() => {
      if (exercises.length > 0) {
        loadExercises(1, searchQuery, selectedFilter, true);
        setPage(1);
      }
    }, [])
  );

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadExercises(nextPage, searchQuery, selectedFilter, false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (isSelectionMode && dayId) {
      const draftExerciseId = Math.random().toString(36).substring(7);
      
      const payload = {
        id: draftExerciseId,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        group_code: exercise.primaryMuscle,
        sets: 3,
        reps_target: '10-12',
        rest_seconds: 60,
        technique: 'Normal',
        video_url: exercise.video_url || exercise.gif_url || '',
        custom_media_url: exercise.video_url || exercise.gif_url || '',
      };

      addExerciseToDay(dayId, payload);
      navigation.goBack();
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const mediaUrl = item.video_url || ''; 
    const hasMedia = mediaUrl.length > 0;
    const isVideo = hasMedia && (mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.mov'));

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectExercise(item)}
        activeOpacity={0.9}
      >
        {hasMedia ? (
          isVideo ? (
            <Video
              source={{ uri: mediaUrl }}
              style={styles.backgroundImage}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping={true}
              isMuted={true}
            />
          ) : (
            <Image source={{ uri: mediaUrl }} style={styles.backgroundImage} resizeMode="cover" />
          )
        ) : (
          <View style={[styles.backgroundImage, { backgroundColor: '#18181B' }]} />
        )}
        
        <View style={styles.overlay} />

        <View style={styles.content}>
          {item.type === 'PERSONAL' && (
            <View style={styles.customBadge}>
              <Feather name="star" size={10} color="#000" />
              <Text style={styles.customBadgeText}>Meu Vídeo</Text>
            </View>
          )}

          <View style={styles.bottomSection}>
            <View style={styles.textInfo}>
              <Text style={styles.title} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.muscleTag}>
                <Text style={styles.muscleText}>{item.primaryMuscle || 'Geral'}</Text>
              </View>
            </View>

            {isSelectionMode && (
              <View style={styles.addButton}>
                <Feather name="plus" size={22} color="#FFF" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isSelectionMode ? 'Selecionar Exercício' : 'Biblioteca de Exercícios'}
        </Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)} 
          style={styles.addCustomBtn}
        >
          <Feather name="plus" size={20} color="#FF5100" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome do exercício..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={MUSCLE_FILTERS}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#FF5100" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderExerciseCard}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color="#FF5100" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="database" size={40} color="#444" />
              <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
            </View>
          }
        />
      )}
      <CreateCustomExerciseModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        onSuccess={() => {
          loadExercises(1, searchQuery, selectedFilter, true); 
        }} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: Platform.OS === 'android' ? verticalScale(30) : verticalScale(10),
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A32',
  },
  backBtn: { padding: scale(4) },
  headerTitle: { color: '#FFF', fontSize: scale(16), fontWeight: 'bold' },
  addCustomBtn: { padding: scale(6), backgroundColor: '#1E1E24', borderRadius: scale(8) },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    paddingHorizontal: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  searchIcon: { marginRight: scale(8) },
  searchInput: { flex: 1, color: '#FFF', paddingVertical: verticalScale(12), fontSize: scale(14) },
  
  filtersWrapper: { marginVertical: verticalScale(12) },
  filtersContainer: { paddingHorizontal: scale(20), gap: scale(8) },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  filterChipActive: { backgroundColor: 'rgba(255, 81, 0, 0.15)', borderColor: '#FF5100' },
  filterChipText: { color: '#A0A0A5', fontSize: scale(12), fontWeight: '600' },
  filterChipTextActive: { color: '#FF5100', fontWeight: 'bold' },

  listContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(40) },
  
  card: {
    height: verticalScale(150),
    borderRadius: scale(16),
    marginBottom: verticalScale(14),
    overflow: 'hidden',
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2A2A32',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  content: {
    flex: 1,
    padding: scale(16),
    justifyContent: 'space-between',
  },
  customBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5100',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(8),
    gap: scale(4),
  },
  customBadgeText: {
    color: '#000',
    fontSize: scale(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  textInfo: {
    flex: 1,
    paddingRight: scale(12),
  },
  title: {
    color: '#FFF',
    fontSize: scale(17),
    fontWeight: '900',
    marginBottom: verticalScale(6),
  },
  muscleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15),',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  muscleText: {
    color: '#E0E0E0',
    fontSize: scale(11),
    fontWeight: '600',
  },
  addButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: '#FF5100',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(60) },
  emptyText: { color: '#666', marginTop: verticalScale(12), fontSize: scale(14) },
});