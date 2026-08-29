import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { scale, verticalScale } from '../../utils/responsive';
import { ExerciseService } from '../../services/ExerciseService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export const CreateCustomExerciseModal = ({ visible, onClose, onSuccess }: Props) => {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Ops!', 'Precisamos de permissão para acessar suas fotos/vídeos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !muscle.trim()) {
      Alert.alert('Atenção', 'Nome e Grupo Muscular são obrigatórios.');
      return;
    }

    setIsSaving(true);
    let finalMediaUrl = '';

    try {
      if (mediaUri) {
        const uploadResult = await ExerciseService.uploadExerciseMedia(mediaUri, true);
        if (!uploadResult.success) throw new Error('Falha ao subir o vídeo. Tente novamente.');
        finalMediaUrl = uploadResult.url || ''; 
      }

      const result = await ExerciseService.createCustomExercise(name, muscle, equipment, finalMediaUrl);
      
      if (result.success) {
        setName(''); setMuscle(''); setEquipment(''); setMediaUri(null);
        onSuccess(); 
        onClose();
      } else {
        throw new Error(result.error || 'Não foi possível salvar o exercício.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Criar Novo Exercício</Text>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <Feather name="x" size={24} color="#A0A0A5" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>NOME DO EXERCÍCIO *</Text>
            <TextInput style={styles.input} placeholder="Ex: Agachamento Búlgaro" placeholderTextColor="#666" value={name} onChangeText={setName} />

            <Text style={styles.label}>GRUPO MUSCULAR *</Text>
            <TextInput style={styles.input} placeholder="Ex: Pernas" placeholderTextColor="#666" value={muscle} onChangeText={setMuscle} />

            <Text style={styles.label}>EQUIPAMENTO</Text>
            <TextInput style={styles.input} placeholder="Ex: Halteres, Peso Corporal..." placeholderTextColor="#666" value={equipment} onChangeText={setEquipment} />

            <Text style={styles.label}>VÍDEO / GIF DEMONSTRATIVO (Opcional)</Text>
            <TouchableOpacity 
              style={[styles.uploadBox, mediaUri ? styles.uploadBoxActive : null]} 
              activeOpacity={0.8}
              onPress={pickMedia}
            >
              <Feather name={mediaUri ? "check-circle" : "upload-cloud"} size={24} color={mediaUri ? "#4CAF50" : "#FF5100"} />
              <Text style={[styles.uploadText, mediaUri ? { color: '#4CAF50' } : null]}>
                {mediaUri ? 'Vídeo Selecionado! Clique para trocar' : 'Clique para subir um vídeo da sua galeria'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Salvar na Minha Biblioteca</Text>}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#1E1E24', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(20), paddingBottom: verticalScale(40) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(20) },
  title: { color: '#FFF', fontSize: scale(18), fontWeight: 'bold' },
  form: { gap: verticalScale(16), marginBottom: verticalScale(24) },
  label: { color: '#A0A0A5', fontSize: scale(11), fontWeight: 'bold' },
  input: { backgroundColor: '#121214', borderWidth: 1, borderColor: '#2A2A32', borderRadius: scale(12), color: '#FFF', padding: scale(14), fontSize: scale(14) },
  saveButton: { backgroundColor: '#FF5100', borderRadius: scale(12), padding: scale(16), alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: scale(15), fontWeight: 'bold' },
  uploadBox: { backgroundColor: 'rgba(255, 81, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 81, 0, 0.3)', borderStyle: 'dashed', borderRadius: scale(12), padding: scale(16), alignItems: 'center', justifyContent: 'center', gap: verticalScale(8) },
  uploadBoxActive: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderColor: 'rgba(76, 175, 80, 0.3)' },
  uploadText: { color: '#FF5100', fontSize: scale(12), fontWeight: 'bold', textAlign: 'center' }
});