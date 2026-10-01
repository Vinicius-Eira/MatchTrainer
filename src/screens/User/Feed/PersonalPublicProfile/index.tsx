import React from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Dimensions, Modal, StyleSheet, StatusBar, ScrollView, Platform } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../../utils/responsive"; 
import { usePerfilPublicoPersonal, formatarLocalizacaoPremium, getEspecialidadeInfo } from "./usePersonalPublicProfile";

const { width } = Dimensions.get("window");

const ORANGE_NEON = "#FF6B00";

export default function PersonalPublicProfile({ route, navigation }: any) {
  const { state, actions } = usePerfilPublicoPersonal(route, navigation);

  const { 
    loading, personal, notaMedia, avaliacoes, modalMatchVisivel, 
    propostaPendenteId, precoExibido, labelPrecoExibido, matchPreCalculado, 
    especialidades, todasAsTags, temGaleria, fotoPerfil, modalidadesAtendidas, isPoucasVagas,
    formacao, locaisAtendimento
  } = state;

  if (loading || !personal) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        <ActivityIndicator size="large" color={ORANGE_NEON} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {isPoucasVagas && (
          <View style={styles.escassezBanner}>
            <Ionicons name="time" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.escassezText}>
              Este treinador está com <Text style={{ fontWeight: "900", color: "#FFF" }}>{personal.status_agenda.toUpperCase()}</Text>. Envie sua mensagem logo!
            </Text>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "#0D0D0D"]} style={styles.heroCoverGradient} />

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorderGlow}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} resizeMode="cover" />
            </View>

            {matchPreCalculado && (
              <TouchableOpacity style={styles.matchBadgeFloat} activeOpacity={0.9} onPress={() => actions.setModalMatchVisivel(true)}>
                <BlurView intensity={80} tint="dark" style={styles.matchBadgeGlass}>
                  <Ionicons name="flash" size={14} color={ORANGE_NEON} style={styles.neonGlowSoft} />
                  <Text style={styles.matchBadgeText}>{matchPreCalculado.matchPercentual}% COMPATÍVEL</Text>
                  <View style={styles.matchBadgeIconBg}>
                    <Ionicons name="chevron-forward" size={12} color="#000" />
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nomeText}>{personal.nome || "Profissional"}</Text>
            {personal.cref_verificado && (
              <MaterialCommunityIcons name="check-decagram" size={28} color={theme.colors.primary} style={{ marginLeft: 6 }} />
            )}
          </View>

          <View style={styles.locationEditorialRow}>
            <Octicons name="location" size={14} color={ORANGE_NEON} />
            <Text style={styles.locationEditorialText}>{formatarLocalizacaoPremium(personal.cidade, personal.bairro)}</Text>
          </View>

          {personal.cref && (
            <View style={styles.crefPillCentered}>
              <MaterialCommunityIcons name="shield-check" size={16} color={ORANGE_NEON} />
              <Text style={styles.crefNeonText}>CREF {personal.cref}</Text>
            </View>
          )}

          <View style={styles.modalidadesRow}>
            {modalidadesAtendidas.map((mod: string) => (
              <View key={mod} style={styles.modalityTag}>
                <Ionicons name={mod === "Consultoria" ? "phone-portrait" : "barbell"} size={12} color="#000" />
                <Text style={styles.modalityTagText}>{mod}</Text>
              </View>
            ))}
          </View>

          {personal.instagram && (
            <View style={styles.socialDockContainer}>
              <TouchableOpacity style={styles.btnSocialDock} onPress={() => actions.abrirRedeSocial("instagram", personal.instagram)} activeOpacity={0.7}>
                <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {propostaPendenteId && (
          <View style={styles.propostaBanner}>
            <View style={styles.propostaBannerContent}>
              <Ionicons name="mail-unread" size={28} color={ORANGE_NEON} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.propostaBannerTitle}>Você tem uma Proposta!</Text>
                <Text style={styles.propostaBannerText}>Este personal montou um plano exclusivo com valores para você.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.btnVerProposta}
              onPress={() => navigation.navigate("PropostaAluno", { conexaoId: propostaPendenteId })}
              activeOpacity={0.8}
            >
              <Text style={styles.btnVerPropostaText}>Ver Proposta VIP</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsFloatGrid}>
          <View style={styles.statFloatCard}>
            <Ionicons name="star" size={20} color={ORANGE_NEON} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue}>{notaMedia ? Number(notaMedia).toFixed(1) : "--"}</Text>
            <Text style={styles.statFloatLabel}>Avaliação</Text>
          </View>

          <View style={styles.statFloatCard}>
            <FontAwesome5 name="dumbbell" size={18} color={ORANGE_NEON} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue} adjustsFontSizeToFit numberOfLines={1}>
              {personal.tempo_experiencia?.split(" ")[0] || "--"}
            </Text>
            <Text style={styles.statFloatLabel}>Experiência</Text>
          </View>

          <View style={styles.statFloatCard}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={ORANGE_NEON} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue} adjustsFontSizeToFit numberOfLines={1}>R$ {precoExibido}</Text>
            <Text style={styles.statFloatLabel}>{labelPrecoExibido}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderTitle}>
            <View style={styles.iconAccentBg}>
              <Ionicons name="person" size={18} color={ORANGE_NEON} />
            </View>
            <Text style={styles.cardHeaderTitle}>Sobre Mim</Text>
          </View>

          <View style={styles.aboutCard}>
            <FontAwesome5 name="quote-left" size={60} color="rgba(255, 107, 0, 0.05)" style={styles.quoteWatermark} />
            <Text style={styles.aboutTextPremium}>{personal.descricao || "Este profissional ainda não adicionou uma descrição sobre seu trabalho. Entre em contato para saber mais detalhes!"}</Text>
          </View>
        </View>

        {formacao && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <Ionicons name="school" size={18} color={ORANGE_NEON} />
              </View>
              <Text style={styles.cardHeaderTitle}>Formação Acadêmica</Text>
            </View>
            <View style={styles.aboutCard}>
              <Text style={[styles.aboutTextPremium, { paddingTop: 0, color: "#DDD" }]}>{formacao}</Text>
            </View>
          </View>
        )}

        {todasAsTags.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <Ionicons name="analytics" size={18} color={ORANGE_NEON} />
              </View>
              <Text style={styles.cardHeaderTitle}>Foco & Especificidades</Text>
            </View>

            <View style={styles.specialtiesColumn}>
              {todasAsTags.map((tag: string, idx: number) => {
                const info = getEspecialidadeInfo(tag);
                return (
                  <View key={`spec-${idx}`} style={styles.specialtyDetailCard}>
                    <View style={styles.specialtyIconBg}>
                      <FontAwesome5 name={info.icon} size={18} color={ORANGE_NEON} />
                    </View>
                    <View style={styles.specialtyTextWrap}>
                      <Text style={styles.specialtyTitle}>{info.title}</Text>
                      <Text style={styles.specialtyDesc}>{info.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {locaisAtendimento.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <FontAwesome5 name="map-marked-alt" size={16} color={ORANGE_NEON} />
              </View>
              <Text style={styles.cardHeaderTitle}>Locais de Atendimento</Text>
            </View>
            <View style={styles.tagsContainer}>
              {locaisAtendimento.map((local: string, index: number) => (
                <View key={index} style={styles.localTag}>
                  <Text style={styles.localTagText}>{local}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(especialidades?.diferenciais || especialidades?.resultados) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={ORANGE_NEON} />
              </View>
              <Text style={styles.cardHeaderTitle}>Por que treinar comigo?</Text>
            </View>

            <View style={styles.diferenciaisRow}>
              {especialidades?.diferenciais && (
                <View style={[styles.achievementCard, { flex: 1, marginRight: 6 }]}>
                  <View style={styles.achievementHeader}>
                    <Ionicons name="diamond" size={18} color={ORANGE_NEON} />
                    <Text style={styles.achievementTitle}>Diferencial</Text>
                  </View>
                  <Text style={styles.achievementText}>{especialidades.diferenciais}</Text>
                </View>
              )}

              {especialidades?.resultados && (
                <View style={[styles.achievementCard, { flex: 1, marginLeft: 6 }]}>
                  <View style={styles.achievementHeader}>
                    <Ionicons name="trophy" size={18} color={ORANGE_NEON} />
                    <Text style={styles.achievementTitle}>Resultados</Text>
                  </View>
                  <Text style={styles.achievementText}>{especialidades.resultados}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {temGaleria && (
          <View style={styles.galleryContainer}>
            <View style={[styles.sectionHeaderTitle, { paddingHorizontal: 20 }]}>
              <View style={styles.iconAccentBg}>
                <Ionicons name="images" size={18} color={ORANGE_NEON} />
              </View>
              <Text style={styles.cardHeaderTitle}>Portfólio</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {personal.galeria_fotos.map((foto: string, index: number) => (
                <TouchableOpacity key={index} style={styles.galleryItemContainer} activeOpacity={0.9}>
                  <Image source={{ uri: foto }} style={styles.galleryImageFull} resizeMode="cover" />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.galleryOverlay}>
                    <Ionicons name="expand-outline" size={20} color="#FFF" style={styles.galleryIconExpand} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
          <View style={styles.sectionHeaderTitle}>
            <View style={styles.iconAccentBg}>
              <Ionicons name="chatbox-ellipses" size={18} color={ORANGE_NEON} />
            </View>
            <Text style={styles.cardHeaderTitle}>O que dizem sobre mim</Text>
          </View>

          {avaliacoes.length === 0 ? (
            <View style={styles.luxuryEmptyState}>
              <Ionicons name="star-outline" size={40} color="rgba(255,107,0,0.2)" style={{ marginBottom: 12 }} />
              <Text style={styles.luxuryEmptyTitle}>Padrão de Excelência</Text>
              <Text style={styles.luxuryEmptyText}>As avaliações ficarão visíveis após a conclusão do primeiro ciclo dos alunos.</Text>
            </View>
          ) : (
            <View style={{ marginTop: 5 }}>
              {avaliacoes.map((av: any) => (
                <View key={av.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarLetter}>{av.usuarios?.nome ? av.usuarios.nome.charAt(0).toUpperCase() : "A"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{av.usuarios?.nome || "Aluno Match Trainer"}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={13} color={ORANGE_NEON} style={{ marginRight: 2 }} />
                        ))}
                      </View>
                    </View>
                  </View>
                  {av.comentario && <Text style={styles.reviewText}>{av.comentario}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.conversionFooter}>
        <Text style={styles.footerHint}>Tire suas dúvidas sem compromisso.</Text>
        <View style={styles.twinButtonsRow}>
          {personal.whatsapp_ativo !== false && (
            <TouchableOpacity style={styles.btnWhatsApp} onPress={() => actions.handleContato("whatsapp")} activeOpacity={0.85}>
              <MaterialCommunityIcons name="whatsapp" size={26} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnActionSolidFull} onPress={() => actions.handleContato("chat")} activeOpacity={0.85}>
            <Ionicons name="chatbubbles-outline" size={22} color={ORANGE_NEON} />
            <Text style={styles.btnActionSolidText}>Iniciar Conversa</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <Modal visible={modalMatchVisivel} transparent={true} animationType="fade" onRequestClose={() => actions.setModalMatchVisivel(false)}>
        <BlurView intensity={100} tint="dark" style={styles.modalMatchOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => actions.setModalMatchVisivel(false)} />
          <View style={styles.matchReportCard}>
            
            <View style={styles.matchReportHeader}>
              <Ionicons name="flash" size={32} color={ORANGE_NEON} style={[styles.neonGlowSoft, { marginBottom: 10 }]} />
              <Text style={styles.matchReportTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.matchReportSubtitle}>Por que <Text style={{ color: "#FFF" }}>{personal?.nome?.split(" ")[0]}</Text> é o treinador ideal para você?</Text>
            </View>

            <View style={styles.scoreRingContainer}>
             <View style={styles.scoreRing}>
              <Text style={styles.scoreText}>{matchPreCalculado?.matchPercentual}%</Text>
              <Text style={styles.scoreLabel}>MATCH</Text>
             </View>
            </View>

            <ScrollView style={styles.matchReasonsScroll} showsVerticalScrollIndicator={false}>
              {matchPreCalculado?.matchMotivos?.map((motivo: any, index: number) => {
                return (
                  <View key={index} style={styles.reasonCard}>
                    <View style={styles.reasonIconBox}>
                      <Text style={{ fontSize: 16 }}>{motivo.icone}</Text>
                    </View>
                    <View style={styles.reasonTextWrap}>
                      <Text style={styles.reasonText}>{motivo.texto}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.matchReportFooter}>
              <TouchableOpacity style={styles.btnReportCloseOutlined} onPress={() => actions.setModalMatchVisivel(false)} activeOpacity={0.6}>
                <Text style={styles.btnReportCloseTextNeon}>Fechar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.btnReportAction} onPress={() => actions.handleContato("chat")} activeOpacity={0.8}>
                <Ionicons name="chatbubbles" size={18} color="#000" style={{ marginRight: 6 }} />
                <Text style={styles.btnReportActionText}>Conversar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </BlurView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D0D" },
  scrollContent: { paddingBottom: verticalScale(180) },

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), left: scale(20), zIndex: 100 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: scale(44), height: scale(44), borderRadius: moderateScale(22), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },

  escassezBanner: { flexDirection: "row", backgroundColor: "#FF3B30", paddingVertical: verticalScale(12), paddingHorizontal: scale(20), justifyContent: "center", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), zIndex: 90 },
  escassezText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "600", flexShrink: 1 },

  heroSection: { alignItems: "center", paddingTop: verticalScale(40), paddingBottom: verticalScale(15), position: "relative" },
  heroCoverGradient: { position: "absolute", top: 0, width: "100%", height: verticalScale(280), opacity: 0.8 },

  avatarWrapper: { position: "relative", marginBottom: verticalScale(20), zIndex: 2 },
  avatarBorderGlow: { padding: scale(4), borderRadius: moderateScale(100), backgroundColor: "#000", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  avatarImage: { width: scale(160), height: scale(160), borderRadius: moderateScale(80), borderWidth: 1.5, borderColor: "rgba(255,107,0,0.5)" },

  matchBadgeFloat: { position: "absolute", bottom: verticalScale(-12), alignSelf: "center", borderRadius: moderateScale(20), overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,107,0,0.5)" },
  matchBadgeGlass: { flexDirection: "row", alignItems: "center", gap: scale(6), paddingLeft: scale(14), paddingRight: scale(6), paddingVertical: verticalScale(6), backgroundColor: "rgba(0,0,0,0.8)" },
  matchBadgeText: { color: ORANGE_NEON, fontSize: moderateScale(11), fontWeight: "900", letterSpacing: 0.5 },
  matchBadgeIconBg: { backgroundColor: ORANGE_NEON, width: scale(22), height: scale(22), borderRadius: moderateScale(11), justifyContent: "center", alignItems: "center", marginLeft: scale(4) },
  neonGlowSoft: { textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },

  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(6), marginTop: verticalScale(15) },
  nomeText: { fontFamily: theme.fonts.title, fontSize: moderateScale(32), color: "#FFF", textAlign: "center", letterSpacing: -0.5 },

  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(6), marginBottom: verticalScale(12) },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#AAA", letterSpacing: 0.5, fontWeight: "500" },

  crefPillCentered: { flexDirection: "row", alignItems: "center", alignSelf: "center", backgroundColor: "#111", paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", marginBottom: verticalScale(20), gap: scale(6) },
  crefNeonText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "700", letterSpacing: 1 },

  modalidadesRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(10), marginBottom: verticalScale(20) },
  modalityTag: { flexDirection: "row", alignItems: "center", backgroundColor: ORANGE_NEON, paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), gap: scale(6) },
  modalityTagText: { color: "#000", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },

  socialDockContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(14) },
  btnSocialDock: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },

  propostaBanner: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)", borderRadius: moderateScale(16), marginHorizontal: scale(20), marginTop: verticalScale(10), marginBottom: verticalScale(20), padding: scale(16), zIndex: 10 },
  propostaBannerContent: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(12) },
  propostaBannerTitle: { color: ORANGE_NEON, fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
  propostaBannerText: { color: "#FFF", fontSize: moderateScale(13), marginTop: verticalScale(2), lineHeight: moderateScale(18) },
  btnVerProposta: { backgroundColor: ORANGE_NEON, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(12), borderRadius: moderateScale(12), gap: scale(8) },
  btnVerPropostaText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase" },

  statsFloatGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: scale(20), marginBottom: verticalScale(40), gap: scale(10) },
  statFloatCard: { flex: 1, backgroundColor: "#111", paddingVertical: verticalScale(16), paddingHorizontal: scale(4), borderRadius: moderateScale(20), alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.15)" },
  statFloatIcon: { marginBottom: verticalScale(8) },
  statFloatValue: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "900", fontFamily: theme.fonts.title, letterSpacing: -0.2, textAlign: "center" },
  statFloatLabel: { color: "#888", fontSize: moderateScale(10), marginTop: verticalScale(4), textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "700" },

  sectionContainer: { marginHorizontal: scale(20), marginBottom: verticalScale(35) },
  sectionHeaderTitle: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  iconAccentBg: { width: scale(34), height: scale(34), borderRadius: moderateScale(10), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: moderateScale(20), fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  aboutCard: { backgroundColor: "#111", padding: scale(24), borderRadius: moderateScale(24), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  quoteWatermark: { position: "absolute", top: verticalScale(-5), left: scale(10) },
  aboutTextPremium: { fontFamily: theme.fonts.body, fontSize: moderateScale(15), color: "#BBB", lineHeight: moderateScale(26), zIndex: 1, paddingTop: verticalScale(15) },

  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  localTag: { backgroundColor: "#1A1A1A", paddingHorizontal: scale(14), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "#333" },
  localTagText: { color: "#DDD", fontSize: moderateScale(13), fontWeight: "600" },

  specialtiesColumn: { gap: verticalScale(12) },
  specialtyDetailCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222" },
  specialtyIconBg: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.08)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)" },
  specialtyTextWrap: { flex: 1 },
  specialtyTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4), letterSpacing: 0.3 },
  specialtyDesc: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(18) },

  diferenciaisRow: { flexDirection: "row", justifyContent: "space-between" },
  achievementCard: { backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", position: "relative", overflow: "hidden" },
  achievementHeader: { flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: verticalScale(10) },
  achievementTitle: { color: ORANGE_NEON, fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  achievementText: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(22) },

  galleryContainer: { marginBottom: verticalScale(35) },
  galleryScroll: { gap: scale(16), paddingHorizontal: scale(20) },
  galleryItemContainer: { width: scale(300), height: verticalScale(320), backgroundColor: "#111", borderRadius: moderateScale(24), overflow: "hidden", borderWidth: 1, borderColor: "#222" },
  galleryImageFull: { width: "100%", height: "100%" },
  galleryOverlay: { position: "absolute", bottom: 0, width: "100%", height: verticalScale(100), justifyContent: "flex-end", padding: scale(15), alignItems: "flex-end" },
  galleryIconExpand: { backgroundColor: "rgba(0,0,0,0.5)", padding: scale(8), borderRadius: moderateScale(20), overflow: "hidden" },

  luxuryEmptyState: { backgroundColor: "#111", borderRadius: moderateScale(24), padding: scale(35), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#222", borderStyle: "dashed" },
  luxuryEmptyTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: moderateScale(18), marginBottom: verticalScale(8) },
  luxuryEmptyText: { color: "#666", fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22) },

  reviewCard: { backgroundColor: "#111", padding: scale(20), borderRadius: moderateScale(20), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(14) },
  reviewAvatar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "#333" },
  reviewAvatarLetter: { color: "#888", fontSize: moderateScale(18), fontWeight: "bold", fontFamily: theme.fonts.title },
  reviewName: { color: "#FFF", fontWeight: "bold", fontSize: moderateScale(15), marginBottom: verticalScale(4) },
  reviewStars: { flexDirection: "row" },
  reviewText: { color: "#BBB", fontSize: moderateScale(15), fontStyle: "italic", lineHeight: moderateScale(24) },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingTop: verticalScale(15), paddingBottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  twinButtonsRow: { flexDirection: "row", gap: scale(12) },
  btnWhatsApp: { backgroundColor: "#25D366", width: scale(60), height: scale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center", shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
  
  btnActionSolidFull: { flex: 1, backgroundColor: "rgba(255, 107, 0, 0.1)", height: verticalScale(60), borderRadius: moderateScale(18), flexDirection: "row", justifyContent: "center", alignItems: "center", gap: scale(8), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },
  btnActionSolidText: { color: ORANGE_NEON, fontSize: moderateScale(15), fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  footerHint: { color: "#888", fontSize: moderateScale(12), textAlign: "center", fontWeight: "600", marginBottom: verticalScale(12), letterSpacing: 0.5 },

  modalMatchOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", padding: 20 },
  matchReportCard: { width: "100%", backgroundColor: "#111", borderRadius: moderateScale(28), padding: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(30) : verticalScale(24), borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  
  matchReportHeader: { alignItems: "center", marginBottom: verticalScale(25) },
  scoreRingContainer: { alignItems: "center", marginBottom: verticalScale(25) },
  scoreRing: { width: scale(120), height: scale(120), borderRadius: moderateScale(60), borderWidth: 2, borderColor: ORANGE_NEON, justifyContent: "center", alignItems: "center", shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, backgroundColor: "rgba(255,107,0,0.05)" },
  scoreText: { color: ORANGE_NEON, fontSize: moderateScale(38), fontWeight: "900", textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 3 },
  scoreLabel: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "bold", marginTop: verticalScale(-2), letterSpacing: 1 },
  
  matchReportTitle: { color: "#FFF", fontSize: moderateScale(22), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5, textAlign: "center" },
  matchReportSubtitle: { color: "#888", fontSize: moderateScale(14), textAlign: "center", paddingHorizontal: scale(10), lineHeight: moderateScale(20) },

  matchReasonsScroll: { width: "100%", marginBottom: verticalScale(20), maxHeight: verticalScale(250) },
  reasonCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A1A1A", padding: scale(16), borderRadius: moderateScale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#222" },
  reasonIconBox: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  reasonTextWrap: { flex: 1 },
  reasonText: { color: "#DDD", fontSize: moderateScale(14), lineHeight: moderateScale(20) },

  matchReportFooter: { flexDirection: "row", gap: scale(12), marginTop: verticalScale(10) },
  
  btnReportCloseOutlined: { flex: 1, height: verticalScale(56), borderRadius: moderateScale(16), backgroundColor: "transparent", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: ORANGE_NEON, shadowColor: ORANGE_NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5 },
  btnReportCloseTextNeon: { color: ORANGE_NEON, fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1, textShadowColor: ORANGE_NEON, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  
  btnReportAction: { flex: 1, height: verticalScale(56), borderRadius: moderateScale(16), backgroundColor: ORANGE_NEON, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  btnReportActionText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase" },
});