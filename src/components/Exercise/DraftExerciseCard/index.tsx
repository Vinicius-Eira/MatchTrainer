import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, LayoutAnimation, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'; 
import { useVideoPlayer, VideoView } from 'expo-video'; 
import { useWorkoutCreatorStore } from '../../../store/useWorkoutCreatorStore';
import { ExerciseService } from '../../../services/ExerciseService'; 
import { styles } from './styles';

const TECHNIQUE_OPTIONS = ['Normal', 'Bi-Set', 'Drop-Set', 'Superset', 'Rest-Pause'];

export const DraftExerciseCard = ({ dayId, exercise, drag, isActive }: any) => {
  const store = useWorkoutCreatorStore((state: any) => state);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoViewRef = useRef(null);

  const currentTechnique = exercise.technique || 'Normal';

  const handleUpdate = (field: string, value: string | number) => {
    if (store.activeWeekId && dayId) {
      store.updateExercise(store.activeWeekId, dayId, exercise.id, field, value);
    }
  };

  const handleCycleTechnique = () => {
    const idx = TECHNIQUE_OPTIONS.indexOf(currentTechnique);
    const nextTech = TECHNIQUE_OPTIONS[(idx + 1) % TECHNIQUE_OPTIONS.length];
    handleUpdate('technique', nextTech);
  };

  const handleRemove = () => {
    if (store.activeWeekId && dayId) {
      store.removeExercise(store.activeWeekId, dayId, exercise.id);
    }
  };

  const displayMedia = exercise.custom_media_url || exercise.video_url || exercise.gif_url || exercise.thumbnail_url;
  const isVideo = displayMedia ? displayMedia.toLowerCase().includes('.mp4') || displayMedia.toLowerCase().includes('.mov') : false;

  const videoSource = isVideo && displayMedia ? displayMedia : null;
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
    player.currentTime = 0.5; 
  });

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleUploadVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Ops!', 'Precisamos de permissão para acessar a galeria do celular.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, 
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const uri = result.assets[0].uri;
        
        const uploadResult = await ExerciseService.uploadExerciseMedia(uri, true);
        
        if (uploadResult.success && uploadResult.url) {
          handleUpdate('custom_media_url', uploadResult.url);
          Alert.alert("Sucesso", "Vídeo exclusivo adicionado para este aluno!");
        } else {
          throw new Error('Falha ao subir o vídeo.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema durante o upload do vídeo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayFullscreen = () => {
    if (player) {
      player.play();
    }
  };

  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          onLongPress={drag} 
          delayLongPress={150} 
          style={styles.dragHandle}
        >
          <MaterialCommunityIcons name="drag-vertical" size={26} color={isActive ? "#FF5100" : "#555"} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>{exercise.exercise_name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{exercise.group_code || 'Geral'}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCycleTechnique}
              activeOpacity={0.7}
              style={[styles.badge, { backgroundColor: 'rgba(255, 81, 0, 0.1)', borderColor: 'rgba(255, 81, 0, 0.35)' }]}
            >
              <Text style={[styles.badgeText, { color: '#FF5100' }]}>{currentTechnique}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleRemove} style={styles.deleteBtn}>
          <Feather name="trash-2" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        
        <View style={styles.mediaColumn}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#FF5100" />
          ) : displayMedia ? (
            <>
              {isVideo ? (
                <VideoView
                  ref={videoViewRef}
                  player={player}
                  style={styles.image}
                  contentFit="cover"
                  nativeControls={true}
                />
              ) : (
                <Image source={{ uri: displayMedia }} style={styles.image} contentFit="cover" transition={200} />
              )}
              
              {isVideo && (
                <TouchableOpacity style={styles.playOverlay} onPress={handlePlayFullscreen}>
                  <Feather name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.editMediaBadge} onPress={handleUploadVideo}>
                <Feather name="edit-2" size={12} color="#FFF" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={handleUploadVideo}>
              <Feather name="video" size={24} color="#555" style={{ marginBottom: 6 }} />
              <Text style={styles.noMediaText}>Vídeo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputsColumn}>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Séries</Text>
              <TextInput 
                style={styles.input} 
                value={exercise.sets?.toString() || ''} 
                keyboardType="numeric" 
                onChangeText={(text) => handleUpdate('sets', text)} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reps</Text>
              <TextInput 
                style={styles.input} 
                value={exercise.reps_target?.toString() || ''} 
                onChangeText={(text) => handleUpdate('reps_target', text)} 
              />
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carga (kg)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 20" 
                placeholderTextColor="#444" 
                value={exercise.weight_target?.toString() || ''} 
                onChangeText={(text) => handleUpdate('weight_target', text)} 
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pausa (s)</Text>
              <TextInput 
                style={styles.input} 
                value={exercise.rest_seconds?.toString() || ''} 
                keyboardType="numeric" 
                onChangeText={(text) => handleUpdate('rest_seconds', text)} 
              />
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.expandButton} onPress={toggleExpand} activeOpacity={0.8}>
        <Text style={styles.expandButtonText}>{isExpanded ? 'Ocultar Anotações' : 'Anotações (Públicas/Privadas)'}</Text>
        <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#FF5100" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedArea}>
          <View style={styles.detailGroup}>
            <View style={styles.detailHeader}>
              <Ionicons name="flash" size={16} color="#FF5100" />
              <Text style={[styles.detailLabel, { color: '#FF5100' }]}>Técnica (Bi-Set / Drop-Set / Superset)</Text>
            </View>
            <View style={styles.techniqueRow}>
              {TECHNIQUE_OPTIONS.map((tech) => {
                const selected = currentTechnique === tech;
                return (
                  <TouchableOpacity
                    key={tech}
                    onPress={() => handleUpdate('technique', tech)}
                    style={[styles.techPill, selected && styles.techPillActive]}
                  >
                    <Text style={[styles.techPillText, selected && styles.techPillTextActive]}>{tech}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.detailGroup}>
            <View style={styles.detailHeader}>
              <Ionicons name="eye" size={16} color="#00E676" />
              <Text style={[styles.detailLabel, { color: '#00E676' }]}>Nota Pública (O Aluno vê no treino)</Text>
            </View>
            <TextInput 
              style={[styles.textArea, { borderColor: 'rgba(0, 230, 118, 0.3)' }]} 
              placeholder="Ex: Foque na descida lenta. Mantenha o abdômen contraído." 
              placeholderTextColor="#555" 
              multiline
              textAlignVertical="top"
              value={exercise.public_note} 
              onChangeText={(text) => handleUpdate('public_note', text)} 
            />
          </View>
          
          <View style={styles.detailGroup}>
            <View style={styles.detailHeader}>
              <Ionicons name="lock-closed" size={16} color="#FFD700" />
              <Text style={[styles.detailLabel, { color: '#FFD700' }]}>Nota Privada (Só você vê)</Text>
            </View>
            <TextInput 
              style={[styles.textArea, { borderColor: 'rgba(255, 215, 0, 0.3)' }]} 
              placeholder="Ex: Aluno sente desconforto no ombro. Acompanhar." 
              placeholderTextColor="#555" 
              multiline
              textAlignVertical="top"
              value={exercise.private_note} 
              onChangeText={(text) => handleUpdate('private_note', text)} 
            />
          </View>
        </View>
      )}

    </View>
  );
};