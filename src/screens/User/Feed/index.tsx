import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useFeedPersonal } from "./useFeedPersonal";

const { width } = Dimensions.get('window');

const ORANGE_NEON = "#FF6B00";

const formatarBairroCidade = (cidade?: string, bairro?: string) => {
  if (!cidade && !bairro) return "Local não informado";
  if (bairro && cidade) return `${bairro}, ${cidade}`;
  return bairro || cidade;
};

const calcularIdade = (dataNascimento?: string) => {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};

export function FeedPersonal({ navigation }: any) {
  const { state, actions } = useFeedPersonal(navigation);

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        <ActivityIndicator size="large" color={ORANGE_NEON} />
      </View>
    );
  }

  const currentItem = state.personalsExibidos[state.currentIndex];
  const hasNext = state.currentIndex < state.personalsExibidos.length - 1;
  const hasPrev = state.currentIndex > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      <View style={styles.headerFeed}>
        <View style={styles.logoRow}>
          <Text style={styles.headerTitle}>MATCH<Text style={{ color: ORANGE_NEON }}>TRAINER</Text></Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={actions.handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {!state.isAlunoConsultoria ? (
          <View style={styles.radarContainer}>
            <View style={styles.radarHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="radar" size={18} color={ORANGE_NEON} />
                <Text style={styles.radarTitle}>Radar Presencial</Text>
              </View>
              <View style={styles.radarBadge}>
                <Text style={styles.radarBadgeText}>Até {state.distanciaMaxima} km</Text>
              </View>
            </View>
            <Slider
              style={{ width: "100%", height: 35 }}
              minimumValue={5}
              maximumValue={100}
              step={5}
              minimumTrackTintColor={ORANGE_NEON}
              maximumTrackTintColor="#333"
              thumbTintColor={ORANGE_NEON}
              value={state.distanciaMaxima}
              onValueChange={actions.handleSliderChange}
            />
          </View>
        ) : null}

        {currentItem ? (
          <View style={styles.cardWrapper}>
            
            <View style={styles.navigationRow}>
              <TouchableOpacity onPress={actions.prevPersonal} disabled={!hasPrev} style={[styles.navButton, !hasPrev && styles.navButtonDisabled]}>
                <Ionicons name="chevron-back" size={24} color={hasPrev ? ORANGE_NEON : "#444"} />
              </TouchableOpacity>

              <Text style={styles.navCounter}>{state.currentIndex + 1} DE {state.personalsExibidos.length}</Text>

              <TouchableOpacity onPress={actions.nextPersonal} disabled={!hasNext} style={[styles.navButton, !hasNext && styles.navButtonDisabled]}>
                <Ionicons name="chevron-forward" size={24} color={hasNext ? ORANGE_NEON : "#444"} />
              </TouchableOpacity>
            </View>

            <View style={styles.premiumCard}>
              
              <View style={styles.imageContainer}>
                <Image source={{ uri: currentItem.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={styles.image} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={styles.imageOverlay} />

                <TouchableOpacity onPress={() => actions.abrirDetalhesMatch(currentItem)} style={styles.badgeMatch}>
                  <Ionicons name="flash" size={12} color={ORANGE_NEON} style={styles.neonGlow} />
                  <Text style={styles.badgeMatchText}>{currentItem.matchPercentual}% MATCH</Text>
                </TouchableOpacity>

                <View style={[styles.badgeService, currentItem.badgeUi === "CONSULTORIA" && styles.badgeConsultoriaNeon]}>
                  <Ionicons name={currentItem.iconUi as any} size={12} color={currentItem.badgeUi === "CONSULTORIA" ? ORANGE_NEON : "#FFF"} />
                  <Text style={[styles.badgeServiceText, currentItem.badgeUi === "CONSULTORIA" && styles.badgeConsultoriaTextNeon]}>
                    {currentItem.badgeUi}
                  </Text>
                </View>

                <View style={styles.imageBottomText}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.cardName}>{currentItem.nome} {calcularIdade(currentItem.data_nascimento) ? `, ${calcularIdade(currentItem.data_nascimento)}` : ''}</Text>
                    {currentItem.cref_verificado ? <MaterialCommunityIcons name="check-decagram" size={22} color="#10B981" style={{ marginLeft: 6 }} /> : null}
                  </View>
                  
                  <View style={styles.locationRow}>
                    {currentItem.badgeUi === "CONSULTORIA" ? (
                      <View style={styles.digitalLocation}>
                        <Ionicons name="phone-portrait-outline" size={15} color={ORANGE_NEON} />
                        <Text style={styles.cardLocationDigital}> Treino 100% pelo Celular</Text>
                      </View>
                    ) : (
                      <View style={styles.digitalLocation}>
                        <Ionicons name="location-outline" size={15} color={ORANGE_NEON} />
                        <Text style={styles.cardLocation}>
                             {formatarBairroCidade(currentItem.cidade, currentItem.bairro)} • {currentItem.distanciaReal?.toFixed(1)}km
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardBio} numberOfLines={2}>
                  {currentItem.descricao || "Profissional focado em resultados, pronto para te ajudar a alcançar sua melhor versão."}
                </Text>

                <View style={styles.specialtiesContainer}>
                  {currentItem.specsParsed?.objetivos?.slice(0, 3).map((esp: string, i: number) => (
                    <View key={i} style={styles.tagPrimary}><Text style={styles.tagPrimaryText}>{esp}</Text></View>
                  ))}
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Ionicons name="star" size={18} color={ORANGE_NEON} />
                    <Text style={styles.statValue}>{currentItem.nota_media ? Number(currentItem.nota_media).toFixed(1) : "--"}</Text>
                    <Text style={styles.statLabel}>Avaliação</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <FontAwesome5 name="dumbbell" size={16} color={ORANGE_NEON} />
                    <Text style={styles.statValue}>{currentItem.tempo_experiencia?.split(" ")[0] || "--"}</Text>
                    <Text style={styles.statLabel}>Experiência</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Ionicons name="cash" size={20} color={ORANGE_NEON} />
                    <Text style={[styles.statValue, { color: ORANGE_NEON }]}>R$ {currentItem.precoAvaliar || "--"}</Text>
                    <Text style={styles.statLabel}>Mensal</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.btnActionOutlined} 
                  activeOpacity={0.6} 
                  onPress={() => navigation.navigate("PerfilPublicoPersonal", { id: currentItem.id })}
                >
                  <Text style={styles.btnActionTextNeon}>Ver perfil completo</Text>
                  <Ionicons name="arrow-forward" size={18} color={ORANGE_NEON} style={styles.neonGlow} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={60} color={ORANGE_NEON} />
            <Text style={styles.emptyTitle}>Buscando a Elite...</Text>
            <Text style={styles.emptyText}>Exibimos apenas profissionais com alta taxa de compatibilidade comportamental e logística com você.</Text>
            {!state.isAlunoConsultoria ? (
              <Text style={styles.emptyHint}>Dica: Aumente o raio do radar para expandir as buscas presenciais.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal visible={state.modalVisible} transparent={true} animationType="fade" onRequestClose={actions.fecharDetalhesMatch}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Ionicons name="analytics-outline" size={32} color={ORANGE_NEON} style={[styles.neonGlow, { marginBottom: 10 }]} />
              <Text style={styles.modalTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.modalSubtitle}>Por que {state.matchSelecionado?.nome?.split(" ")[0]} é o seu Treinador ideal?</Text>
            </View>

            <View style={styles.scoreRingContainer}>
              <View style={styles.scoreRing}>
                <Text style={styles.scoreRingValue}>{state.matchSelecionado?.matchPercentual}%</Text>
                <Text style={styles.scoreRingLabel}>MATCH</Text>
              </View>
            </View>

            <View style={styles.modalBody}>
              {state.matchSelecionado?.matchMotivos?.map((motivo: any, index: number) => (
                <View key={index} style={styles.motivoRow}>
                  <View style={styles.motivoIconBg}>
                    <Text style={{ fontSize: 16 }}>{motivo.icone}</Text>
                  </View>
                  <Text style={styles.motivoText}>{motivo.texto}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.btnActionOutlined} onPress={actions.fecharDetalhesMatch} activeOpacity={0.6}>
              <Text style={styles.btnActionTextNeon}>ENTENDI</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D0D" },
  
  headerFeed: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 50, paddingBottom: 15, backgroundColor: "transparent" },
  logoRow: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#FFF", letterSpacing: 2 },
  btnLogout: { position: "absolute", right: 20, top: 50 },

  scrollContent: { padding: 20, paddingBottom: 50, paddingTop: 10 },

  radarContainer: { backgroundColor: "#1A1A1A", padding: 15, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#2A2A2A" },
  radarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  radarTitle: { fontSize: 14, fontWeight: "bold", color: "#FFF", marginLeft: 5 },
  radarBadge: { backgroundColor: "rgba(255, 107, 0, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  radarBadgeText: { color: ORANGE_NEON, fontSize: 12, fontWeight: "bold" },

  cardWrapper: { alignItems: "center", marginTop: 10 },
  
  navigationRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 15, paddingHorizontal: 10 },
  navButton: { padding: 10, backgroundColor: "#1A1A1A", borderRadius: 20, borderWidth: 1, borderColor: "#333" },
  navButtonDisabled: { opacity: 0.3 },
  navCounter: { fontSize: 13, fontWeight: "900", color: "#888", letterSpacing: 1 },

  premiumCard: { width: "100%", backgroundColor: "#1A1A1A", borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#333" },
  
  imageContainer: { width: "100%", height: 340, position: "relative" },
  image: { width: "100%", height: "100%", backgroundColor: "#222" },
  imageOverlay: { position: "absolute", bottom: 0, width: "100%", height: "60%" },
  
  badgeMatch: { position: "absolute", top: 15, right: 15, backgroundColor: "rgba(0,0,0,0.8)", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  badgeMatchText: { color: ORANGE_NEON, fontSize: 11, fontWeight: "900", marginLeft: 6, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  neonGlow: { textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  badgeService: { position: "absolute", top: 15, left: 15, backgroundColor: "rgba(0,0,0,0.7)", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  badgeServiceText: { color: "#FFF", fontSize: 10, fontWeight: "bold", marginLeft: 5, textTransform: "uppercase" },

  badgeConsultoriaNeon: { backgroundColor: "rgba(0,0,0,0.8)", borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  badgeConsultoriaTextNeon: { color: ORANGE_NEON, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  imageBottomText: { position: "absolute", bottom: 15, left: 15, right: 15 },
  cardName: { color: "#FFF", fontSize: 28, fontWeight: "900", textShadowColor: "rgba(0,0,0,1)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  
  locationRow: { marginTop: 6 },
  digitalLocation: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardLocation: { color: "#D1D5DB", fontSize: 13, fontWeight: "600", marginLeft: 4 },
  cardLocationDigital: { color: ORANGE_NEON, fontSize: 13, fontWeight: "bold" },

  cardBody: { padding: 20 },
  cardBio: { color: "#A0A0A0", fontSize: 14, fontStyle: "italic", marginBottom: 15, lineHeight: 20 },
  
  specialtiesContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  tagPrimary: { backgroundColor: "rgba(255, 107, 0, 0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", marginRight: 8, marginBottom: 8 },
  tagPrimaryText: { color: ORANGE_NEON, fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#080808", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#222", marginBottom: 20 },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "900", color: "#FFF", marginTop: 6 },
  statLabel: { fontSize: 10, color: "#888", fontWeight: "bold", textTransform: "uppercase", marginTop: 3 },
  statDivider: { width: 1, backgroundColor: "#222", height: "100%" },

  btnActionOutlined: { width: "100%", backgroundColor: "transparent", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 4 },
  btnActionTextNeon: { color: ORANGE_NEON, fontSize: 16, fontWeight: "900", marginRight: 8, textTransform: "uppercase", letterSpacing: 1, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  emptyState: { alignItems: "center", marginTop: 50 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#FFF", marginTop: 15 },
  emptyText: { fontSize: 14, color: "#AAA", textAlign: "center", marginTop: 10, lineHeight: 22 },
  emptyHint: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#111", borderRadius: 24, padding: 25, alignItems: "center", borderWidth: 1, borderColor: "#333" },
  modalHeader: { alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#FFF", textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 8, lineHeight: 20 },
  
  scoreRingContainer: { alignItems: "center", marginBottom: 25 },
  scoreRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: ORANGE_NEON, justifyContent: "center", alignItems: "center", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  scoreRingValue: { fontSize: 36, fontWeight: "900", color: ORANGE_NEON, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  scoreRingLabel: { fontSize: 11, color: "#FFF", fontWeight: "bold", marginTop: 2, letterSpacing: 1 },

  modalBody: { width: "100%", backgroundColor: "#1A1A1A", borderRadius: 15, padding: 15, borderWidth: 1, borderColor: "#2A2A2A", marginBottom: 25 },
  motivoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  motivoIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  motivoText: { fontSize: 14, color: "#DDD", flex: 1, lineHeight: 20 },
});