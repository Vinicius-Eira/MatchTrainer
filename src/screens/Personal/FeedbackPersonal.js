import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

export default function FeedbackPersonal({ navigation }) {
  const [categoria, setCategoria] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [notaApp, setNotaApp] = useState(0);
  const [loading, setLoading] = useState(false);

  const categorias = [
    "Quero mais visibilidade",
    "Preciso de mais ferramentas",
    "Bug no app",
    "Sugestão para o CRM",
    "Dificuldade no cadastro",
    "Outro",
  ];

  const handleEnviar = async () => {
    Keyboard.dismiss(); 
    
    if (!categoria)
      return Alert.alert(
        "Atenção",
        "Selecione uma categoria sobre o seu feedback.",
      );
    if (!mensagem.trim())
      return Alert.alert(
        "Atenção",
        "Por favor, detalhe sua sugestão ou problema.",
      );
    if (notaApp === 0)
      return Alert.alert(
        "Atenção",
        "Avalie sua experiência geral com o aplicativo.",
      );

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("feedbacks_app").insert({
        usuario_id: user?.id,
        tipo_usuario: "personal",
        categoria: categoria,
        mensagem: mensagem.trim(),
        nota_app: notaApp,
      });

      if (error) throw error;

      Alert.alert(
        "Feedback Enviado!",
        "Obrigado! Sua opinião vai direto para a equipe de desenvolvimento do PersonalMatch.",
        [{ text: "Voltar ao Dashboard", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o feedback. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 5 }}
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" 
        keyboardDismissMode="on-drag"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <View style={styles.titleContainer}>
              <Ionicons
                name="megaphone-outline"
                size={40}
                color={theme.colors.primary}
              />
              <Text style={styles.title}>Ajude a melhorar o PersonalMatch</Text>
              <Text style={styles.subtitle}>
                Sua opinião como personal trainer é essencial para construirmos as
                melhores ferramentas.
              </Text>
            </View>

            <Text style={[styles.label, { textAlign: "center" }]}>
              Como você avalia o app até agora?
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => {
                  Keyboard.dismiss();
                  setNotaApp(star);
                }}>
                  <Ionicons
                    name={star <= notaApp ? "star" : "star-outline"}
                    size={40}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { textAlign: "center" }]}>
              Qual o assunto principal?
            </Text>
            <View style={styles.chipsContainer}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, categoria === cat && styles.chipActive]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setCategoria(cat);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      categoria === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { textAlign: "center" }]}>
              Deixe seu comentário ou sugestão
            </Text>
            <TextInput
              style={styles.inputArea}
              placeholder="Ex: Gostaria que o CRM tivesse uma opção para..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={5}
              value={mensagem}
              onChangeText={setMensagem}
              textAlignVertical="top"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss} 
            />

            <TouchableOpacity
              style={[styles.btnEnviar, loading && { opacity: 0.7 }]}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="#000"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.btnEnviarText}>Enviar Feedback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  scrollContent: { padding: 20, paddingBottom: 50 },

  titleContainer: { alignItems: "center", marginBottom: 30 },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: 32,
    color: theme.colors.text,
    marginTop: 15,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  label: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 30,
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  chip: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  chipTextActive: { color: "#000", fontWeight: "bold" },

  inputArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 15,
    color: theme.colors.text,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 30,
  },

  btnEnviar: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnEnviarText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});