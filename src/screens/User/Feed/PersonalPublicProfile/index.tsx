import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Authority } from "./Authority";
import { Profile } from "./Profile";
import { PublishResult } from "./PublishResult";
import { Results } from "./Results";
import { ModalEditorVitrine } from "./ShowCase";
import { styles } from "./styles";
import { Testimonials } from "./Testimonials";
import {
  AbaVitrine,
  formatarLocalizacaoPremium,
  hexToRgba,
  usePersonalPublicProfile,
} from "./usePersonalPublicProfile";

export function PersonalPublicProfile({ route, navigation }: any) {
  const { state, actions } = usePersonalPublicProfile(route, navigation);
  const [editorVisivel, setEditorVisivel] = useState(false);
  const [publicarVisivel, setPublicarVisivel] = useState(false);

  const {
    isOwner,
    loading,
    personal,
    corDestaque,
    abaAtiva,
    notaMedia,
    avaliacoes,
    publicacoes,
    destaquesExibidos,
    destaqueAberto,
    formacoes,
    depoimentosFixadosIds,
    vitrineConfig,
    dnaAtendimento,
    modalMatchVisivel,
    statusConexao,
    propostaPendente,
    modalPropostaVisivel,
    precoExibido,
    labelPrecoExibido,
    matchPreCalculado,
    especialidades,
    todasAsTags,
    fotoPerfil,
    capaUrl,
    modalidadesAtendidas,
    isPoucasVagas,
    locaisAtendimento,
  } = state;

  const accent = corDestaque || "#FF6B00";
  const accentSoft = hexToRgba(accent, 0.14);
  const accentBorder = hexToRgba(accent, 0.5);

  if (loading || !personal) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

=      <View style={styles.topBarAbsolute}>
        <TouchableOpacity style={styles.btnHeaderIcon} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>

        {matchPreCalculado ? (
          <TouchableOpacity
            style={styles.matchPillTop}
            onPress={() => actions.setModalMatchVisivel(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={13} color="#FF6B00" />
            <Text style={styles.matchPillTopText}>{matchPreCalculado.matchPercentual}% MATCH</Text>
            <Ionicons name="chevron-forward" size={13} color="#FF6B00" />
          </TouchableOpacity>
        ) : isOwner ? (
          <TouchableOpacity
            style={[styles.matchPillTop, { borderColor: accent }]}
            onPress={() => setEditorVisivel(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={14} color={accent} />
            <Text style={[styles.matchPillTopText, { color: accent }]}>EDITAR VITRINE</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.coverBox}>
          {capaUrl ? (
            <Image source={{ uri: capaUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[hexToRgba(accent, 0.34), "#111115", "#000000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coverImage}
            />
          )}
          <LinearGradient colors={["transparent", "#000000"]} style={styles.coverGradient} />
        </View>

        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarStatsRow}>
            <View style={[styles.avatarRing, { borderColor: accent }]}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImg} resizeMode="cover" />
            </View>

            <View style={styles.instaStatsRow}>
              <View style={styles.instaStatItem}>
                <Text style={styles.instaStatVal}>{publicacoes.length}</Text>
                <Text style={styles.instaStatLabel}>Registros</Text>
              </View>
              <View style={styles.instaStatItem}>
                <Text style={styles.instaStatVal}>{notaMedia > 0 ? `${notaMedia.toFixed(1)}★` : "Novo"}</Text>
                <Text style={styles.instaStatLabel}>Avaliação</Text>
              </View>
              <View style={styles.instaStatItem}>
                <Text style={styles.instaStatVal} numberOfLines={1}>
                  {personal.tempo_experiencia?.split(" ")[0] || "Pro"}
                </Text>
                <Text style={styles.instaStatLabel}>Nível</Text>
              </View>
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nomeText}>{personal.nome || "Profissional"}</Text>
            {personal.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={20} color="#00E676" />}
          </View>

          {personal.headline ? (
            <Text style={styles.headlineText}>{personal.headline}</Text>
          ) : (
            <Text style={styles.headlineText} numberOfLines={2}>
              {personal.descricao || "Personal Trainer no MatchTrainer • Treino sob medida para o seu objetivo."}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Octicons name="location" size={12} color={accent} />
              <Text style={styles.metaChipText}>{formatarLocalizacaoPremium(personal.cidade, personal.bairro)}</Text>
            </View>
            {personal.cref ? (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name="shield-check-outline" size={13} color={accent} />
                <Text style={styles.metaChipText}>CREF {personal.cref}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.pillsActionRow}>
            <View style={styles.modalidadesWrap}>
              {modalidadesAtendidas.map((mod) => (
                <View key={mod} style={[styles.modPill, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                  <Ionicons
                    name={mod === "Consultoria" ? "phone-portrait-outline" : "barbell-outline"}
                    size={12}
                    color={accent}
                  />
                  <Text style={[styles.modPillText, { color: accent }]}>{mod}</Text>
                </View>
              ))}
            </View>

            <View style={styles.socialRow}>
              {personal.instagram ? (
                <TouchableOpacity
                  style={styles.btnSocial}
                  onPress={() => actions.abrirRedeSocial("instagram", personal.instagram)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="logo-instagram" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : null}
              {personal.tiktok ? (
                <TouchableOpacity
                  style={styles.btnSocial}
                  onPress={() => actions.abrirRedeSocial("tiktok", personal.tiktok)}
                  activeOpacity={0.75}
                >
                  <FontAwesome5 name="tiktok" size={15} color="#FFF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.precoEscassezRow}>
            <View>
              <Text style={styles.precoLabel}>{labelPrecoExibido}</Text>
              <Text style={styles.precoVal}>{precoExibido === "--" ? "Sob consulta" : `R$ ${precoExibido}`}</Text>
            </View>

            <View
              style={[
                styles.agendaBadge,
                isPoucasVagas
                  ? { backgroundColor: "rgba(255, 59, 48, 0.12)", borderColor: "rgba(255, 59, 48, 0.45)" }
                  : { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.4)" },
              ]}
            >
              <Ionicons
                name={isPoucasVagas ? "time-outline" : "checkmark-circle-outline"}
                size={13}
                color={isPoucasVagas ? "#FF3B30" : "#00E676"}
              />
              <Text style={[styles.agendaBadgeText, { color: isPoucasVagas ? "#FF3B30" : "#00E676" }]}>
                {personal.status_agenda || "Disponível"}
              </Text>
            </View>
          </View>
        </View>

        {!isOwner && statusConexao === "aguardando_aluno" && (
          <TouchableOpacity
            style={styles.propostaBanner}
            onPress={() => actions.setModalPropostaVisivel(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text" size={24} color="#00E676" />
            <View style={{ flex: 1 }}>
              <Text style={styles.propostaBannerTitle}>Proposta Oficial Recebida!</Text>
              <Text style={styles.propostaBannerSub}>Toque para ver os termos e assinar seu acompanhamento.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#00E676" />
          </TouchableOpacity>
        )}

=        <View style={styles.highlightsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsScroll}>
            {destaquesExibidos.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.highlightItem}
                onPress={() => actions.setDestaqueAberto(dest)}
                activeOpacity={0.8}
              >
                <View style={[styles.highlightCircle, { borderColor: accent }]}>
                  {dest.imagem_url ? (
                    <Image source={{ uri: dest.imagem_url }} style={styles.highlightImg} resizeMode="cover" />
                  ) : (
                    <Ionicons name={(dest.icone as any) || "flame"} size={22} color={accent} />
                  )}
                </View>
                <Text style={styles.highlightLabel} numberOfLines={1}>
                  {dest.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

=        <View style={styles.tabsBar}>
          {[
            { id: "resultados" as AbaVitrine, label: "Resultados", icon: "grid-outline" },
            { id: "autoridade" as AbaVitrine, label: "Autoridade", icon: "ribbon-outline" },
            { id: "depoimentos" as AbaVitrine, label: `Avaliações (${avaliacoes.length})`, icon: "star-outline" },
          ].map((tab) => {
            const ativa = abaAtiva === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, ativa && { borderBottomColor: accent }]}
                onPress={() => actions.setAbaAtiva(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={tab.icon as any} size={15} color={ativa ? accent : "#71717A"} />
                <Text style={[styles.tabText, ativa && { color: accent, fontWeight: "900" }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {abaAtiva === "resultados" && (
          <Results
            publicacoes={publicacoes}
            isOwner={isOwner}
            onPublicarNovo={() => setPublicarVisivel(true)}
          />
        )}

        {abaAtiva === "autoridade" && (
          <Authority
            personal={personal}
            vitrineConfig={vitrineConfig}
            formacoes={formacoes}
            todasAsTags={todasAsTags}
            locaisAtendimento={locaisAtendimento}
            dnaAtendimento={dnaAtendimento}
            diferenciaisLegacy={especialidades?.diferenciais}
          />
        )}

        {abaAtiva === "depoimentos" && (
          <Testimonials
            notaMedia={notaMedia}
            avaliacoes={avaliacoes}
            depoimentosFixadosIds={depoimentosFixadosIds}
          />
        )}
      </ScrollView>

=      <BlurView
        intensity={Platform.OS === "ios" ? 85 : 100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.footerBlur}
      >
        {isOwner ? (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.btnSecondaryFooter} onPress={() => setEditorVisivel(true)} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={17} color="#FFF" />
              <Text style={styles.btnSecondaryFooterText}>Editar Vitrine</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimaryFooter, { backgroundColor: accentSoft, borderColor: accent }]}
              onPress={() => setPublicarVisivel(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={accent} />
              <Text style={[styles.btnPrimaryFooterText, { color: accent }]}>Publicar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerRow}>
            {personal.whatsapp_ativo !== false && (
              <TouchableOpacity
                style={styles.btnWhatsApp}
                onPress={() => actions.handleContato("whatsapp")}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="whatsapp" size={24} color="#00E676" />
              </TouchableOpacity>
            )}

            {statusConexao === "aguardando_aluno" ? (
              <TouchableOpacity
                style={[styles.btnPrimaryFooter, { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.14)" }]}
                onPress={() => actions.setModalPropostaVisivel(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={19} color="#00E676" />
                <Text style={[styles.btnPrimaryFooterText, { color: "#00E676" }]}>Ver Contrato</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btnPrimaryFooter, { backgroundColor: accentSoft, borderColor: accent }]}
                onPress={() => actions.handleContato("chat")}
                activeOpacity={0.85}
              >
                <Ionicons name="chatbubbles-outline" size={19} color={accent} />
                <Text style={[styles.btnPrimaryFooterText, { color: accent }]}>Iniciar Conversa</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </BlurView>

      <Profile
        personal={personal}
        isOwner={isOwner}
        corDestaque={accent}
        destaqueAberto={destaqueAberto}
        onFecharDestaque={() => actions.setDestaqueAberto(null)}
        modalMatchVisivel={modalMatchVisivel}
        onFecharMatch={() => actions.setModalMatchVisivel(false)}
        matchPreCalculado={matchPreCalculado}
        onIniciarChat={() => actions.handleContato("chat")}
        modalPropostaVisivel={modalPropostaVisivel}
        onFecharProposta={() => actions.setModalPropostaVisivel(false)}
        propostaPendente={propostaPendente}
        onAssinarContrato={actions.assinarContrato}
      />

      {isOwner && (
        <>
          <ModalEditorVitrine
            visible={editorVisivel}
            personal={personal}
            vitrineConfig={vitrineConfig}
            avaliacoes={avaliacoes}
            onClose={() => setEditorVisivel(false)}
            onSalvo={actions.recarregar}
          />
          <PublishResult
            visible={publicarVisivel}
            onClose={() => setPublicarVisivel(false)}
            onPublicado={() => {
              actions.setAbaAtiva("resultados");
              actions.recarregar();
            }}
          />
        </>
      )}
    </View>
  );
}