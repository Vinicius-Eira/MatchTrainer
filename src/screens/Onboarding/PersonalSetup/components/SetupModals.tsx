import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive";

export type FeedbackModalTipo = "error" | "warning" | "success" | "info";

export interface FeedbackModalData {
  visible: boolean;
  tipo: FeedbackModalTipo;
  kicker?: string;
  titulo: string;
  mensagem: string;
  textoBotao?: string;
}

interface SetupModalsProps {
  feedback: FeedbackModalData;
  onFecharFeedback: () => void;
  modalSalvoVisivel: boolean;
  onIrParaPainel: () => void;
  onVerVitrine: () => void;
  onFecharSalvo: () => void;
}

const CORES_FEEDBACK: Record<
  FeedbackModalTipo,
  { cor: string; bg: string; border: string; icone: any; kickerPadrao: string }
> = {
  error: {
    cor: "#FF3B30",
    bg: "rgba(255, 59, 48, 0.12)",
    border: "rgba(255, 59, 48, 0.45)",
    icone: "alert-circle-outline",
    kickerPadrao: "ATENÇÃO",
  },
  warning: {
    cor: "#FFD700",
    bg: "rgba(255, 215, 0, 0.12)",
    border: "rgba(255, 215, 0, 0.42)",
    icone: "shield-alert-outline",
    kickerPadrao: "VERIFICAÇÃO",
  },
  success: {
    cor: "#00E676",
    bg: "rgba(0, 230, 118, 0.12)",
    border: "rgba(0, 230, 118, 0.45)",
    icone: "check-decagram",
    kickerPadrao: "VALIDADO",
  },
  info: {
    cor: theme.colors.primary,
    bg: "rgba(255, 107, 0, 0.12)",
    border: "rgba(255, 107, 0, 0.45)",
    icone: "information-outline",
    kickerPadrao: "INFORMAÇÃO",
  },
};

export function SetupModals({
  feedback,
  onFecharFeedback,
  modalSalvoVisivel,
  onIrParaPainel,
  onVerVitrine,
  onFecharSalvo,
}: SetupModalsProps) {
  const visual = CORES_FEEDBACK[feedback.tipo] || CORES_FEEDBACK.warning;

  return (
    <>
      <Modal
        visible={Boolean(feedback.visible)}
        transparent
        animationType="fade"
        onRequestClose={onFecharFeedback}
      >
        <View style={modalStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={[modalStyles.card, { borderColor: visual.border }]}>
            <View style={[modalStyles.iconRing, { backgroundColor: visual.bg, borderColor: visual.border }]}>
              <MaterialCommunityIcons name={visual.icone} size={32} color={visual.cor} />
            </View>

            <Text style={[modalStyles.kicker, { color: visual.cor }]}>
              {feedback.kicker || visual.kickerPadrao}
            </Text>
            <Text style={modalStyles.title}>{feedback.titulo}</Text>
            <Text style={modalStyles.subtitle}>{feedback.mensagem}</Text>

            <TouchableOpacity
              style={[
                modalStyles.btnPrimary,
                { backgroundColor: visual.bg, borderColor: visual.cor },
              ]}
              onPress={onFecharFeedback}
              activeOpacity={0.85}
            >
              <Text style={[modalStyles.btnPrimaryText, { color: visual.cor }]}>
                {feedback.textoBotao || "Entendi"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(modalSalvoVisivel)}
        transparent
        animationType="fade"
        onRequestClose={onFecharSalvo}
      >
        <View style={modalStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={[modalStyles.card, { borderColor: "rgba(0, 230, 118, 0.45)" }]}>
            <View
              style={[
                modalStyles.iconRing,
                {
                  backgroundColor: "rgba(0, 230, 118, 0.12)",
                  borderColor: "rgba(0, 230, 118, 0.5)",
                },
              ]}
            >
              <Ionicons name="checkmark-done" size={34} color="#00E676" />
            </View>

            <Text style={[modalStyles.kicker, { color: "#00E676" }]}>TUDO PRONTO</Text>
            <Text style={modalStyles.title}>Perfil e Vitrine salvos!</Text>
            <Text style={modalStyles.subtitle}>
              Suas informações, identidade visual e fotos já estão atualizadas e prontas para os alunos.
            </Text>

            <TouchableOpacity
              style={[
                modalStyles.btnPrimary,
                {
                  backgroundColor: "rgba(255, 107, 0, 0.14)",
                  borderColor: theme.colors.primary,
                  marginBottom: verticalScale(10),
                },
              ]}
              onPress={onVerVitrine}
              activeOpacity={0.85}
            >
              <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
              <Text style={[modalStyles.btnPrimaryText, { color: theme.colors.primary }]}>
                Ver Minha Vitrine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.btnSecondary}
              onPress={onIrParaPainel}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={16} color="#E4E4E7" />
              <Text style={modalStyles.btnSecondaryText}>Ir para o Painel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(22),
  },
  card: {
    width: "100%",
    backgroundColor: "#0B0B11",
    borderRadius: moderateScale(26),
    padding: scale(24),
    borderWidth: 1.4,
    alignItems: "center",
  },
  iconRing: {
    width: scale(72),
    height: scale(72),
    borderRadius: moderateScale(36),
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  kicker: {
    fontSize: moderateScale(10),
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: verticalScale(6),
  },
  title: {
    color: "#FFF",
    fontSize: moderateScale(20),
    fontFamily: theme.fonts.title,
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19.5),
    textAlign: "center",
    marginBottom: verticalScale(22),
  },
  btnPrimary: {
    width: "100%",
    height: verticalScale(50),
    borderRadius: moderateScale(14),
    borderWidth: 1.4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  btnPrimaryText: {
    fontSize: moderateScale(13),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  btnSecondary: {
    width: "100%",
    height: verticalScale(48),
    borderRadius: moderateScale(14),
    backgroundColor: "#14141E",
    borderWidth: 1,
    borderColor: "#262636",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
  },
  btnSecondaryText: {
    color: "#E4E4E7",
    fontSize: moderateScale(13),
    fontWeight: "800",
  },
});