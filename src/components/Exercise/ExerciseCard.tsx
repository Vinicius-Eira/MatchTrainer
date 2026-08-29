import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av'; 
import { scale, verticalScale } from '../../utils/responsive';

interface Props {
  exercise: any; 
  onSelect: (exercise: any) => void;
}

export const ExerciseCard = ({ exercise, onSelect }: Props) => {
  const mediaUrl = exercise.video_url || exercise.gif_url || '';
  const hasMedia = mediaUrl.length > 0;
  const isVideo = hasMedia && (mediaUrl.toLowerCase().includes('.mp4') || mediaUrl.toLowerCase().includes('.mov'));

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={() => onSelect(exercise)}
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
          <Image 
            source={{ uri: mediaUrl }} 
            style={styles.backgroundImage} 
            resizeMode="cover"
          />
        )
      ) : (
        <View style={[styles.backgroundImage, { backgroundColor: '#18181B' }]} />
      )}

      <View style={styles.overlay} />

      <View style={styles.content}>
        
        {exercise.type === 'PERSONAL' && (
          <View style={styles.customBadge}>
            <Feather name="star" size={10} color="#000" />
            <Text style={styles.customBadgeText}>Meu Vídeo</Text>
          </View>
        )}

        <View style={styles.bottomSection}>
          <View style={styles.textInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {exercise.name}
            </Text>
            <View style={styles.muscleTag}>
              <Text style={styles.muscleText}>{exercise.primaryMuscle || 'Geral'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.7}
            onPress={() => onSelect(exercise)}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: verticalScale(160),
    borderRadius: scale(16),
    marginBottom: verticalScale(16),
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
    backgroundColor: 'rgba(0,0,0,0.5)', 
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
    fontSize: scale(18),
    fontWeight: '900',
    marginBottom: verticalScale(6),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  muscleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  muscleText: {
    color: '#E0E0E0',
    fontSize: scale(12),
    fontWeight: '600',
  },
  addButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#FF5100',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  }
});