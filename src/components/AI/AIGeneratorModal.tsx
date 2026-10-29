import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, 
  Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator, Alert, Image
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { scale, verticalScale, moderateScale } from '../../utils/responsive'; 

const MATCH_COLORS = {
  primary: '#FF5100',
  primaryDark: '#CC4100',
  primaryGlow: 'rgba(255, 81, 0, 0.2)',
  surface: '#0A0A0C', 
  surfaceDark: '#111111',
  border: '#1E1E24',
  borderLight: '#2A2A32',
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
  pdfBase64?: string;
  pdfName?: string;
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

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ visible, onClose, onGenerate, isLoading }) => {
  const [mode, setMode] = useState<'import' | 'manual'>('manual');

  const [nivel, setNivel] = useState('Iniciante');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [frequencia, setFrequencia] = useState(3);
  const [restricoes, setRestricoes] = useState('');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');

  const handleCloseModal = () => {
    setImageUri(null);
    setBase64Image(null);
    setPdfName(null);
    setPdfBase64(null);
    setRawText('');
    setRestricoes('');
    setMode('manual');
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
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setBase64Image(result.assets[0].base64 || null);
        setPdfName(null); 
        setPdfBase64(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
           Alert.alert("Arquivo muito grande", "Por favor, escolha um PDF de até 5MB.");
           return;
        }
        const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' });
        setPdfName(file.name);
        setPdfBase64(base64);
        setImageUri(null);
        setBase64Image(null);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o arquivo PDF.');
    }
  };

  const handleGenerate = () => {
    if (mode === 'import') {
      if (!base64Image && !pdfBase64 && !rawText.trim()) {
        Alert.alert("Atenção", "Tire uma foto, anexe um PDF ou cole um texto para a IA ler.");
        return;
      }
      onGenerate({ 
        isImport: true, 
        base64Image: base64Image || undefined, 
        pdfBase64: pdfBase64 || undefined,
        pdfName: pdfName || undefined,
        rawText: rawText.trim() 
      });
    } else {
      onGenerate({ isImport: false, nivel, objetivo, frequencia, restricoes });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleCloseModal}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 30 : 90} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.iconGlowBox}>
                  <MaterialCommunityIcons name="auto-fix" size={24} color={MATCH_COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.title}>Copiloto IA</Text>
                  <Text style={styles.subtitle}>Geração mágica de periodização</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn} disabled={isLoading}>
                <Feather name="x" size={24} color={MATCH_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* SEGMENTED CONTROL (TABS) */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={[styles.segmentBtn, mode === 'manual' && styles.segmentBtnActive]} 
                onPress={() => setMode('manual')}
              >
                <Feather name="sliders" size={16} color={mode === 'manual' ? MATCH_COLORS.text : MATCH_COLORS.textDim} />
                <Text style={[styles.segmentText, mode === 'manual' && styles.segmentTextActive]}>Criar do Zero</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.segmentBtn, mode === 'import' && styles.segmentBtnActive]} 
                onPress={() => setMode('import')}
              >
                <Feather name="file-text" size={16} color={mode === 'import' ? MATCH_COLORS.text : MATCH_COLORS.textDim} />
                <Text style={[styles.segmentText, mode === 'import' && styles.segmentTextActive]}>Ler Ficha</Text>
              </TouchableOpacity>
            </View>

            {/* CONTEÚDO */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {mode === 'import' ? (
                <View style={styles.importSection}>
                  <Text style={styles.description}>
                    Suba um PDF, tire foto do papel ou cole um texto. A IA estrutura a periodização automaticamente para você.
                  </Text>

                  {imageUri ? (
                    <View style={styles.previewBox}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeBtn} onPress={() => { setImageUri(null); setBase64Image(null); }}>
                        <Feather name="trash-2" size={16} color="#FFF" />
                        <Text style={styles.removeBtnText}>Descartar Foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : pdfName ? (
                    <View style={styles.previewBoxPdf}>
                      <FontAwesome5 name="file-pdf" size={40} color="#FF5100" />
                      <Text style={styles.pdfNameText} numberOfLines={1}>{pdfName}</Text>
                      <TouchableOpacity style={styles.removeBtn} onPress={() => { setPdfName(null); setPdfBase64(null); }}>
                        <Feather name="trash-2" size={16} color="#FFF" />
                        <Text style={styles.removeBtnText}>Descartar PDF</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadOptionsGrid}>
                      <TouchableOpacity style={styles.uploadSquare} onPress={() => handlePickImage(true)}>
                        <View style={styles.uploadIconCircle}><Ionicons name="camera" size={24} color={MATCH_COLORS.primary} /></View>
                        <Text style={styles.uploadSquareText}>Câmera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.uploadSquare} onPress={() => handlePickImage(false)}>
                        <View style={styles.uploadIconCircle}><Ionicons name="image" size={24} color={MATCH_COLORS.primary} /></View>
                        <Text style={styles.uploadSquareText}>Galeria</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.uploadSquare} onPress={handlePickDocument}>
                        <View style={styles.uploadIconCircle}><Ionicons name="document-text" size={24} color={MATCH_COLORS.primary} /></View>
                        <Text style={styles.uploadSquareText}>PDF</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OU COLE O TEXTO</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TextInput
                    style={[styles.textInputArea, { minHeight: verticalScale(120) }]}
                    placeholder="Ex: Treino A: Supino 3x12, Voador 4x10..."
                    placeholderTextColor={MATCH_COLORS.textDim}
                    multiline
                    value={rawText}
                    onChangeText={setRawText}
                    textAlignVertical="top"
                    editable={!imageUri && !pdfName} 
                  />
                  {(imageUri || pdfName) && <Text style={styles.hintText}>*Remova o arquivo para colar texto manual.</Text>}
                </View>
              ) : (
                <View>
                  <Text style={styles.description}>
                    Defina os parâmetros do aluno e deixe a IA estruturar as semanas, dias e exercícios com precisão.
                  </Text>

                  <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>NÍVEL DE EXPERIÊNCIA</Text>
                    <View style={styles.pillGroup}>
                      {NIVEIS.map(n => (
                        <TouchableOpacity key={n} style={[styles.pill, nivel === n && styles.pillActive]} onPress={() => setNivel(n)}>
                          <Text style={[styles.pillText, nivel === n && styles.pillTextActive]}>{n}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>OBJETIVO PRINCIPAL</Text>
                    <View style={styles.pillGroup}>
                      {OBJETIVOS.map(obj => (
                        <TouchableOpacity key={obj} style={[styles.pill, objetivo === obj && styles.pillActive]} onPress={() => setObjetivo(obj)}>
                          <Text style={[styles.pillText, objetivo === obj && styles.pillTextActive]}>{obj}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>DIAS DE TREINO POR SEMANA</Text>
                    <View style={styles.pillGroup}>
                      {FREQUENCIAS.map(freq => (
                        <TouchableOpacity key={freq} style={[styles.pill, frequencia === freq && styles.pillActive, { paddingHorizontal: 20 }]} onPress={() => setFrequencia(freq)}>
                          <Text style={[styles.pillText, frequencia === freq && styles.pillTextActive]}>{freq}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>FOCO ESPECÍFICO OU LESÕES (OPCIONAL)</Text>
                    <TextInput
                      style={styles.textInputArea}
                      placeholder="Ex: Condromalácia patelar, não pode forçar o joelho..."
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

            {/* BOTÃO NEON TRANSPARENTE */}
            <View style={styles.footer}>
              <TouchableOpacity 
                onPress={handleGenerate} 
                disabled={isLoading} 
                style={[styles.generateBtnNeon, isLoading && { opacity: 0.6 }]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={MATCH_COLORS.primary} />
                ) : null}
                <Text style={styles.generateBtnTextNeon}>
                  {isLoading ? "A IA ESTÁ TRABALHANDO..." : mode === 'import' ? "EXTRAIR E MONTAR FICHA" : "GERAR TREINO MÁGICO"}
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
  overlay: { flex: 1, justifyContent: 'flex-end' },
  container: { backgroundColor: MATCH_COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '90%', paddingTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  iconGlowBox: { backgroundColor: MATCH_COLORS.primaryGlow, padding: 12, borderRadius: 14, marginRight: 14 },
  title: { color: MATCH_COLORS.text, fontSize: moderateScale(20), fontWeight: '900', letterSpacing: 0.5 },
  subtitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(13), marginTop: 2 },
  closeBtn: { backgroundColor: MATCH_COLORS.border, padding: 8, borderRadius: 20 },
  
  segmentedControl: { flexDirection: 'row', marginHorizontal: 24, backgroundColor: MATCH_COLORS.surfaceDark, borderRadius: 16, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: MATCH_COLORS.border },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, gap: 8 },
  segmentBtnActive: { backgroundColor: MATCH_COLORS.borderLight },
  segmentText: { color: MATCH_COLORS.textDim, fontSize: moderateScale(14), fontWeight: 'bold' },
  segmentTextActive: { color: MATCH_COLORS.text },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  description: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(14), lineHeight: 22, marginBottom: 24 },
  
  fieldSection: { marginBottom: 26 },
  fieldLabel: { color: MATCH_COLORS.textDim, fontSize: moderateScale(11), fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, backgroundColor: MATCH_COLORS.surfaceDark, borderWidth: 1, borderColor: MATCH_COLORS.border },
  pillActive: { backgroundColor: MATCH_COLORS.primaryGlow, borderColor: MATCH_COLORS.primary },
  pillText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(14), fontWeight: '600' },
  pillTextActive: { color: MATCH_COLORS.primary, fontWeight: '900' },
  
  textInputArea: { backgroundColor: MATCH_COLORS.surfaceDark, borderWidth: 1, borderColor: MATCH_COLORS.border, borderRadius: 16, padding: 16, color: MATCH_COLORS.text, fontSize: moderateScale(14), minHeight: verticalScale(100) },
  hintText: { color: MATCH_COLORS.textDim, fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  
  importSection: { gap: 10 },
  uploadOptionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  uploadSquare: { flex: 1, backgroundColor: MATCH_COLORS.surfaceDark, borderWidth: 1, borderColor: MATCH_COLORS.border, borderRadius: 16, paddingVertical: 24, alignItems: 'center', gap: 10 },
  uploadIconCircle: { backgroundColor: MATCH_COLORS.border, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  uploadSquareText: { color: MATCH_COLORS.text, fontSize: moderateScale(13), fontWeight: 'bold' },
  
  previewBox: { backgroundColor: MATCH_COLORS.surfaceDark, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: MATCH_COLORS.border },
  imagePreview: { width: '100%', height: verticalScale(220), resizeMode: 'cover' },
  previewBoxPdf: { alignItems: 'center', backgroundColor: MATCH_COLORS.surfaceDark, padding: 30, borderRadius: 16, borderWidth: 1, borderColor: MATCH_COLORS.border },
  pdfNameText: { color: MATCH_COLORS.text, fontSize: moderateScale(15), fontWeight: 'bold', marginTop: 12, marginBottom: 20 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8, margin: 12 },
  removeBtnText: { color: '#FFF', fontWeight: '900', fontSize: moderateScale(14) },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: MATCH_COLORS.border },
  dividerText: { color: MATCH_COLORS.textDim, marginHorizontal: 14, fontSize: moderateScale(11), fontWeight: '900', letterSpacing: 1 },
  
  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, backgroundColor: MATCH_COLORS.surface, borderTopWidth: 1, borderTopColor: MATCH_COLORS.border },
  
  generateBtnNeon: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 18, 
    borderRadius: 16, 
    gap: 10,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: MATCH_COLORS.primary,
    shadowColor: MATCH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4
  },
  generateBtnTextNeon: { 
    color: MATCH_COLORS.primary, 
    fontSize: moderateScale(14), 
    fontWeight: '900', 
    letterSpacing: 0.5 
  }
});