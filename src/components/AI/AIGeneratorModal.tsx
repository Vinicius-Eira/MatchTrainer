import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { scale, verticalScale, moderateScale } from '../../utils/responsive'; 

const MATCH_COLORS = {
  primary: '#FF5100',
  primaryGlow: 'rgba(255, 81, 0, 0.15)',
  surface: '#161619',
  surfaceDark: '#0D0D0F',
  border: '#2A2A32',
  borderLight: '#3A3A42',
  text: '#FFFFFF',
  textMuted: '#A0A0A5',
  textDim: '#555555'
};

export interface AITrainingParams {
  isImport: boolean; 
  nivel?: string;
  objetivo?: string;
  frequencia?: number;
  restricoes?: string;
  base64Image?: string; 
  rawText?: string;     
}

interface AIGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (params: AITrainingParams) => void;
  isLoading: boolean;
}

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const OBJETIVOS = ['Hipertrofia', 'Emagrecimento', 'Força', 'Condicionamento'];
const FREQUENCIAS = [2, 3, 4, 5, 6];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ 
  visible, 
  onClose, 
  onGenerate, 
  isLoading 
}) => {
  const [mode, setMode] = useState<'import' | 'manual'>('import');

  const [nivel, setNivel] = useState('Iniciante');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [frequencia, setFrequencia] = useState(3);
  const [restricoes, setRestricoes] = useState('');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');

  const handleCloseModal = () => {
    setImageUri(null);
    setBase64Image(null);
    setRawText('');
    setRestricoes('');
    
    setMode('import');
    setNivel('Iniciante');
    setObjetivo('Hipertrofia');
    setFrequencia(3);

    onClose();
  };

  const handlePickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6, 
        base64: true, 
      };

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para ler a ficha.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para buscar a ficha.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setBase64Image(result.assets[0].base64 || null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
    }
  };

  const handleGenerate = () => {
    if (mode === 'import') {
      if (!base64Image && !rawText.trim()) {
        Alert.alert("Atenção", "Tire uma foto, escolha da galeria ou cole um texto para a IA ler.");
        return;
      }
      onGenerate({ 
        isImport: true, 
        base64Image: base64Image || undefined, 
        rawText: rawText.trim() 
      });
    } else {
      onGenerate({ 
        isImport: false, 
        nivel, 
        objetivo, 
        frequencia, 
        restricoes 
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 20 : 90} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.iconGlowBox}>
                  <MaterialCommunityIcons name="auto-fix" size={22} color={MATCH_COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.title}>Copiloto IA</Text>
                  <Text style={styles.subtitle}>Geração inteligente de treino</Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn} disabled={isLoading}>
                <Feather name="x" size={24} color={MATCH_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, mode === 'import' && styles.tabButtonActive]} 
                onPress={() => setMode('import')}
              >
                <Feather name="camera" size={16} color={mode === 'import' ? MATCH_COLORS.primary : MATCH_COLORS.textMuted} />
                <Text style={[styles.tabText, mode === 'import' && styles.tabTextActive]}>Ler Ficha</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tabButton, mode === 'manual' && styles.tabButtonActive]} 
                onPress={() => setMode('manual')}
              >
                <Feather name="sliders" size={16} color={mode === 'manual' ? MATCH_COLORS.primary : MATCH_COLORS.textMuted} />
                <Text style={[styles.tabText, mode === 'manual' && styles.tabTextActive]}>Criar do Zero</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {mode === 'import' ? (
                <View style={styles.importSection}>
                  <Text style={styles.description}>
                    Tire uma foto do papel, suba um print da planilha ou cole um texto. A IA vai ler e transformar tudo numa ficha estruturada do Match Trainer.
                  </Text>

                  {imageUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setBase64Image(null); }}>
                        <Feather name="trash-2" size={16} color="#FFF" />
                        <Text style={styles.removeImageText}>Remover Foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadRow}>
                      <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImage(true)}>
                        <Ionicons name="camera" size={32} color={MATCH_COLORS.primary} />
                        <Text style={styles.uploadBtnText}>Tirar Foto</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.uploadBtn} onPress={() => handlePickImage(false)}>
                        <Ionicons name="image" size={32} color={MATCH_COLORS.primary} />
                        <Text style={styles.uploadBtnText}>Galeria</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.dividerBox}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OU</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Text style={styles.sectionTitle}>Colar Treino em Texto</Text>
                  <TextInput
                    style={[styles.input, { minHeight: verticalScale(140) }]}
                    placeholder="Ex: Treino A: Supino 3x12, Voador 4x10..."
                    placeholderTextColor={MATCH_COLORS.textDim}
                    multiline
                    value={rawText}
                    onChangeText={setRawText}
                    textAlignVertical="top"
                    editable={!imageUri} 
                  />
                  {imageUri && <Text style={{ color: MATCH_COLORS.textDim, fontSize: 10, marginTop: 4 }}>*Remova a foto para usar o modo texto.</Text>}
                </View>
              ) : (
                <View>
                  <Text style={styles.description}>
                    Defina os parâmetros do aluno e deixe a inteligência artificial do MatchTrainer estruturar a base perfeita.
                  </Text>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nível de Experiência</Text>
                    <View style={styles.pillContainer}>
                      {NIVEIS.map(n => (
                        <TouchableOpacity 
                          key={n} 
                          style={[styles.pill, nivel === n && styles.pillActive]}
                          onPress={() => setNivel(n)}
                        >
                          <Text style={[styles.pillText, nivel === n && styles.pillTextActive]}>{n}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Objetivo Principal</Text>
                    <View style={styles.pillContainer}>
                      {OBJETIVOS.map(obj => (
                        <TouchableOpacity 
                          key={obj} 
                          style={[styles.pill, objetivo === obj && styles.pillActive]}
                          onPress={() => setObjetivo(obj)}
                        >
                          <Text style={[styles.pillText, objetivo === obj && styles.pillTextActive]}>{obj}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dias por Semana</Text>
                    <View style={styles.pillContainer}>
                      {FREQUENCIAS.map(freq => (
                        <TouchableOpacity 
                          key={freq} 
                          style={[styles.pill, frequencia === freq && styles.pillActive, { minWidth: scale(45) }]}
                          onPress={() => setFrequencia(freq)}
                        >
                          <Text style={[styles.pillText, frequencia === freq && styles.pillTextActive]}>{freq}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Foco Específico ou Lesões (Opcional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Dor no joelho direito, focar em ombros..."
                      placeholderTextColor={MATCH_COLORS.textDim}
                      multiline
                      value={restricoes}
                      onChangeText={setRestricoes}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}

            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]} 
                onPress={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#000" />
                )}
                <Text style={styles.generateBtnText}>
                  {isLoading ? "A IA ESTÁ PENSANDO..." : mode === 'import' ? "EXTRAIR E MONTAR FICHA" : "GERAR TREINO MÁGICO"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: MATCH_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconGlowBox: {
    backgroundColor: MATCH_COLORS.primaryGlow,
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  title: {
    color: MATCH_COLORS.text,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  subtitle: {
    color: MATCH_COLORS.textMuted,
    fontSize: moderateScale(12),
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: MATCH_COLORS.border,
  },
  tabText: {
    color: MATCH_COLORS.textMuted,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  tabTextActive: {
    color: MATCH_COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  importSection: {
    gap: 16,
  },
  description: {
    color: MATCH_COLORS.textMuted,
    fontSize: moderateScale(14),
    lineHeight: 20,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  imagePreview: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  removeImageText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: MATCH_COLORS.border,
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  uploadBtnText: {
    color: MATCH_COLORS.text,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MATCH_COLORS.borderLight,
  },
  dividerText: {
    color: MATCH_COLORS.textDim,
    marginHorizontal: 10,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: MATCH_COLORS.text,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
    borderRadius: 12,
    padding: 16,
    color: MATCH_COLORS.text,
    fontSize: moderateScale(14),
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight,
  },
  pillActive: {
    backgroundColor: MATCH_COLORS.primaryGlow,
    borderColor: MATCH_COLORS.primary,
  },
  pillText: {
    color: MATCH_COLORS.textMuted,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  pillTextActive: {
    color: MATCH_COLORS.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: MATCH_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MATCH_COLORS.border,
  },
  generateBtn: {
    backgroundColor: MATCH_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#000',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  }
});