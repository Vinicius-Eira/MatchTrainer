import React from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, StatusBar, RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import { CreateCustomExerciseModal } from '../../../components/Exercise/CreateCustomExerciseModal';
import { scale, moderateScale } from '../../../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

import { useExerciseLibrary, MATCH_COLORS, MUSCLE_FILTERS } from './useExerciseLibrary';
import { styles } from './styles';

const ReprodutorVideo = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  return (
    <VideoView 
      style={StyleSheet.absoluteFill} 
      player={player} 
      contentFit="cover" 
      nativeControls={false} 
    />
  );
};

export function ExerciseLibraryScreen({ navigation, route }: any) {
  const { state, actions } = useExerciseLibrary(route, navigation);

  const renderExerciseCard = ({ item }: any) => {
    const mediaUrl = item.gif_url || item.video_url || '';
    const hasMedia = mediaUrl.trim().length > 0;
    const isVideo = hasMedia && (mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.mov'));
    const isUploading = state.uploadingId === item.id;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => actions.handleSelectExercise(item)}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <View style={styles.card}>
          <View style={StyleSheet.absoluteFill}>
            {hasMedia ? (
              isVideo ? (
                <ReprodutorVideo url={mediaUrl.trim()} />
              ) : (
                <Image 
                  source={{ uri: mediaUrl.trim(), headers: { 'User-Agent': 'Mozilla/5.0' } }} 
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
              )
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: MATCH_COLORS.surfaceCard }]} />
            )}
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(9, 9, 11, 0.4)', '#09090B']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
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

              {state.isSelectionMode && (
                <View style={styles.addButton}>
                  <Feather name="plus" size={20} color="#FFF" />
                </View>
              )}

              {state.isStudioMode && !isUploading && (
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
      <View style={[StyleSheet.absoluteFill, { backgroundColor: MATCH_COLORS.surfaceDark }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={MATCH_COLORS.text} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {state.isSelectionMode ? 'SELECIONAR EXERCÍCIO' : state.isStudioMode ? 'ESTÚDIO DE VÍDEOS' : 'BIBLIOTECA'}
          </Text>
          {state.isStudioMode && <Text style={{ color: MATCH_COLORS.primary, fontSize: moderateScale(10), fontWeight: '700' }}>Toque em um exercício para gravar</Text>}
        </View>

        <TouchableOpacity onPress={() => actions.setIsModalVisible(true)} style={styles.iconButtonPrimary}>
          <Feather name="plus" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={MATCH_COLORS.textDim} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor={MATCH_COLORS.textDim}
          value={state.searchQuery}
          onChangeText={actions.setSearchQuery}
        />
        {state.searchQuery !== '' && (
          <TouchableOpacity onPress={() => actions.setSearchQuery('')}>
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
              style={[styles.filterChip, state.selectedFilter === item && styles.filterChipActive]}
              onPress={() => actions.setSelectedFilter(item)}
            >
              <Text style={[styles.filterChipText, state.selectedFilter === item && styles.filterChipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {state.isLoading && !state.isRefreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={MATCH_COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={state.exercises}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderExerciseCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={actions.handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={state.isRefreshing} onRefresh={actions.handleRefresh} tintColor={MATCH_COLORS.primary} colors={[MATCH_COLORS.primary]} />}
          ListFooterComponent={state.isLoadingMore ? <ActivityIndicator size="small" color={MATCH_COLORS.primary} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}><Feather name="database" size={32} color={MATCH_COLORS.textDim} /></View>
              <Text style={styles.emptyTitle}>Nenhum exercício encontrado</Text>
            </View>
          }
        />
      )}
      
      <CreateCustomExerciseModal 
        visible={state.isModalVisible} 
        onClose={() => actions.setIsModalVisible(false)} 
        onSuccess={() => actions.loadExercises(1, state.searchQuery, state.selectedFilter, true)} 
      />
    </SafeAreaView>
  );
}