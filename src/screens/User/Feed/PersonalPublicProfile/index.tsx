import React from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, StatusBar, ScrollView, Platform } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../theme/theme";
import { usePersonalPublicProfile, formatarLocalizacaoPremium, getEspecialidadeInfo } from "./usePersonalPublicProfile";
import { styles } from "./styles";

const ORANGE_NEON = "#FF6B00";

export function PersonalPublicProfile({ route, navigation }: any) {
  const { state, actions } = usePersonalPublicProfile(route, navigation);

  const { 
    loading, personal, notaMedia, avaliacoes, modalMatchVisivel, 
    statusConexao, propostaPendente, modalPropostaVisivel, precoExibido, labelPrecoExibido, matchPreCalculado, 
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

        {statusConexao === "aguardando_aluno" && (
          <View style={styles.propostaBanner}>
            <View style={styles.propostaBannerContent}>
              <Ionicons name="mail-unread" size={28} color="#00E676" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.propostaBannerTitle, { color: '#00E676' }]}>Proposta Oficial Recebida!</Text>
                <Text style={styles.propostaBannerText}>Este personal montou um plano exclusivo com valores para você.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.btnVerProposta, { backgroundColor: '#00E676' }]}
              onPress={() => actions.setModalPropostaVisivel(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnVerPropostaText}>Ver Contrato VIP</Text>
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

      {!state.fromDashboard && (
        <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.conversionFooter}>
          <Text style={styles.footerHint}>Tire suas dúvidas sem compromisso.</Text>
          <View style={styles.twinButtonsRow}>
            {personal.whatsapp_ativo !== false && (
              <TouchableOpacity style={styles.btnWhatsApp} onPress={() => actions.handleContato("whatsapp")} activeOpacity={0.85}>
                <MaterialCommunityIcons name="whatsapp" size={26} color="#FFF" />
              </TouchableOpacity>
            )}

            {statusConexao === "aguardando_aluno" ? (
              <TouchableOpacity style={[styles.btnActionSolidFull, { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: '#00E676', borderWidth: 1 }]} onPress={() => actions.setModalPropostaVisivel(true)} activeOpacity={0.85}>
                <Ionicons name="document-text" size={22} color="#00E676" />
                <Text style={[styles.btnActionSolidText, { color: '#00E676' }]}>Ver Contrato</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnActionSolidFull} onPress={() => actions.handleContato("chat")} activeOpacity={0.85}>
                <Ionicons name="chatbubbles-outline" size={22} color={ORANGE_NEON} />
                <Text style={styles.btnActionSolidText}>Iniciar Conversa</Text>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      )}

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
              <TouchableOpacity 
                style={[styles.btnReportCloseOutlined, state.fromDashboard && { flex: 1 }]} 
                onPress={() => actions.setModalMatchVisivel(false)} 
                activeOpacity={0.6}
              >
                <Text style={styles.btnReportCloseTextNeon}>Fechar Análise</Text>
              </TouchableOpacity>
              
              {!state.fromDashboard && (
                <TouchableOpacity style={styles.btnReportAction} onPress={() => actions.handleContato("chat")} activeOpacity={0.8}>
                  <Ionicons name="chatbubbles" size={18} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.btnReportActionText}>Conversar</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </BlurView>
      </Modal>

      <Modal visible={modalPropostaVisivel} transparent animationType="slide" onRequestClose={() => actions.setModalPropostaVisivel(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#0A0A0C', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderWidth: 1, borderColor: '#00E676' }}>
            
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="shield-checkmark" size={50} color="#00E676" />
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 10 }}>Proposta Recebida</Text>
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 5 }}>Analise os termos e assine digitalmente para começar seu treino.</Text>
            </View>

            <View style={{ backgroundColor: '#121214', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1E1E24' }}>
              <Text style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Valor do Investimento</Text>
              <Text style={{ color: '#00E676', fontSize: 32, fontWeight: '900', marginBottom: 15 }}>R$ {propostaPendente?.valor_mensal}</Text>
              
              <Text style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Termos do Acompanhamento</Text>
              <Text style={{ color: '#FFF', fontSize: 14, marginTop: 8, lineHeight: 22 }}>{propostaPendente?.observacoes}</Text>
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: '#00E676', paddingVertical: 18, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#00E676', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10 }} 
              onPress={actions.assinarContrato}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>ASSINAR E COMEÇAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ paddingVertical: 15, alignItems: 'center', marginTop: 10 }} onPress={() => actions.setModalPropostaVisivel(false)}>
              <Text style={{ color: '#888', fontSize: 14, fontWeight: 'bold' }}>Ainda tenho dúvidas (Chat)</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}