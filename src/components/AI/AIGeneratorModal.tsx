import React, { useState, useEffect } from 'react';
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
  isImport: boolean; // Diz para a IA qual modo estamos usando
  nivel?: string;
  objetivo?: string;
  frequencia?: number;
  restricoes?: string;
  base64Image?: string; // Imagem em formato texto para o Gemini ler
  rawText?: string;     // Texto colado da planilha
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

  // Estados do Modo Manual
  const [nivel, setNivel] = useState('Iniciante');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [frequencia, setFrequencia] = useState(3);
  const [restricoes, setRestricoes] = useState('');

  // Estados do Modo Importação
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');

  // Limpar os dados sempre que abrir o modal
  useEffect(() => {
    if (visible) {
      setImageUri(null);
      setBase64Image(null);
      setRawText('');
      setRestricoes('');
    }
  }, [visible]);

  const handlePickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6, // Reduz um pouco a qualidade para a API do Gemini processar mais rápido
        base64: true, // Já converte a imagem em base64 nativamente!
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
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 20 : 90} tint="dark" style={StyleSheet.absoluteFillObject} />
          
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
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={isLoading}>
                <Feather name="x" size={24} color={MATCH_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* ABAS (TABS) DE SELEÇÃO */}
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
                // MODO: IMPORTAR FICHA (FOTO OU TEXTO)
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
                    editable={!imageUri} // Se tiver foto, bloqueia o texto para não confundir a IA
                  />
                  {imageUri && <Text style={{ color: MATCH_COLORS.textDim, fontSize: 10, marginTop: 4 }}>*Remova a foto para usar o modo texto.</Text>}
                </View>
              ) : (
                // MODO: CRIAR DO ZERO (MANUAL)
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
    backgroundColor: 'rgba(0,0,0,0.7)' 
  },
  container: { 
    backgroundColor: MATCH_COLORS.surface, 
    borderTopLeftRadius: moderateScale(28), 
    borderTopRightRadius: moderateScale(28), 
    maxHeight: '94%', 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.border,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: scale(24), 
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16)
  },
  headerTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: scale(12) 
  },
  iconGlowBox: {
    backgroundColor: MATCH_COLORS.primaryGlow,
    padding: scale(8),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 81, 0, 0.3)'
  },
  title: { 
    color: MATCH_COLORS.text, 
    fontSize: moderateScale(18), 
    fontWeight: '900',
    letterSpacing: 0.5
  },
  subtitle: {
    color: MATCH_COLORS.primary,
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: verticalScale(2)
  },
  closeBtn: { 
    padding: scale(6),
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderRadius: scale(12)
  },

  // ESTILOS DAS ABAS (TABS)
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: scale(24),
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderRadius: moderateScale(12),
    padding: scale(4),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: MATCH_COLORS.border
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    gap: scale(8)
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: MATCH_COLORS.borderLight
  },
  tabText: {
    color: MATCH_COLORS.textMuted,
    fontSize: moderateScale(13),
    fontWeight: '700'
  },
  tabTextActive: {
    color: MATCH_COLORS.primary,
    fontWeight: '900'
  },

  scrollContent: { 
    padding: scale(24), 
    paddingBottom: verticalScale(40) 
  },
  description: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(13), 
    lineHeight: moderateScale(20), 
    marginBottom: verticalScale(24) 
  },
  
  // ESTILOS DE IMPORTAÇÃO (FOTO/TEXTO)
  importSection: {
    paddingBottom: verticalScale(10)
  },
  uploadRow: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(20)
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: MATCH_COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: MATCH_COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8)
  },
  uploadBtnText: {
    color: MATCH_COLORS.text,
    fontSize: moderateScale(13),
    fontWeight: '700'
  },
  imagePreviewContainer: {
    width: '100%',
    height: verticalScale(160),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: MATCH_COLORS.border
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    bottom: scale(10),
    right: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    gap: scale(6)
  },
  removeImageText: {
    color: '#FFF',
    fontSize: moderateScale(11),
    fontWeight: '700'
  },

  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20)
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MATCH_COLORS.borderLight
  },
  dividerText: {
    color: MATCH_COLORS.textDim,
    paddingHorizontal: scale(12),
    fontSize: moderateScale(12),
    fontWeight: '800'
  },

  // ESTILOS DO MODO MANUAL
  section: {
    marginBottom: verticalScale(28)
  },
  sectionTitle: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(11), 
    fontWeight: '800', 
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(12) 
  },
  pillContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: scale(10) 
  },
  pill: { 
    paddingHorizontal: scale(18), 
    paddingVertical: verticalScale(12), 
    borderRadius: moderateScale(24), 
    backgroundColor: MATCH_COLORS.surfaceDark, 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.border 
  },
  pillActive: { 
    backgroundColor: MATCH_COLORS.primaryGlow, 
    borderColor: MATCH_COLORS.primary,
    shadowColor: MATCH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  pillText: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(13), 
    fontWeight: '600' 
  },
  pillTextActive: { 
    color: MATCH_COLORS.primary, 
    fontWeight: '900' 
  },
  input: { 
    backgroundColor: MATCH_COLORS.surfaceDark, 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.border, 
    borderRadius: moderateScale(16), 
    color: MATCH_COLORS.text, 
    fontSize: moderateScale(14), 
    padding: scale(16), 
    minHeight: verticalScale(110) 
  },

  footer: { 
    paddingHorizontal: scale(24), 
    paddingVertical: verticalScale(20),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(34) : verticalScale(20),
    borderTopWidth: 1, 
    borderTopColor: MATCH_COLORS.border, 
    backgroundColor: MATCH_COLORS.surface 
  },
  generateBtn: { 
    flexDirection: 'row', 
    backgroundColor: MATCH_COLORS.primary, 
    height: verticalScale(56), 
    borderRadius: moderateScale(16), 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: scale(8), 
    shadowColor: MATCH_COLORS.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 12, 
    elevation: 8 
  },
  generateBtnDisabled: { 
    opacity: 0.7,
    backgroundColor: 'rgba(255, 81, 0, 0.7)'
  },
  generateBtnText: { 
    color: '#000', 
    fontSize: moderateScale(14), 
    fontWeight: '900', 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});