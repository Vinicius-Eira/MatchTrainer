import React from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { DestaqueStory, hexToRgba } from "../usePersonalPublicProfile";
import { styles } from "./styles";

interface ProfileProps {
  personal: any;
  isOwner: boolean;
  corDestaque?: string;
  destaqueAberto: DestaqueStory | null;
  onFecharDestaque: () => void;
  modalMatchVisivel: boolean;
  onFecharMatch: () => void;
  matchPreCalculado: any;
  onIniciarChat: () => void;
  modalPropostaVisivel: boolean;
  onFecharProposta: () => void;
  propostaPendente: any;
  onAssinarContrato: () => void;
}

export function Profile({
  personal,
  isOwner,
  corDestaque = "#FF6B00",
  destaqueAberto,
  onFecharDestaque,
  modalMatchVisivel,
  onFecharMatch,
  matchPreCalculado,
  onIniciarChat,
  modalPropostaVisivel,
  onFecharProposta,
  propostaPendente,
  onAssinarContrato,
}: ProfileProps) {
  const accentSoft = hexToRgba(corDestaque, 0.14);
  const accentBorder = hexToRgba(corDestaque, 0.5);

  return (
    <>
      <Modal visible={Boolean(destaqueAberto)} transparent animationType="fade" onRequestClose={onFecharDestaque}>
        <View style={styles.storyOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onFecharDestaque} />
          <View style={[styles.storyCard, { borderColor: accentBorder }]}>
            {destaqueAberto?.imagem_url ? (
              <View style={styles.storyHeroBox}>
                <Image source={{ uri: destaqueAberto.imagem_url }} style={styles.storyHeroImg} resizeMode="cover" />
                <LinearGradient colors={["transparent", "#111115"]} style={styles.storyHeroFade} />
              </View>
            ) : null}

            <View style={styles.storyBodyWrap}>
              {!destaqueAberto?.imagem_url && (
                <View style={styles.storyBarBg}>
                  <View style={[styles.storyBarFill, { backgroundColor: corDestaque }]} />
                </View>
              )}

              <View style={styles.storyTop}>
                <View style={styles.storyTitleWrap}>
                  <View style={[styles.storyIconCircle, { backgroundColor: accentSoft, borderColor: corDestaque }]}>
                    <Ionicons name={(destaqueAberto?.icone as any) || "flame"} size={18} color={corDestaque} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storyTitle}>{destaqueAberto?.titulo}</Text>
                    <Text style={[styles.storySub, { color: corDestaque }]}>{destaqueAberto?.subtitulo}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onFecharDestaque}>
                  <Ionicons name="close" size={22} color="#888" />
                </TouchableOpacity>
              </View>

              <Text style={styles.storyBody}>{destaqueAberto?.conteudo}</Text>

              <TouchableOpacity
                style={[styles.btnStoryFechar, { backgroundColor: accentSoft, borderColor: corDestaque }]}
                onPress={onFecharDestaque}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnStoryFecharText, { color: corDestaque }]}>Entendi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalMatchVisivel} transparent animationType="fade" onRequestClose={onFecharMatch}>
        <BlurView intensity={95} tint="dark" style={styles.modalMatchOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onFecharMatch} />
          <View style={styles.matchReportCard}>
            <View style={styles.matchReportHeader}>
              <Ionicons name="flash" size={28} color="#FF6B00" style={{ marginBottom: 8 }} />
              <Text style={styles.matchReportTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.matchReportSubtitle}>
                Por que <Text style={{ color: "#FFF" }}>{personal?.nome?.split(" ")[0]}</Text> combina com seu objetivo
              </Text>
            </View>

            <View style={styles.scoreRingContainer}>
              <View style={styles.scoreRing}>
                <Text style={styles.scoreText}>{matchPreCalculado?.matchPercentual}%</Text>
                <Text style={styles.scoreLabel}>MATCH</Text>
              </View>
            </View>

            <ScrollView style={styles.matchReasonsScroll} showsVerticalScrollIndicator={false}>
              {(matchPreCalculado?.matchMotivos || []).map((motivo: any, index: number) => (
                <View key={index} style={styles.reasonCard}>
                  <View style={styles.reasonIconBox}>
                    <Text style={{ fontSize: 15 }}>{motivo.icone}</Text>
                  </View>
                  <Text style={styles.reasonText}>{motivo.texto}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.matchReportFooter}>
              <TouchableOpacity style={styles.btnReportClose} onPress={onFecharMatch} activeOpacity={0.75}>
                <Text style={styles.btnReportCloseText}>Fechar</Text>
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity style={styles.btnReportAction} onPress={onIniciarChat} activeOpacity={0.85}>
                  <Ionicons name="chatbubbles-outline" size={16} color="#FF6B00" />
                  <Text style={styles.btnReportActionText}>Conversar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </Modal>

      <Modal visible={modalPropostaVisivel} transparent animationType="slide" onRequestClose={onFecharProposta}>
        <View style={styles.propostaOverlay}>
          <View style={styles.propostaCard}>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="shield-checkmark" size={44} color="#00E676" />
              <Text style={styles.propostaTitle}>Proposta Oficial Recebida</Text>
              <Text style={styles.propostaSub}>Revise os termos e assine digitalmente para iniciar.</Text>
            </View>

            <View style={styles.propostaBox}>
              <Text style={styles.propostaLabel}>Valor do Investimento</Text>
              <Text style={styles.propostaValor}>R$ {propostaPendente?.valor_mensal}</Text>
              <Text style={styles.propostaLabel}>Termos do Acompanhamento</Text>
              <Text style={styles.propostaObs}>
                {propostaPendente?.observacoes || "Acompanhamento personalizado pelo MatchTrainer."}
              </Text>
            </View>

            <TouchableOpacity style={styles.btnAssinar} onPress={onAssinarContrato} activeOpacity={0.85}>
              <Ionicons name="checkmark-done" size={18} color="#00E676" />
              <Text style={styles.btnAssinarText}>Assinar e Começar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDuvidas} onPress={onFecharProposta}>
              <Text style={styles.btnDuvidasText}>Ainda tenho dúvidas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}