import React from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../../../../../../theme/theme";
import { mStyles } from "./styles";

export type BioFeedbackTipo = "error" | "warning" | "success" | "info";

export interface BioFeedbackState {
  visivel: boolean;
  tipo: BioFeedbackTipo;
  kicker?: string;
  titulo: string;
  mensagem: string;
}

interface BioModalsProps {
  modalOrigemVisivel: boolean;
  onFecharOrigem: () => void;
  onEscolherPdf: () => void;
  onEscolherGaleria: () => void;
  onEscolherCamera: () => void;
  previewImagemUri: string | null;
  onFecharPreviewImagem: () => void;
  feedback: BioFeedbackState;
  onFecharFeedback: () => void;
  modalSucessoVisivel: boolean;
  resumoSalvo: {
    peso: string;
    gordura: string;
    mme: string;
    data: string;
    viaIA: boolean;
  } | null;
  onConcluirSucesso: () => void;
}

const CORES_FEEDBACK: Record<
  BioFeedbackTipo,
  { cor: string; bg: string; border: string; icone: any; kicker: string }
> = {
  error: {
    cor: "#FF3B30",
    bg: "rgba(255, 59, 48, 0.12)",
    border: "rgba(255, 59, 48, 0.45)",
    icone: "alert-circle-outline",
    kicker: "ATENÇÃO",
  },
  warning: {
    cor: "#FFD700",
    bg: "rgba(255, 215, 0, 0.12)",
    border: "rgba(255, 215, 0, 0.42)",
    icone: "shield-alert-outline",
    kicker: "REVISÃO NECESSÁRIA",
  },
  success: {
    cor: "#00E676",
    bg: "rgba(0, 230, 118, 0.12)",
    border: "rgba(0, 230, 118, 0.45)",
    icone: "check-decagram",
    kicker: "SUCESSO",
  },
  info: {
    cor: theme.colors.primary,
    bg: "rgba(255, 107, 0, 0.12)",
    border: "rgba(255, 107, 0, 0.45)",
    icone: "information-outline",
    kicker: "INFORMAÇÃO",
  },
};

export function BioModals({
  modalOrigemVisivel,
  onFecharOrigem,
  onEscolherPdf,
  onEscolherGaleria,
  onEscolherCamera,
  previewImagemUri,
  onFecharPreviewImagem,
  feedback,
  onFecharFeedback,
  modalSucessoVisivel,
  resumoSalvo,
  onConcluirSucesso,
}: BioModalsProps) {
  const visual = CORES_FEEDBACK[feedback.tipo] || CORES_FEEDBACK.warning;

  return (
    <>
      <Modal visible={modalOrigemVisivel} transparent animationType="slide" onRequestClose={onFecharOrigem}>
        <View style={mStyles.sheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onFecharOrigem} />
          <View style={mStyles.sheetBox}>
            <View style={mStyles.sheetHandle} />
            <Text style={mStyles.sheetKicker}>LEITURA INTELIGENTE POR IA</Text>
            <Text style={mStyles.sheetTitle}>Importar Bioimpedância</Text>
            <Text style={mStyles.sheetSub}>
              Compatível com InBody, Tanita, Omron, Avanutri e laudos similares. Você poderá revisar todos os números
              antes de salvar.
            </Text>

            <TouchableOpacity style={mStyles.optionBtn} onPress={onEscolherPdf} activeOpacity={0.82}>
              <View style={mStyles.optionIconBox}>
                <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mStyles.optionTitle}>Importar PDF do Exame</Text>
                <Text style={mStyles.optionDesc}>Laudo oficial em PDF (InBody, clínicas, apps)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={mStyles.optionBtn} onPress={onEscolherGaleria} activeOpacity={0.82}>
              <View style={mStyles.optionIconBox}>
                <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mStyles.optionTitle}>Escolher Foto da Galeria</Text>
                <Text style={mStyles.optionDesc}>Print de tela ou foto nítida do laudo impresso</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={mStyles.optionBtn} onPress={onEscolherCamera} activeOpacity={0.82}>
              <View style={mStyles.optionIconBox}>
                <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mStyles.optionTitle}>Fotografar Laudo Agora</Text>
                <Text style={mStyles.optionDesc}>Tire uma foto bem iluminada da folha completa</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={mStyles.sheetCancel} onPress={onFecharOrigem} activeOpacity={0.75}>
              <Text style={mStyles.sheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(previewImagemUri)}
        transparent
        animationType="fade"
        onRequestClose={onFecharPreviewImagem}
      >
        <View style={mStyles.previewOverlay}>
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={mStyles.previewHeader}>
            <Text style={mStyles.previewTitle}>Documento Original</Text>
            <TouchableOpacity style={mStyles.previewCloseBtn} onPress={onFecharPreviewImagem} activeOpacity={0.8}>
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          {previewImagemUri ? (
            <Image source={{ uri: previewImagemUri }} style={mStyles.previewImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

      <Modal visible={Boolean(feedback.visivel)} transparent animationType="fade" onRequestClose={onFecharFeedback}>
        <View style={mStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[mStyles.card, { borderColor: visual.border }]}>
            <View style={[mStyles.iconRing, { backgroundColor: visual.bg, borderColor: visual.border }]}>
              <MaterialCommunityIcons name={visual.icone} size={32} color={visual.cor} />
            </View>
            <Text style={[mStyles.kicker, { color: visual.cor }]}>{feedback.kicker || visual.kicker}</Text>
            <Text style={mStyles.title}>{feedback.titulo}</Text>
            <Text style={mStyles.subtitle}>{feedback.mensagem}</Text>

            <TouchableOpacity
              style={[mStyles.btnPrimary, { backgroundColor: visual.bg, borderColor: visual.cor }]}
              onPress={onFecharFeedback}
              activeOpacity={0.85}
            >
              <Text style={[mStyles.btnPrimaryText, { color: visual.cor }]}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalSucessoVisivel} transparent animationType="fade" onRequestClose={onConcluirSucesso}>
        <View style={mStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[mStyles.card, { borderColor: "rgba(0, 230, 118, 0.45)" }]}>
            <View
              style={[
                mStyles.iconRing,
                { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.5)" },
              ]}
            >
              <Ionicons name="body" size={32} color="#00E676" />
            </View>
            <Text style={[mStyles.kicker, { color: "#00E676" }]}>
              {resumoSalvo?.viaIA ? "LEITURA IA CONFIRMADA" : "AVALIAÇÃO REGISTRADA"}
            </Text>
            <Text style={mStyles.title}>Bioimpedância salva!</Text>
            <Text style={mStyles.subtitle}>
              Avaliação de <Text style={{ color: "#FFF", fontWeight: "800" }}>{resumoSalvo?.data}</Text> adicionada ao
              histórico e sincronizada com o painel.
            </Text>

            {resumoSalvo ? (
              <View style={mStyles.summaryBox}>
                <View style={mStyles.summaryCol}>
                  <Text style={mStyles.summaryVal}>{resumoSalvo.peso}</Text>
                  <Text style={mStyles.summaryLbl}>PESO</Text>
                </View>
                <View style={mStyles.summaryDiv} />
                <View style={mStyles.summaryCol}>
                  <Text style={[mStyles.summaryVal, { color: theme.colors.primary }]}>{resumoSalvo.gordura}</Text>
                  <Text style={mStyles.summaryLbl}>GORDURA</Text>
                </View>
                <View style={mStyles.summaryDiv} />
                <View style={mStyles.summaryCol}>
                  <Text style={[mStyles.summaryVal, { color: "#00E676" }]}>{resumoSalvo.mme}</Text>
                  <Text style={mStyles.summaryLbl}>MASSA MUSC.</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                mStyles.btnPrimary,
                { backgroundColor: "rgba(0, 230, 118, 0.14)", borderColor: "#00E676" },
              ]}
              onPress={onConcluirSucesso}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={18} color="#00E676" />
              <Text style={[mStyles.btnPrimaryText, { color: "#00E676" }]}>Ver no Painel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}