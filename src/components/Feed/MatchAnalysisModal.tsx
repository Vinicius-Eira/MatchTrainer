import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MatchDetalhesPontuacao, PersonalMatchItem } from "../../services/match/matchService";
import { theme } from "@/src/theme/theme"; 
import { styles } from "../../screens/User/Feed/styles";

interface MatchAnalysisModalProps {
  visible: boolean;
  personal: PersonalMatchItem | null;
  onClose: () => void;
  onVerPerfil: (personalId: string) => void;
}

interface DimensaoCardItem {
  label: string;
  icon: any;
  pct: number;
}

function montarDimensoes(detalhes?: MatchDetalhesPontuacao): DimensaoCardItem[] {
  if (!detalhes) return [];

  const grupos = [
    {
      label: "Objetivo e Especialidade",
      icon: "flame-outline",
      pts: detalhes.objetivo?.pts || 0,
      max: detalhes.objetivo?.max || 0,
    },
    {
      label: "Segurança e Restrições",
      icon: "shield-checkmark-outline",
      pts: detalhes.saude?.pts || 0,
      max: detalhes.saude?.max || 0,
    },
    {
      label: "DNA Comportamental",
      icon: "sparkles-outline",
      pts:
        (detalhes.comunicacao?.pts || 0) +
        (detalhes.cobranca?.pts || 0) +
        (detalhes.acompanhamento?.pts || 0) +
        (detalhes.autonomia?.pts || 0),
      max:
        (detalhes.comunicacao?.max || 0) +
        (detalhes.cobranca?.max || 0) +
        (detalhes.acompanhamento?.max || 0) +
        (detalhes.autonomia?.max || 0),
    },
    {
      label: "Nível e Momento de Vida",
      icon: "barbell-outline",
      pts: (detalhes.experiencia?.pts || 0) + (detalhes.faixa_etaria?.pts || 0),
      max: (detalhes.experiencia?.max || 0) + (detalhes.faixa_etaria?.max || 0),
    },
    {
      label: "Logística, Local e Turno",
      icon: "location-outline",
      pts: (detalhes.distancia?.pts || 0) + (detalhes.local?.pts || 0) + (detalhes.turno?.pts || 0),
      max: (detalhes.distancia?.max || 0) + (detalhes.local?.max || 0) + (detalhes.turno?.max || 0),
    },
    {
      label: "Faixa de Investimento",
      icon: "wallet-outline",
      pts: detalhes.investimento?.pts || 0,
      max: detalhes.investimento?.max || 0,
    },
  ];

  return grupos
    .filter((g) => g.max > 0)
    .map((g) => ({
      label: g.label,
      icon: g.icon,
      pct: Math.min(100, Math.round((g.pts / g.max) * 100)),
    }));
}

export function MatchAnalysisModal({ visible, personal, onClose, onVerPerfil }: MatchAnalysisModalProps) {
  if (!personal) return null;

  const primeiroNome = personal.nome.split(" ")[0] || "Profissional";
  const dimensoes = montarDimensoes(personal.detalhesPontuacao);

  return (
    <Modal visible={Boolean(visible)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          <LinearGradient
            colors={["#FF6B00", "#FF9A3C", "rgba(255, 107, 0, 0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalTopAccent}
          />

          <View style={styles.modalInner}>
            <View style={styles.modalTopRow}>
              <View style={styles.modalKickerRow}>
                <Ionicons name="flash" size={14} color={theme.colors.primary} />
                <Text style={styles.modalKicker}>Motor MatchTrainer</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseX} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="close" size={18} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              bounces={true}
            >
              <View style={styles.modalHeroBox}>
                <View style={styles.scoreHaloWrap}>
                  <View style={styles.scoreHaloSoft} />
                  <View style={styles.scoreHaloMid} />
                  <LinearGradient
                    colors={["#FF6B00", "#FF9E44", "rgba(255, 107, 0, 0.25)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scoreRingGradient}
                  >
                    <View style={styles.scoreRingInner}>
                      <Text style={styles.scoreRingValue}>{personal.matchPercentual}%</Text>
                      <Text style={styles.scoreRingLabel}>MATCH REAL</Text>
                    </View>
                  </LinearGradient>
                </View>

                <Text style={styles.modalTitle}>Compatibilidade com {primeiroNome}</Text>
                <Text style={styles.modalSubtitle}>Cálculo exato com base no seu Raio-X de Treino</Text>

                <View style={styles.modalTierBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#00E676" />
                  <Text style={styles.modalTierBadgeText}>{personal.matchTierLabel}</Text>
                </View>
              </View>

              {dimensoes.length > 0 ? (
                <>
                  <Text style={styles.modalSectionLabel}>Afinidade por Dimensão</Text>
                  {dimensoes.map((dim) => {
                    const isExcelente = dim.pct >= 85;
                    const corBarra = isExcelente ? "#00E676" : theme.colors.primary;
                    return (
                      <View key={dim.label} style={styles.dimCard}>
                        <View style={styles.dimCardTop}>
                          <View style={styles.dimCardLeft}>
                            <View style={styles.dimIconCircle}>
                              <Ionicons name={dim.icon} size={15} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.dimLabel} numberOfLines={1}>
                              {dim.label}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.dimPctPill,
                              isExcelente
                                ? { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.4)" }
                                : { backgroundColor: "rgba(255, 107, 0, 0.12)", borderColor: "rgba(255, 107, 0, 0.4)" },
                            ]}
                          >
                            <Text style={[styles.dimPctText, { color: corBarra }]}>{dim.pct}%</Text>
                          </View>
                        </View>

                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${Math.max(dim.pct, 4)}%`, backgroundColor: corBarra },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </>
              ) : null}

              {(personal.matchMotivos || []).length > 0 ? (
                <>
                  <Text style={[styles.modalSectionLabel, { marginTop: 10 }]}>Pontos Fortes do Match</Text>
                  {personal.matchMotivos.map((motivo, idx) => (
                    <View key={idx} style={styles.motivoRow}>
                      <View style={styles.motivoIconBg}>
                        <Text style={{ fontSize: 15 }}>{motivo.icone}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        {motivo.categoria ? <Text style={styles.motivoCat}>{motivo.categoria}</Text> : null}
                        <Text style={styles.motivoText}>{motivo.texto}</Text>
                      </View>
                    </View>
                  ))}
                </>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity style={styles.btnModalClose} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.btnModalCloseText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnModalProfile}
                onPress={() => {
                  onClose();
                  onVerPerfil(personal.id);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.btnModalProfileText}>Ver Perfil Completo</Text>
                <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}