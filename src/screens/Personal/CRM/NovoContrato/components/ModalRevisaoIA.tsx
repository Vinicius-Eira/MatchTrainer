import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../../utils/responsive";
import { ResultadoAnaliseIA } from "../../../../../services/contratoDocumentos";

interface ModalRevisaoIAProps {
  visible: boolean;
  resultado: ResultadoAnaliseIA | null;
  onAplicarTexto: (texto: string) => void;
  onFechar: () => void;
}

export function ModalRevisaoIA({ visible, resultado, onAplicarTexto, onFechar }: ModalRevisaoIAProps) {
  if (!resultado) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="file-document-check-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tag}>ASSISTÊNCIA POR IA</Text>
                <Text style={styles.title}>Revisão do Contrato</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onFechar} style={styles.btnClose}>
              <Ionicons name="close" size={20} color="#AAA" />
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={18} color="#FFD700" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.disclaimerText}>{resultado.aviso_legal}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionLabel}>CONTEÚDO EXTRAÍDO E ORGANIZADO</Text>
            <View style={styles.textBox}>
              <Text style={styles.extractedText}>{resultado.texto_organizado}</Text>
            </View>

            {resultado.pontos_atencao.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: "#FFD700" }]}>
                  PONTOS AUSENTES, AMBÍGUOS OU PARA ATENÇÃO
                </Text>
                <View style={styles.alertCard}>
                  {resultado.pontos_atencao.map((ponto, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Ionicons name="alert-circle-outline" size={16} color="#FFD700" style={{ marginTop: 2 }} />
                      <Text style={styles.bulletText}>{ponto}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {resultado.sugestoes_opcionais.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: "#00E676" }]}>
                  SUGESTÕES OPCIONAIS DA IA (NÃO INSERIDAS AUTOMATICAMENTE)
                </Text>
                <View style={styles.suggestionCard}>
                  {resultado.sugestoes_opcionais.map((sug, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Ionicons name="bulb-outline" size={16} color="#00E676" style={{ marginTop: 2 }} />
                      <Text style={styles.bulletText}>{sug}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnAplicar}
              onPress={() => onAplicarTexto(resultado.texto_organizado)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.btnAplicarText}>Usar no Editor para Revisar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnManter} onPress={onFechar} activeOpacity={0.75}>
              <Text style={styles.btnManterText}>Descartar e Manter Texto Atual</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: "#0E0E13",
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    borderWidth: 1,
    borderColor: "#242430",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  handle: {
    width: scale(42),
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A46",
    alignSelf: "center",
    marginBottom: verticalScale(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: scale(12),
  },
  iconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255, 107, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  tag: {
    color: theme.colors.primary,
    fontSize: moderateScale(10),
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: "#FFF",
    fontSize: moderateScale(18),
    fontWeight: "900",
  },
  btnClose: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  disclaimerBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: moderateScale(12),
    padding: scale(12),
    marginBottom: verticalScale(14),
  },
  disclaimerText: {
    color: "#E5D27B",
    fontSize: moderateScale(11.5),
    lineHeight: moderateScale(17),
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(16),
  },
  sectionLabel: {
    color: "#A1A1AA",
    fontSize: moderateScale(10.5),
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(10),
  },
  textBox: {
    backgroundColor: "#15151D",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "#252533",
    padding: scale(14),
  },
  extractedText: {
    color: "#F4F4F5",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  alertCard: {
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.25)",
    padding: scale(14),
    gap: verticalScale(8),
  },
  suggestionCard: {
    backgroundColor: "rgba(0, 230, 118, 0.05)",
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.25)",
    padding: scale(14),
    gap: verticalScale(8),
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8),
  },
  bulletText: {
    color: "#E4E4E7",
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(18),
    flex: 1,
  },
  footer: {
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  btnAplicar: {
    width: "100%",
    height: verticalScale(52),
    borderRadius: moderateScale(16),
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  btnAplicarText: {
    color: theme.colors.primary,
    fontSize: moderateScale(13.5),
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  btnManter: {
    paddingVertical: verticalScale(8),
  },
  btnManterText: {
    color: "#8E8E93",
    fontSize: moderateScale(12.5),
    fontWeight: "700",
  },
});