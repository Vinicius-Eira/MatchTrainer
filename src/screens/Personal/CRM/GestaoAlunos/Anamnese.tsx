import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../../services/supabase";
import { theme } from "../../../../theme/theme"; 

export default function AnamneseBuilder({ navigation }: any) {
  const [title, setTitle] = useState("Questionário Inicial VIP");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("texto"); 
  const [newQuestionOptions, setNewQuestionOptions] = useState(""); 
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    carregarTemplate();
  }, []);

  const carregarTemplate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("anamnesis_templates")
        .select("*")
        .eq("personal_id", session.user.id)
        .single();

      if (data) {
        setTemplateId(data.id);
        setTitle(data.title);
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.log("Nenhum template encontrado, criará um novo.");
    }
  };

  const handleAddQuestion = () => {
    if (newQuestionText.trim() === "") {
      Alert.alert("Atenção", "Digite a pergunta antes de adicionar.");
      return;
    }

    const newQ = {
      id: Date.now().toString(),
      pergunta: newQuestionText,
      tipo: newQuestionType,
      obrigatorio: isRequired,
      opcoes: newQuestionType === "multipla" ? newQuestionOptions.split(",").map(o => o.trim()) : [],
    };

    setQuestions([...questions, newQ]);
    
    setNewQuestionText("");
    setNewQuestionType("texto");
    setNewQuestionOptions("");
    setIsRequired(true);
    setModalVisible(false);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const salvarTemplate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (templateId) {
        await supabase
          .from("anamnesis_templates")
          .update({ title, questions })
          .eq("id", templateId);
      } else {
        const { data } = await supabase
          .from("anamnesis_templates")
          .insert([{ personal_id: session.user.id, title, questions }])
          .select()
          .single();
        if (data) setTemplateId(data.id);
      }

      Alert.alert("Sucesso!", "Questionário atualizado e pronto para ser enviado aos alunos.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar o modelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Construtor de Anamnese</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.sectionLabel}>Nome do Formulário</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Avaliação Inicial"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.subtitleDesc}>Este será o formulário que novos alunos precisarão preencher ao entrar na sua consultoria.</Text>
        </View>

        <View style={styles.questionsHeader}>
          <Text style={styles.sectionLabel}>Perguntas ({questions.length})</Text>
        </View>

        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={theme.colors.borderLight} />
            <Text style={styles.emptyStateTitle}>Nenhuma pergunta criada</Text>
            <Text style={styles.emptyStateDesc}>Monte seu questionário para que a IA e você entendam as restrições do seu aluno.</Text>
          </View>
        ) : (
          questions.map((q, index) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionTypePill}>
                  <Text style={styles.questionTypeText}>
                    {q.tipo === "texto" ? "Texto Livre" : q.tipo === "booleano" ? "Sim / Não" : "Múltipla Escolha"}
                  </Text>
                </View>
                {q.obrigatorio && <Text style={styles.requiredTag}>* Obrigatório</Text>}
              </View>
              
              <Text style={styles.questionText}>{index + 1}. {q.pergunta}</Text>
              
              {q.tipo === "multipla" && q.opcoes && (
                <View style={styles.optionsPreviewRow}>
                  {q.opcoes.map((op: string, idx: number) => (
                    <View key={idx} style={styles.optionPill}><Text style={styles.optionPillText}>{op}</Text></View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.deleteBtn} onPress={() => removeQuestion(q.id)}>
                <Feather name="trash-2" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Área de Botões Fixos Embaixo */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnAddQuestion} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={20} color={theme.colors.primary} />
          <Text style={styles.btnAddQuestionText}>Nova Pergunta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSave} onPress={salvarTemplate} disabled={loading}>
          <LinearGradient colors={["#00E676", "#00B259"]} style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]} />
          <Text style={styles.btnSaveText}>{loading ? "Salvando..." : "Salvar Molde"}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CRIAR PERGUNTA COM CORREÇÃO DE TECLADO */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Pergunta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* ScrollView interno para rolar as opções se o teclado estiver aberto */}
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.inputLabel}>Escreva a pergunta</Text>
              <TextInput
                style={styles.modalInput}
                value={newQuestionText}
                onChangeText={setNewQuestionText}
                placeholder="Ex: Você possui alguma lesão crônica?"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.inputLabel}>Tipo de Resposta</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity style={[styles.typeBtn, newQuestionType === "texto" && styles.typeBtnActive]} onPress={() => setNewQuestionType("texto")}>
                  <Text style={[styles.typeBtnText, newQuestionType === "texto" && styles.typeBtnTextActive]}>Texto Livre</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, newQuestionType === "booleano" && styles.typeBtnActive]} onPress={() => setNewQuestionType("booleano")}>
                  <Text style={[styles.typeBtnText, newQuestionType === "booleano" && styles.typeBtnTextActive]}>Sim / Não</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, newQuestionType === "multipla" && styles.typeBtnActive]} onPress={() => setNewQuestionType("multipla")}>
                  <Text style={[styles.typeBtnText, newQuestionType === "multipla" && styles.typeBtnTextActive]}>Opções</Text>
                </TouchableOpacity>
              </View>

              {newQuestionType === "multipla" && (
                <View style={{ marginTop: 15 }}>
                  <Text style={styles.inputLabel}>Opções (separe por vírgula)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newQuestionOptions}
                    onChangeText={setNewQuestionOptions}
                    placeholder="Ex: Iniciante, Intermediário, Avançado"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Resposta Obrigatória?</Text>
                <TouchableOpacity style={[styles.checkbox, isRequired && styles.checkboxActive]} onPress={() => setIsRequired(!isRequired)}>
                  {isRequired && <Feather name="check" size={14} color="#000" />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnConfirmAdd} onPress={handleAddQuestion}>
                <Text style={styles.btnConfirmAddText}>Adicionar ao Formulário</Text>
              </TouchableOpacity>
              
              {/* Espaço extra pro teclado não colar no botão no Android */}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceLight, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: theme.colors.text, fontSize: 16, fontFamily: theme.fonts.title, textTransform: "uppercase" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  
  titleSection: { marginBottom: 30 },
  sectionLabel: { color: theme.colors.text, fontSize: 15, fontWeight: "900", marginBottom: 12 },
  titleInput: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight, color: theme.colors.text, fontSize: 16, borderRadius: 12, padding: 15, fontWeight: "bold" },
  subtitleDesc: { color: theme.colors.textMuted, fontSize: 12, marginTop: 8 },

  questionsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40, backgroundColor: theme.colors.surface, borderRadius: 16, borderStyle: "dashed", borderWidth: 1, borderColor: theme.colors.border },
  emptyStateTitle: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: "bold", marginTop: 12 },
  emptyStateDesc: { color: theme.colors.textMuted, fontSize: 12, textAlign: "center", paddingHorizontal: 40, marginTop: 6 },

  questionCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.borderLight, position: "relative" },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  questionTypePill: { backgroundColor: "rgba(255,107,0,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  questionTypeText: { color: theme.colors.primary, fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  requiredTag: { color: theme.colors.danger, fontSize: 10, fontWeight: "bold" },
  questionText: { color: theme.colors.text, fontSize: 15, fontWeight: "600", paddingRight: 30 },
  optionsPreviewRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  optionPill: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.borderLight },
  optionPillText: { color: theme.colors.textSecondary, fontSize: 11 },
  deleteBtn: { position: "absolute", bottom: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,59,48,0.1)", justifyContent: "center", alignItems: "center" },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", padding: 20, paddingTop: 15, backgroundColor: theme.colors.background, borderTopWidth: 1, borderColor: theme.colors.borderLight, gap: 12 },
  btnAddQuestion: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.surfaceLight, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary, gap: 8 },
  btnAddQuestionText: { color: theme.colors.primary, fontSize: 14, fontWeight: "bold" },
  btnSave: { flex: 1, height: 55, justifyContent: "center", alignItems: "center", borderRadius: 16 },
  btnSaveText: { color: "#000", fontSize: 15, fontWeight: "900", textTransform: "uppercase" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "900" },
  inputLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "bold", marginBottom: 8 },
  modalInput: { backgroundColor: theme.colors.surfaceLight, color: theme.colors.text, fontSize: 15, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.borderLight },
  
  typeSelectorRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.borderLight },
  typeBtnActive: { backgroundColor: "rgba(255,107,0,0.1)", borderColor: theme.colors.primary },
  typeBtnText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: "bold" },
  typeBtnTextActive: { color: theme.colors.primary },

  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderTopWidth: 1, borderColor: theme.colors.borderLight, marginBottom: 20 },
  switchLabel: { color: theme.colors.text, fontSize: 14, fontWeight: "600" },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: theme.colors.textMuted, justifyContent: "center", alignItems: "center" },
  checkboxActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },

  btnConfirmAdd: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  btnConfirmAddText: { color: "#000", fontSize: 15, fontWeight: "900", textTransform: "uppercase" },
});