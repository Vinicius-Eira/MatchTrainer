import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "../../../../theme/theme";
import { styles } from "./styles";
import { useFeedbackPersonal } from "./useFeedbackPersonal";

interface FeedbackPersonalProps {
  navigation: {
    goBack: () => void;
  };
}

export function FeedbackPersonal({ navigation }: FeedbackPersonalProps) {
  const {
    categoria,
    setCategoria,
    mensagem,
    setMensagem,
    notaApp,
    setNotaApp,
    loading,
    categorias,
    handleEnviar,
  } = useFeedbackPersonal({ navigation });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 5, alignSelf: "flex-start" }}
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
              <Text style={styles.title}>Ajude a melhorar o MatchTrainer</Text>
              <Text style={styles.subtitle}>
                Sua opinião como personal trainer é essencial para construirmos
                as melhores ferramentas.
              </Text>
            </View>

            <Text style={[styles.label, { textAlign: "center" }]}>
              Como você avalia o app até agora?
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => {
                    Keyboard.dismiss();
                    setNotaApp(star);
                  }}
                >
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