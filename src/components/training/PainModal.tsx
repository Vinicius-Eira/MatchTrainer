import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; 
import { moderateScale, scale, verticalScale } from '../../utils/responsive'; 

export function PainModal({ isVisible, onClose, session_id, session_exercise_id, exercicioNome, onSaveSuccess }: any) {
  const [intensidade, setIntensidade] = useState<number | null>(null);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false); 

  const handleSave = async () => {
    if (intensidade === null) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('treinos_execucoes_dores')
        .insert([{
          treino_id: session_id,
          exercicio_id: session_exercise_id,
          aluno_id: user?.id,
          intensidade: intensidade,
          descricao: descricao
        }]);

      if (error) throw error;

      setSucesso(true);
      onSaveSuccess();
      
      setTimeout(() => {
          fecharELimpar();
      }, 2200);

    } catch (err) {
      console.error("Erro ao relatar dor:", err);
      alert("Houve um problema de conexão. Tente enviar novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fecharELimpar = () => {
    if (!loading) {
        setIntensidade(null);
        setDescricao('');
        setSucesso(false);
        onClose();
    }
  };

  const getPainColor = (num: number) => {
    if (num <= 3) return "#4ADE80"; 
    if (num <= 6) return "#FFB020"; 
    return "#EF4444";               
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={fecharELimpar}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        
        <View style={styles.modalContainer}>
          
          {sucesso ? (
            <View style={styles.sucessoContainer}>
                <View style={styles.sucessoCircle}>
                    <Ionicons name="checkmark-sharp" size={48} color="#00E676" />
                </View>
                <Text style={styles.sucessoTitle}>Relato Enviado!</Text>
                <Text style={styles.sucessoSub}>O seu personal será notificado para ajustar seus treinos e priorizar sua segurança.</Text>
            </View>
          ) : (
            
            <>
              <View style={styles.header}>
                <View style={styles.headerIconBox}>
                    <Ionicons name="warning" size={24} color="#EF4444" />
                </View>
                <View style={{ flex: 1, paddingRight: scale(12) }}>
                    <Text style={styles.title}>Relatar Desconforto</Text>
                    <Text style={styles.subtitle}>O seu personal será notificado para avaliar a sua execução e preservar sua saúde.</Text>
                </View>
                <TouchableOpacity onPress={fecharELimpar} style={styles.closeBtn} disabled={loading} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                <View style={styles.exerciseBox}>
                    <Text style={styles.exerciseLabel}>EXERCÍCIO ATUAL</Text>
                    <Text style={styles.exerciseText}>{exercicioNome || "Exercício Selecionado"}</Text>
                </View>

                <Text style={styles.sectionTitle}>Nível da Dor</Text>
                <View style={styles.scaleContainer}>
                    {[0,1,2,3,4,5,6,7,8,9,10].map((num) => {
                        const baseColor = getPainColor(num);
                        const isSelected = intensidade === num;

                        return (
                            <TouchableOpacity 
                                key={num} 
                                style={[
                                    styles.scaleItem, 
                                    { backgroundColor: isSelected ? baseColor : "#222" },
                                    isSelected && { borderColor: baseColor, shadowColor: baseColor, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 }
                                ]}
                                onPress={() => setIntensidade(num)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.scaleText, { color: isSelected ? "#000" : "#AAA", fontWeight: isSelected ? "900" : "bold" }]}>
                                    {num}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={styles.scaleLabels}>
                    <Text style={styles.scaleLabelText}>0 - Nenhuma dor</Text>
                    <Text style={styles.scaleLabelText}>10 - Dor extrema</Text>
                </View>

                <Text style={styles.sectionTitle}>Detalhes do ocorrido (Opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Senti uma fisgada no ombro..."
                  placeholderTextColor="#666"
                  value={descricao}
                  onChangeText={setDescricao}
                  multiline
                  textAlignVertical="top"
                />

              </ScrollView>

              <View style={styles.footerActions}>
                  <TouchableOpacity style={styles.btnCancel} onPress={fecharELimpar} disabled={loading}>
                      <Text style={styles.btnCancelText}>CANCELAR</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.btnSave, intensidade === null && { opacity: 0.5, backgroundColor: '#333', shadowOpacity: 0 }]} 
                    onPress={handleSave} 
                    disabled={intensidade === null || loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>ENVIAR RELATO</Text>}
                  </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: { 
      backgroundColor: '#111', 
      borderTopLeftRadius: moderateScale(28), 
      borderTopRightRadius: moderateScale(28), 
      padding: scale(24), 
      maxHeight: '90%', 
      minHeight: '40%',
      borderWidth: 1, 
      borderColor: '#222' 
  },
  
  sucessoContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: verticalScale(40), paddingHorizontal: scale(20) },
  sucessoCircle: { width: scale(80), height: scale(80), borderRadius: 40, backgroundColor: "rgba(0,230,118,0.1)", justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20), borderWidth: 2, borderColor: "#00E676", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  sucessoTitle: { color: "#00E676", fontSize: moderateScale(22), fontWeight: "900", letterSpacing: 0.5, marginBottom: verticalScale(10) },
  sucessoSub: { color: "#AAA", fontSize: moderateScale(14), textAlign: "center", lineHeight: 22 },
  
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: verticalScale(20) },
  headerIconBox: { width: scale(40), height: scale(40), borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
  title: { color: '#FFF', fontSize: moderateScale(16), fontWeight: '900', letterSpacing: 0.5, marginBottom: verticalScale(2) },
  subtitle: { color: '#888', fontSize: moderateScale(12), lineHeight: moderateScale(16) },
  closeBtn: { padding: scale(6), backgroundColor: '#1A1A1A', borderRadius: 20 },
  
  scrollContent: { paddingBottom: verticalScale(10) },
  exerciseBox: { backgroundColor: "#1A1A1A", padding: scale(14), borderRadius: moderateScale(14), marginBottom: verticalScale(24) },
  exerciseLabel: { color: "#FF6B00", fontSize: moderateScale(10), fontWeight: "900", textTransform: "uppercase", marginBottom: verticalScale(4), letterSpacing: 1 },
  exerciseText: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" },
  
  sectionTitle: { color: '#FFF', fontSize: moderateScale(13), fontWeight: '900', textTransform: "uppercase", letterSpacing: 0.5, marginBottom: verticalScale(12) },
  scaleContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: scale(4), marginBottom: verticalScale(8) },
  scaleItem: { width: '16%', aspectRatio: 1, borderRadius: moderateScale(12), justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent', marginBottom: verticalScale(8) },
  scaleText: { fontSize: moderateScale(14) },
  
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(24) },
  scaleLabelText: { color: '#666', fontSize: moderateScale(10), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  input: { backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: moderateScale(14), padding: scale(16), height: verticalScale(110), marginBottom: verticalScale(10), fontSize: moderateScale(14) },
  
  footerActions: { flexDirection: "row", gap: scale(12), borderTopWidth: 1, borderTopColor: "#222", paddingTop: verticalScale(20) },
  btnCancel: { flex: 1, paddingVertical: verticalScale(16), borderRadius: moderateScale(16), alignItems: 'center', backgroundColor: '#1A1A1A' },
  btnCancelText: { color: '#888', fontWeight: '900', fontSize: moderateScale(12), letterSpacing: 1 },
  
  btnSave: { flex: 1.5, backgroundColor: '#FF6B00', paddingVertical: verticalScale(16), borderRadius: moderateScale(16), alignItems: 'center', shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  btnSaveText: { color: '#000', fontWeight: '900', fontSize: moderateScale(13), letterSpacing: 1 }
});