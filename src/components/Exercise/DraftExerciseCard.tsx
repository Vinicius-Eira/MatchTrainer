import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, LayoutAnimation, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import { scale, verticalScale } from '../../utils/responsive';
import { DraftExercise, useWorkoutCreatorStore } from '../../store/useWorkoutCreatorStore';
import { ExerciseService } from '../../services/ExerciseService'; 

interface Props {
  dayId: string;
  exercise: DraftExercise;
  drag?: () => void; 
  isActive?: boolean;
}

export const DraftExerciseCard = ({ dayId, exercise, drag, isActive }: Props) => {
  const { updateExercise, removeExercise } = useWorkoutCreatorStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoViewRef = useRef(null);

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
        mediaTypes: ['videos'], 
        allowsEditing: true,
        quality: 0.5,
        videoMaxDuration: 15,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const uri = result.assets[0].uri;
        
        const uploadResult = await ExerciseService.uploadExerciseMedia(uri, true);
        
        if (uploadResult.success && uploadResult.url) {
          updateExercise(dayId, exercise.id, { custom_media_url: uploadResult.url });
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
            <View style={[styles.badge, { backgroundColor: 'rgba(255, 81, 0, 0.1)' }]}>
              <Text style={[styles.badgeText, { color: '#FF5100' }]}>{exercise.technique || 'Normal'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => removeExercise(dayId, exercise.id)} style={styles.deleteBtn}>
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
                <Image source={{ uri: displayMedia }} style={styles.image} resizeMode="cover" />
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
              <TextInput style={styles.input} value={String(exercise.sets)} keyboardType="numeric" onChangeText={(text) => updateExercise(dayId, exercise.id, { sets: Number(text) || 0 })} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reps</Text>
              <TextInput style={styles.input} value={exercise.reps_target} onChangeText={(text) => updateExercise(dayId, exercise.id, { reps_target: text })} />
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carga (kg)</Text>
              <TextInput style={styles.input} placeholder="Ex: 20" placeholderTextColor="#444" value={exercise.weight_target} onChangeText={(text) => updateExercise(dayId, exercise.id, { weight_target: text })} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pausa (s)</Text>
              <TextInput style={styles.input} value={String(exercise.rest_seconds)} keyboardType="numeric" onChangeText={(text) => updateExercise(dayId, exercise.id, { rest_seconds: Number(text) || 0 })} />
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
               onChangeText={(text) => updateExercise(dayId, exercise.id, { public_note: text })} 
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
               onChangeText={(text) => updateExercise(dayId, exercise.id, { private_note: text })} 
             />
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0A0A0C', borderRadius: scale(16), padding: scale(14), marginBottom: verticalScale(12), borderWidth: 1, borderColor: '#1A1A20', marginHorizontal: scale(16) },
  activeCard: { borderColor: '#FF5100', backgroundColor: '#121214', transform: [{ scale: 1.02 }], shadowColor: '#FF5100', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 10, zIndex: 999 },
  
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(14) },
  dragHandle: { paddingRight: scale(10), paddingVertical: scale(2), justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1, paddingRight: scale(10) },
  title: { color: '#FFFFFF', fontSize: scale(15), fontWeight: '900', letterSpacing: 0.5, marginBottom: verticalScale(4) },
  
  badgeRow: { flexDirection: 'row', gap: scale(6), flexWrap: 'wrap' },
  badge: { backgroundColor: '#121214', paddingHorizontal: scale(8), paddingVertical: verticalScale(2), borderRadius: scale(6), borderWidth: 1, borderColor: '#1E1E24' },
  badgeText: { color: '#A0A0A5', fontSize: scale(10), fontWeight: '700', textTransform: 'uppercase' },
  
  deleteBtn: { padding: scale(6), backgroundColor: 'rgba(255, 59, 48, 0.05)', borderRadius: scale(10), borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.2)' },
  
  body: { flexDirection: 'row', gap: scale(12) },
  
  mediaColumn: { width: scale(95), height: verticalScale(120), borderRadius: scale(12), backgroundColor: '#121214', overflow: 'hidden', borderWidth: 1, borderColor: '#1E1E24', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 5 },
  editMediaBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(255, 81, 0, 0.9)', padding: 6, borderRadius: 12, zIndex: 10 },
  
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: scale(12) },
  noMediaText: { color: '#777', fontSize: scale(10), fontWeight: 'bold', textTransform: 'uppercase' },
  
  inputsColumn: { flex: 1, justifyContent: 'space-between' },
  inputRow: { flexDirection: 'row', gap: scale(8), marginBottom: verticalScale(8) },
  inputGroup: { flex: 1 },
  label: { color: '#888', fontSize: scale(10), marginBottom: verticalScale(4), fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#121214', borderWidth: 1, borderColor: '#1E1E24', borderRadius: scale(10), color: '#FFFFFF', fontSize: scale(14), paddingVertical: verticalScale(10), paddingHorizontal: scale(8), textAlign: 'center', fontWeight: 'bold' },
  
  expandButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(16), paddingTop: verticalScale(14), borderTopWidth: 1, borderTopColor: '#1A1A20' },
  expandButtonText: { color: '#FF5100', fontSize: scale(12), fontWeight: '900', marginRight: scale(6), letterSpacing: 0.5 },
  
  expandedArea: { marginTop: verticalScale(16), gap: verticalScale(16) },
  detailGroup: { flex: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(6), gap: scale(6) },
  detailLabel: { fontSize: scale(11), fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  textArea: { backgroundColor: '#050505', borderWidth: 1, borderRadius: scale(12), color: '#FFF', fontSize: scale(13), padding: scale(12), minHeight: verticalScale(70) }
});