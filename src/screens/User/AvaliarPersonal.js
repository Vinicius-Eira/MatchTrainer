import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

export default function AvaliarPersonal({ route, navigation }) {
  const { personalId, nomePersonal, fotoPersonal } = route.params;

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarAvaliacao = async () => {
    if (nota === 0) {
      return Alert.alert(
        "Atenção",
        "Por favor, selecione uma nota de 1 a 5 estrelas.",
      );
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return Alert.alert("Erro", "Você precisa estar logado para avaliar.");
      }

      const { error } = await supabase.from("avaliacoes").upsert(
        {
          personal_id: personalId,
          usuario_id: user.id,
          nota: nota,
          comentario: comentario.trim(),
        },
        { onConflict: "personal_id, usuario_id" },
      );

      if (error) throw error;

      Alert.alert(
        "Sucesso!",
        "Sua avaliação foi enviada. Isso ajuda muito o profissional e a comunidade!",
        [{ text: "Voltar", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error("Erro ao avaliar:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar a avaliação. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setNota(i)}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= nota ? "star" : "star-outline"}
            size={45}
            color={i <= nota ? theme.colors.primary : "#444"}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliar Profissional</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: fotoPersonal || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
          <Text style={styles.questionText}>Como foi sua experiência com</Text>
          <Text style={styles.nameText}>{nomePersonal}?</Text>
        </View>

        <View style={styles.starsContainer}>{renderStars()}</View>
        <Text style={styles.ratingHint}>
          {nota === 0
            ? "Toque nas estrelas para avaliar"
            : nota === 1
            ? "Muito ruim 😞"
            : nota === 2
            ? "Ruim 😕"
            : nota === 3
            ? "Razoável 😐"
            : nota === 4
            ? "Muito bom! 🙂"
            : "Excelente! 🤩"}
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputArea}
            placeholder="Deixe um comentário sobre o treino, didática, atenção... (Opcional)"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={250}
            value={comentario}
            onChangeText={setComentario}
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>{comentario.length}/250</Text>
        </View>

        <TouchableOpacity
          style={[styles.btnSubmit, loading && { opacity: 0.7 }]}
          onPress={enviarAvaliacao}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.btnSubmitText}>Enviar Avaliação</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(30),
    paddingBottom: verticalScale(20),
  },
  btnVoltar: { width: scale(40), height: scale(40), justifyContent: "center" },
  headerTitle: {
    color: theme.colors.text,
    fontSize: moderateScale(18),
    fontFamily: theme.fonts.title,
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    paddingHorizontal: scale(25),
    paddingTop: verticalScale(20),
  },

  profileSection: { alignItems: "center", marginBottom: verticalScale(30) },
  avatar: {
    width: scale(90),
    height: scale(90),
    borderRadius: moderateScale(45),
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: verticalScale(15),
  },
  questionText: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(15),
    fontFamily: theme.fonts.body,
  },
  nameText: {
    color: "#FFF",
    fontSize: moderateScale(24),
    fontFamily: theme.fonts.title,
    marginTop: verticalScale(4),
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(8),
    marginBottom: verticalScale(15),
  },
  starButton: { padding: scale(4) },
  ratingHint: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: moderateScale(15),
    fontWeight: "bold",
    marginBottom: verticalScale(35),
  },

  inputContainer: {
    backgroundColor: "#121212",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "#262626",
    padding: scale(5),
    marginBottom: verticalScale(30),
  },
  inputArea: {
    color: "#FFF",
    fontSize: moderateScale(15),
    fontFamily: theme.fonts.body,
    minHeight: verticalScale(120),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(15),
  },
  charCounter: {
    color: theme.colors.textSecondary,
    fontSize: moderateScale(12),
    textAlign: "right",
    paddingRight: scale(15),
    paddingBottom: verticalScale(10),
  },

  btnSubmit: {
    backgroundColor: theme.colors.primary,
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: verticalScale(40),
  },
  btnSubmitText: {
    color: "#000",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});
