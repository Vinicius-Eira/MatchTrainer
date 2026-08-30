import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
  surfaceDark: '#09090B',
  surfaceCard: 'rgba(24, 24, 27, 0.8)', 
  borderLight: 'rgba(255, 255, 255, 0.08)',
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
          
          <BlurView intensity={Platform.OS === "ios" ? 40 : 100} tint="dark" style={styles.container}>
            <View style={styles.dragIndicator} />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Estúdio de Criação</Text>
                  <Text style={styles.subtitle}>Adicione um exercício à sua biblioteca pessoal</Text>
                </View>
                <TouchableOpacity onPress={onClose} disabled={isSaving} style={styles.closeButton}>
                  <Feather name="x" size={20} color={MATCH_COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                
                {/* Upload Box Premium */}
                <TouchableOpacity 
                  style={[styles.uploadBox, mediaUri ? styles.uploadBoxActive : null]} 
                  activeOpacity={0.8}
                  onPress={pickMedia}
                >
                  <View style={[styles.iconWrapper, mediaUri ? { backgroundColor: 'rgba(76, 175, 80, 0.15)' } : null]}>
                    <Feather name={mediaUri ? "video" : "upload-cloud"} size={28} color={mediaUri ? "#4CAF50" : MATCH_COLORS.primary} />
                  </View>
                  <View style={styles.uploadTextContainer}>
                    <Text style={[styles.uploadTitle, mediaUri ? { color: '#4CAF50' } : null]}>
                      {mediaUri ? 'Vídeo Carregado!' : 'Subir Vídeo de Execução'}
                    </Text>
                    <Text style={styles.uploadSubtitle}>
                      {mediaUri ? 'Toque novamente para trocar o arquivo' : 'Grave ou selecione na galeria (Opcional)'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOME DO EXERCÍCIO *</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="edit-2" size={16} color={MATCH_COLORS.textDim} style={styles.inputIcon} />
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
                      <MaterialCommunityIcons name="arm-flex-outline" size={18} color={MATCH_COLORS.textDim} style={styles.inputIcon} />
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
                      <MaterialCommunityIcons name="dumbbell" size={18} color={MATCH_COLORS.textDim} style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Ex: Halteres..." 
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
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
                <LinearGradient
                  colors={isSaving ? [MATCH_COLORS.borderLight, MATCH_COLORS.borderLight] : [MATCH_COLORS.primary, '#CC4100']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator color={MATCH_COLORS.textMuted} />
                  ) : (
                    <>
                      <Feather name="check" size={22} color="#000" />
                      <Text style={styles.saveButtonText}>SALVAR NA BIBLIOTECA</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  
  container: { 
    backgroundColor: 'rgba(14, 14, 17, 0.95)', 
    borderTopLeftRadius: moderateScale(28), 
    borderTopRightRadius: moderateScale(28), 
    borderTopWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
    maxHeight: '90%',
  },
  
  dragIndicator: {
    width: scale(40), height: scale(4),
    backgroundColor: MATCH_COLORS.borderLight,
    borderRadius: scale(2),
    alignSelf: 'center',
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
  },

  scrollContent: { padding: scale(24), paddingBottom: verticalScale(20) },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(30) },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(22), fontWeight: '900', letterSpacing: 0.5, marginBottom: scale(4) },
  subtitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(13), fontWeight: '500' },
  closeButton: { padding: scale(6), backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: scale(12) },
  
  form: { gap: verticalScale(24) },
  
  uploadBox: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight, borderStyle: 'dashed', 
    borderRadius: moderateScale(16), 
    padding: scale(20), gap: scale(16) 
  },
  uploadBoxActive: { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderColor: 'rgba(76, 175, 80, 0.3)' },
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
  label: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(11), fontWeight: '800', letterSpacing: 1 },
  
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderWidth: 1, borderColor: MATCH_COLORS.borderLight, 
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
    borderColor: MATCH_COLORS.borderLight,
    backgroundColor: 'rgba(9, 9, 11, 0.95)'
  },
  saveButton: { borderRadius: moderateScale(16), overflow: 'hidden' },
  saveGradient: { flexDirection: 'row', height: verticalScale(56), justifyContent: 'center', alignItems: 'center', gap: scale(8) },
  saveButtonText: { color: '#000', fontSize: moderateScale(14), fontWeight: '900', letterSpacing: 1 },
});