import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { ExerciseService } from '../../services/ExerciseService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  initialData?: any;
}

const MATCH_COLORS = {
  primary: '#FF5100',
  primaryGlow: 'rgba(255, 81, 0, 0.15)',
  surfaceDark: '#050505',
  surfaceCard: '#0A0A0C', 
  borderLight: '#1A1A20',
  borderNeon: 'rgba(255, 81, 0, 0.4)',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
};

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
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          
          <View style={styles.container}>
            <View style={styles.dragIndicator} />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Estúdio de Criação</Text>
                  <Text style={styles.subtitle}>Adicione um exercício à sua biblioteca</Text>
                </View>
                <TouchableOpacity onPress={onClose} disabled={isSaving} style={styles.closeButton}>
                  <Feather name="x" size={22} color={MATCH_COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                
                <TouchableOpacity 
                  style={[styles.uploadBox, mediaUri ? styles.uploadBoxActive : null]} 
                  activeOpacity={0.8}
                  onPress={pickMedia}
                >
                  <View style={[styles.iconWrapper, mediaUri ? { backgroundColor: 'rgba(0, 230, 118, 0.15)' } : null]}>
                    <Feather name={mediaUri ? "video" : "upload-cloud"} size={28} color={mediaUri ? "#00E676" : MATCH_COLORS.primary} />
                  </View>
                  <View style={styles.uploadTextContainer}>
                    <Text style={[styles.uploadTitle, mediaUri ? { color: '#00E676' } : null]}>
                      {mediaUri ? 'Vídeo Carregado!' : 'Subir Vídeo de Execução'}
                    </Text>
                    <Text style={styles.uploadSubtitle}>
                      {mediaUri ? 'Toque novamente para trocar o arquivo' : 'Grave ou selecione na galeria (Opcional)'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOME DO EXERCÍCIO *</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="edit-2" size={18} color={MATCH_COLORS.primary} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Ex: Agachamento Búlgaro" 
                      placeholderTextColor={MATCH_COLORS.textDim} 
                      value={name} 
                      onChangeText={setName} 
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>GRUPO MUSCULAR *</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="arm-flex-outline" size={20} color={MATCH_COLORS.primary} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Ex: Pernas" 
                        placeholderTextColor={MATCH_COLORS.textDim} 
                        value={muscle} 
                        onChangeText={setMuscle} 
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>EQUIPAMENTO</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="dumbbell" size={20} color={MATCH_COLORS.primary} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Ex: Halteres" 
                        placeholderTextColor={MATCH_COLORS.textDim} 
                        value={equipment} 
                        onChangeText={setEquipment} 
                      />
                    </View>
                  </View>
                </View>

              </View>
            </ScrollView>
            
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.saveNeonButton, isSaving && { opacity: 0.6 }]} 
                onPress={handleSave} 
                disabled={isSaving} 
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color={MATCH_COLORS.primary} />
                ) : (
                  <>
                    <Feather name="check" size={22} color={MATCH_COLORS.primary} />
                    <Text style={styles.saveNeonText}>SALVAR EXERCÍCIO</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  
  container: { 
    backgroundColor: '#0A0A0C', 
    borderTopLeftRadius: moderateScale(28), 
    borderTopRightRadius: moderateScale(28), 
    borderTopWidth: 1,
    borderColor: '#1A1A20',
    maxHeight: '90%',
  },
  
  dragIndicator: {
    width: scale(40), height: scale(4),
    backgroundColor: '#333',
    borderRadius: scale(2),
    alignSelf: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },

  scrollContent: { padding: scale(24), paddingBottom: verticalScale(20) },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(30) },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5, marginBottom: scale(4) },
  subtitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(13), fontWeight: '500' },
  closeButton: { padding: scale(8), backgroundColor: '#121214', borderRadius: scale(12), borderWidth: 1, borderColor: '#1E1E24' },
  
  form: { gap: verticalScale(24) },
  
  uploadBox: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#121214', 
    borderWidth: 1, borderColor: '#1E1E24', borderStyle: 'dashed', 
    borderRadius: moderateScale(16), 
    padding: scale(20), gap: scale(16) 
  },
  uploadBoxActive: { backgroundColor: 'rgba(0, 230, 118, 0.05)', borderColor: 'rgba(0, 230, 118, 0.3)' },
  iconWrapper: { 
    width: scale(56), height: scale(56), 
    borderRadius: moderateScale(16), 
    backgroundColor: MATCH_COLORS.primaryGlow, 
    justifyContent: 'center', alignItems: 'center' 
  },
  uploadTextContainer: { flex: 1 },
  uploadTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(15), fontWeight: '800', marginBottom: verticalScale(4) },
  uploadSubtitle: { color: MATCH_COLORS.textDim, fontSize: moderateScale(12), fontWeight: '500', lineHeight: moderateScale(18) },

  inputGroup: { gap: verticalScale(8) },
  rowInputs: { flexDirection: 'row', gap: scale(16) },
  label: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(11), fontWeight: '900', letterSpacing: 1 },
  
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#121214', 
    borderWidth: 1, borderColor: '#1E1E24', 
    borderRadius: moderateScale(14), 
    paddingHorizontal: scale(14),
  },
  inputIcon: { marginRight: scale(10) },
  input: { flex: 1, color: MATCH_COLORS.text, fontSize: moderateScale(15), paddingVertical: verticalScale(14), fontWeight: '600' },
  
  footer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(24),
    borderTopWidth: 1,
    borderColor: '#1A1A20',
    backgroundColor: '#0A0A0C'
  },
  
  saveNeonButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(10, 10, 12, 0.85)', 
    borderWidth: 1.5, 
    borderColor: '#FF5100', 
    borderRadius: scale(20), 
    paddingVertical: verticalScale(16), 
    gap: scale(10),
    shadowColor: '#FF5100', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 10, 
    elevation: 8 
  },
  saveNeonText: { color: '#FF5100', fontSize: moderateScale(14), fontWeight: '900', letterSpacing: 1 },
});