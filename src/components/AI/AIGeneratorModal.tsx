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
  ActivityIndicator
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
  nivel: string;
  objetivo: string;
  frequencia: number;
  restricoes: string;
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
  const [nivel, setNivel] = useState('Iniciante');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [frequencia, setFrequencia] = useState(3);
  const [restricoes, setRestricoes] = useState('');

  const handleGenerate = () => {
    onGenerate({ nivel, objetivo, frequencia, restricoes });
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                  placeholder="Ex: Dor no joelho direito, focar em ombros, não usar barra livre..."
                  placeholderTextColor={MATCH_COLORS.textDim}
                  multiline
                  value={restricoes}
                  onChangeText={setRestricoes}
                  textAlignVertical="top"
                />
              </View>
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
                  {isLoading ? "PROCESSANDO IA..." : "GERAR TREINO MÁGICO"}
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
    maxHeight: '92%', 
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
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1, 
    borderBottomColor: MATCH_COLORS.border 
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
  scrollContent: { 
    padding: scale(24), 
    paddingBottom: verticalScale(40) 
  },
  description: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(14), 
    lineHeight: moderateScale(22), 
    marginBottom: verticalScale(28) 
  },
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
    fontSize: moderateScale(15), 
    fontWeight: '900', 
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});