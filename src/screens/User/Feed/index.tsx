import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, StatusBar, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useFeedPersonal } from "./useFeedPersonal";
import { styles } from "./styles";

const ORANGE_NEON = "#FF5100";
const DARK_BG = "#050505";

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
        <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
        <ActivityIndicator size="large" color={ORANGE_NEON} />
      </View>
    );
  }

  const currentItem = state.personalsExibidos[state.currentIndex];
  const hasNext = state.currentIndex < state.personalsExibidos.length - 1;
  const hasPrev = state.currentIndex > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      <View style={styles.headerFeed}>
        <View style={styles.logoRow}>
          <Text style={styles.headerTitle}>MATCH<Text style={{ color: ORANGE_NEON }}>TRAINER</Text></Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={actions.handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={26} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {!state.isAlunoConsultoria ? (
          <View style={styles.radarContainer}>
            <View style={styles.radarHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons name="radar" size={20} color={ORANGE_NEON} />
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
            
            <View style={styles.premiumCard}>
              
              <View style={styles.imageContainer}>
                <Image source={{ uri: currentItem.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={styles.image} />
                <LinearGradient colors={["transparent", "rgba(5,5,5,0.7)", "#050505"]} style={styles.imageOverlay} />

                <TouchableOpacity onPress={() => actions.abrirDetalhesMatch(currentItem)} style={styles.badgeMatch} activeOpacity={0.8}>
                  <Ionicons name="flash" size={14} color={ORANGE_NEON} style={styles.neonGlow} />
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
                    {currentItem.cref_verificado ? <MaterialCommunityIcons name="check-decagram" size={24} color="#00E676" style={{ marginLeft: 8 }} /> : null}
                  </View>
                  
                  <View style={styles.locationRow}>
                    {currentItem.badgeUi === "CONSULTORIA" ? (
                      <View style={styles.digitalLocation}>
                        <Ionicons name="phone-portrait-outline" size={14} color={ORANGE_NEON} />
                        <Text style={styles.cardLocationDigital}> Treino 100% pelo Celular</Text>
                      </View>
                    ) : (
                      <View style={styles.digitalLocation}>
                        <Ionicons name="location-outline" size={14} color={ORANGE_NEON} />
                        <Text style={styles.cardLocation}>
                          {formatarBairroCidade(currentItem.cidade, currentItem.bairro)} {currentItem.distanciaReal ? `- ${currentItem.distanciaReal.toFixed(1)}km` : ""}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardBio} numberOfLines={3}>
                  {currentItem.descricao || "Profissional focado em resultados, pronto para te ajudar a alcançar sua melhor versão de forma eficiente."}
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
                  activeOpacity={0.8} 
                  onPress={() => actions.verPerfilCompleto(currentItem.id)}
                >
                  <Text style={styles.btnActionTextNeon}>Ver perfil completo</Text>
                  <Ionicons name="arrow-forward" size={18} color={ORANGE_NEON} style={styles.neonGlow} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.navigationRow}>
              <TouchableOpacity onPress={actions.prevPersonal} disabled={!hasPrev} style={[styles.navButton, !hasPrev && styles.navButtonDisabled]} activeOpacity={0.7}>
                <Ionicons name="close" size={30} color={hasPrev ? "#A0A0A5" : "#333"} />
              </TouchableOpacity>

              <View style={styles.navCounterPill}>
                <Text style={styles.navCounterText}>{state.currentIndex + 1} DE {state.personalsExibidos.length}</Text>
              </View>

              <TouchableOpacity onPress={actions.nextPersonal} disabled={!hasNext} style={[styles.navButton, !hasNext && styles.navButtonDisabled]} activeOpacity={0.7}>
                <Ionicons name="heart" size={28} color={hasNext ? ORANGE_NEON : "#333"} style={hasNext && styles.neonGlow} />
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconGlow}>
              <MaterialCommunityIcons name="radar" size={50} color={ORANGE_NEON} />
            </View>
            <Text style={styles.emptyTitle}>Buscando a Elite...</Text>
            <Text style={styles.emptyText}>Exibimos apenas profissionais com alta taxa de compatibilidade comportamental e logística com você.</Text>
            {!state.isAlunoConsultoria ? (
              <Text style={styles.emptyHint}>Dica: Aumente o raio do radar para expandir suas buscas presenciais.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal visible={state.modalVisible} transparent={true} animationType="fade" onRequestClose={actions.fecharDetalhesMatch}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Ionicons name="analytics" size={36} color={ORANGE_NEON} style={[styles.neonGlow, { marginBottom: 12 }]} />
              <Text style={styles.modalTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.modalSubtitle}>Por que {state.matchSelecionado?.nome?.split(" ")[0]} é ideal para você?</Text>
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

            <TouchableOpacity style={styles.btnModalOutlined} onPress={actions.fecharDetalhesMatch} activeOpacity={0.8}>
              <Text style={styles.btnModalTextNeon}>FECHAR ANÁLISE</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

=      <Modal visible={state.modalNovaPropostaVisivel} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#0A0A0C', borderRadius: 24, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}>
            
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: ORANGE_NEON, marginBottom: 15, overflow: 'hidden' }}>
              <Image source={{ uri: state.dadosNovaProposta?.personals?.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={{ width: '100%', height: '100%' }} />
            </View>

            <Ionicons name="mail-unread" size={32} color={ORANGE_NEON} style={{ marginBottom: 10, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }} />
            
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFF", textAlign: "center", marginBottom: 6 }}>
              Você recebeu uma proposta!
            </Text>
            
            <Text style={{ fontSize: 14, color: "#AAA", textAlign: "center", marginBottom: 25, lineHeight: 22 }}>
              {state.dadosNovaProposta?.personals?.nome?.split(" ")[0] || "O treinador"} enviou as condições da consultoria. Confira os detalhes ou converse para alinhar expectativas antes de aceitar.
            </Text>

            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity 
                style={{ width: "100%", backgroundColor: ORANGE_NEON, paddingVertical: 14, borderRadius: 12, alignItems: "center" }} 
                onPress={actions.irParaProposta} 
                activeOpacity={0.8}
              >
                <Text style={{ color: "#000", fontSize: 15, fontWeight: "bold", textTransform: "uppercase" }}>Ver Proposta Completa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ width: "100%", backgroundColor: "transparent", paddingVertical: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: ORANGE_NEON }} 
                onPress={actions.irParaChatNovaProposta} 
                activeOpacity={0.8}
              >
                <Text style={{ color: ORANGE_NEON, fontSize: 15, fontWeight: "bold", textTransform: "uppercase" }}>Conversar com o Personal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ paddingVertical: 12, alignItems: "center", marginTop: 5 }} 
                onPress={actions.fecharModalNovaProposta} 
                activeOpacity={0.6}
              >
                <Text style={{ color: "#666", fontSize: 14, fontWeight: "bold" }}>Decidir Depois</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}