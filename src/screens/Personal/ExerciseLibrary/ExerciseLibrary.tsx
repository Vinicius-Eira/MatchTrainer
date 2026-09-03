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
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'; // <-- IMPORTAÇÃO CORRETA DO EXPO-IMAGE
import { exerciseRepository } from '../../../data/repositories/ExerciseRepository';
import { ExerciseService } from '../../../services/ExerciseService';
import { Exercise } from '../../../domain/entities/Exercise';
import { Video, ResizeMode } from 'expo-av';
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { CreateCustomExerciseModal } from '../../../components/Exercise/CreateCustomExerciseModal';
import { scale, verticalScale, moderateScale } from '../../../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

const MATCH_COLORS = {
  primary: '#FF5100',
  primaryGlow: 'rgba(255, 81, 0, 0.2)',
  surfaceDark: '#09090B',
  surfaceCard: 'rgba(28, 28, 33, 0.6)', 
  borderLight: 'rgba(255, 255, 255, 0.08)',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
};

const MUSCLE_FILTERS = [
  'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Tríceps', 'Bíceps', 'CORE',
];

export const ExerciseLibraryScreen = ({ navigation, route }: any) => {
  const params = route.params || {};
  const isSelectionMode = params.isSelectionMode || false;
  const isStudioMode = params.isStudioMode || false; 
  const dayId = params.dayId; 

  const addExerciseToDay = useWorkoutCreatorStore((state: any) => state.addExerciseToDay || state.addExercise);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [hasMore, setHasMore] = useState(true);
  
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadExercises = useCallback(
    async (pageNum: number, query: string, filter: string, isReset: boolean = false) => {
      if (isReset && !isRefreshing) setIsLoading(true);
      else if (!isReset) setIsLoadingMore(true);

      try {
        const data = await exerciseRepository.getExercises(query, filter, pageNum);

        if (isReset) setExercises(data);
        else setExercises((prev) => [...prev, ...data]);

        setHasMore(data.length === 20);
      } catch (error) {
        console.error('Erro ao carregar exercícios:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false); 
      }
    },
    [isRefreshing] 
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    loadExercises(1, searchQuery, selectedFilter, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadExercises(nextPage, searchQuery, selectedFilter, false);
    }
  };

  const handleDirectUpload = async (exercise: Exercise) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ops!', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5, 
        videoMaxDuration: 15, 
      });

      if (result.canceled) return;

      const mediaUri = result.assets[0].uri;
      setUploadingId(exercise.id); 

      const uploadResult = await ExerciseService.uploadExerciseMedia(mediaUri, true);
      
      if (!uploadResult.success) {
        throw new Error('Falha ao subir o vídeo para o Storage.');
      }

      console.log(`\n[TELA] Vídeo subiu pro Storage! URL:`, uploadResult.url);

      const saveResult = await ExerciseService.updateExerciseMedia(
        exercise.id,
        uploadResult.url || ''
      );

      console.log(`[TELA] Resultado do salvamento:`, saveResult);

      if (saveResult.success) {
        console.log(`[TELA] Recarregando a lista para exibir o vídeo...`);
        loadExercises(1, searchQuery, selectedFilter, true);
      } else {
        const erroReal = typeof saveResult.error === 'string' 
          ? saveResult.error 
          : JSON.stringify(saveResult.error);
          
        throw new Error(`Erro do Banco: ${erroReal}`);
      }

    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message || 'Ocorreu um erro.');
    } finally {
      setUploadingId(null);
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
    } else if (isStudioMode) {
      handleDirectUpload(exercise);
    }
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    const mediaUrl = item.gif_url || item.video_url || '';
    const hasMedia = mediaUrl.trim().length > 0;
    const isVideo = hasMedia && (mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.mov'));
    const isUploading = uploadingId === item.id;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => handleSelectExercise(item)}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <View style={styles.card}>
         {/* BLOCO DE MÍDIA CORRIGIDO COM EXPO-IMAGE */}
         <View style={StyleSheet.absoluteFillObject}>
           {hasMedia ? (
              isVideo ? (
                <Video
                  source={{ uri: mediaUrl.trim() }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                  onError={(error) => console.log("🚨 ERRO NO VÍDEO:", error, "URL:", mediaUrl)}
                />
              ) : (
                <Image 
                  source={{ uri: mediaUrl.trim(), headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)' } }} 
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  transition={200}
                  onLoad={() => console.log("✅ IMAGEM CARREGOU:", mediaUrl)}
                  onError={(error) => console.log("🚨 ERRO NA IMAGEM:", error, "URL:", mediaUrl)}
                />
              )
            ) : (
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MATCH_COLORS.surfaceCard }]} />
            )}
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(9, 9, 11, 0.4)', '#09090B']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={MATCH_COLORS.primary} />
              <Text style={styles.uploadingText}>Enviando e Processando...</Text>
            </View>
          )}

          <View style={styles.content}>
            {item.type === 'PERSONAL' ? (
              <View style={styles.customBadge}>
                <Feather name="star" size={10} color="#000" />
                <Text style={styles.customBadgeText}>Meu Vídeo</Text>
              </View>
            ) : <View />}

            <View style={styles.bottomSection}>
              <View style={styles.textInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <View style={styles.muscleTag}>
                  <Text style={styles.muscleText}>{item.primaryMuscle || 'Geral'}</Text>
                </View>
              </View>

              {isSelectionMode && (
                <View style={styles.addButton}>
                  <Feather name="plus" size={20} color="#FFF" />
                </View>
              )}

              {isStudioMode && !isUploading && (
                <View style={styles.studioButton}>
                  <Feather name="upload" size={16} color={MATCH_COLORS.primary} style={{ marginRight: scale(6) }} />
                  <Text style={styles.studioButtonText}>Subir</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MATCH_COLORS.surfaceDark }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={MATCH_COLORS.text} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {isSelectionMode ? 'SELECIONAR EXERCÍCIO' : isStudioMode ? 'ESTÚDIO DE VÍDEOS' : 'BIBLIOTECA'}
          </Text>
          {isStudioMode && <Text style={{ color: MATCH_COLORS.primary, fontSize: moderateScale(10), fontWeight: '700' }}>Toque em um exercício para gravar</Text>}
        </View>

        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)} 
          style={styles.iconButtonPrimary}
        >
          <Feather name="plus" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={MATCH_COLORS.textDim} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor={MATCH_COLORS.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color={MATCH_COLORS.textDim} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={MUSCLE_FILTERS}
          keyExtractor={(item) => item}
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
              <Text style={[
                styles.filterChipText,
                selectedFilter === item && styles.filterChipTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={MATCH_COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderExerciseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={MATCH_COLORS.primary}
              colors={[MATCH_COLORS.primary]}
            />
          }
          ListFooterComponent={
            isLoadingMore ? <ActivityIndicator size="small" color={MATCH_COLORS.primary} style={{ marginVertical: 16 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Feather name="database" size={32} color={MATCH_COLORS.textDim} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum exercício encontrado</Text>
            </View>
          }
        />
      )}
      
      <CreateCustomExerciseModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        onSuccess={() => loadExercises(1, searchQuery, selectedFilter, true)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MATCH_COLORS.surfaceDark },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'android' ? verticalScale(40) : verticalScale(10),
    paddingBottom: verticalScale(16),
  },
  iconButton: { 
    width: scale(40), height: scale(40), 
    borderRadius: moderateScale(12), 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    justifyContent: "center", alignItems: "center", 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight 
  },
  iconButtonPrimary: {
    width: scale(40), height: scale(40), 
    borderRadius: moderateScale(12), 
    backgroundColor: MATCH_COLORS.primary, 
    justifyContent: "center", alignItems: "center", 
  },
  headerTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(14), fontWeight: '900', letterSpacing: 1 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: scale(20),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
    height: verticalScale(48)
  },
  searchIcon: { marginRight: scale(8) },
  searchInput: { flex: 1, color: MATCH_COLORS.text, fontSize: moderateScale(14) },
  
  filtersWrapper: { marginVertical: verticalScale(16) },
  filtersContainer: { paddingHorizontal: scale(20), gap: scale(8) },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
  },
  filterChipActive: { backgroundColor: MATCH_COLORS.primaryGlow, borderColor: MATCH_COLORS.primary },
  filterChipText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(12), fontWeight: '600' },
  filterChipTextActive: { color: MATCH_COLORS.primary, fontWeight: '800' },

  listContent: { paddingHorizontal: scale(20), paddingBottom: verticalScale(40) },
  
  cardWrapper: {
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    height: verticalScale(200), 
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
  },
  content: {
    flex: 1,
    padding: scale(16),
    justifyContent: 'space-between',
    zIndex: 2,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  uploadingText: {
    color: MATCH_COLORS.text,
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginTop: verticalScale(10),
  },
  customBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MATCH_COLORS.primary,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    gap: scale(4),
  },
  customBadgeText: { color: '#000', fontSize: moderateScale(10), fontWeight: '900', textTransform: 'uppercase' },
  
  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
  textInfo: { flex: 1, paddingRight: scale(12) },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(18), fontWeight: '900', marginBottom: verticalScale(4), letterSpacing: 0.5 },
  
  muscleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  muscleText: { color: MATCH_COLORS.text, fontSize: moderateScale(11), fontWeight: '700' },
  
  addButton: {
    width: scale(40), height: scale(40),
    borderRadius: moderateScale(20),
    backgroundColor: MATCH_COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  studioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 81, 0, 0.15)',
    borderWidth: 1,
    borderColor: MATCH_COLORS.primary,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
  },
  studioButtonText: {
    color: MATCH_COLORS.primary,
    fontSize: moderateScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(80) },
  emptyIconBg: { 
    width: scale(64), height: scale(64), 
    borderRadius: moderateScale(20), 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    justifyContent: "center", alignItems: "center", 
    marginBottom: verticalScale(16), 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight 
  },
  emptyTitle: { color: MATCH_COLORS.textDim, marginTop: verticalScale(8), fontSize: moderateScale(14), fontWeight: '600' },
});