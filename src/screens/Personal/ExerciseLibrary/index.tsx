import React from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, StatusBar, RefreshControl
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
              <View style={[StyleSheet.absoluteFill, { backgroundColor: MATCH_COLORS.surfaceCard, justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialCommunityIcons name="dumbbell" size={60} color="#1E1E24" />
              </View>
            )}
          </View>
          
          <LinearGradient
            colors={['transparent', 'rgba(5, 5, 5, 0.6)', '#050505']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={MATCH_COLORS.primary} />
              <Text style={styles.uploadingText}>Enviando Vídeo...</Text>
            </View>
          )}

          <View style={styles.content}>
            {item.type === 'PERSONAL' ? (
              <View style={styles.customBadge}>
                <Feather name="star" size={12} color="#FFF" />
                <Text style={styles.customBadgeText}>Meu Exercício</Text>
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
                  <Feather name="plus" size={22} color="#FFF" />
                </View>
              )}

              {state.isStudioMode && !isUploading && (
                <View style={styles.studioButton}>
                  <Feather name="upload" size={16} color={MATCH_COLORS.primary} style={{ marginRight: scale(6) }} />
                  <Text style={styles.studioButtonText}>Gravar</Text>
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Feather name="chevron-left" size={26} color={MATCH_COLORS.text} />
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {state.isSelectionMode ? 'SELECIONAR EXERCÍCIO' : state.isStudioMode ? 'MEU ESTÚDIO' : 'BIBLIOTECA'}
          </Text>
          {state.isStudioMode && <Text style={styles.headerSubtitle}>Toque em um exercício para gravar</Text>}
        </View>

        <TouchableOpacity onPress={() => actions.setIsModalVisible(true)} style={styles.iconButtonPrimary}>
          <Feather name="plus" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={MATCH_COLORS.textDim} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor={MATCH_COLORS.textDim}
          value={state.searchQuery}
          onChangeText={actions.setSearchQuery}
        />
        {state.searchQuery !== '' && (
          <TouchableOpacity onPress={() => actions.setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x-circle" size={20} color={MATCH_COLORS.textDim} />
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
          refreshControl={<RefreshControl refreshing={state.isRefreshing} onRefresh={actions.handleRefresh} tintColor={MATCH_COLORS.primary} />}
          ListFooterComponent={state.isLoadingMore ? <ActivityIndicator size="small" color={MATCH_COLORS.primary} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <MaterialCommunityIcons name="dumbbell" size={40} color={MATCH_COLORS.primary} />
              </View>
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