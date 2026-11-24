import React from "react";
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
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Authority } from "./Authority";
import { Profile } from "./Profile";
import { Results } from "./Results";
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

  const {
    isOwner,
    loading,
    personal,
    corDestaque,
    abaAtiva,
    notaMedia,
    avaliacoes,
    publicacoes,
    formacoes,
    depoimentosFixadosIds,
    vitrineConfig,
    dnaAtendimento,
    modalMatchVisivel,
    temPropostaPendente,
    propostaPendente,
    modalPropostaVisivel,
    precoExibido,
    labelPrecoExibido,
    matchPreCalculado,
    especialidades,
    todasAsTags,
    turnosFormatados,
    fotoPerfil,
    capaUrl,
    modalidadesAtendidas,
    isPoucasVagas,
    locaisAtendimento,
  } = state;

  const accent = corDestaque || "#FF6B00";
  const accentSoft = hexToRgba(accent, 0.13);
  const accentBorder = hexToRgba(accent, 0.42);

  if (loading || !personal) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#040406" />
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  const temAmbosPrecos =
    Boolean(personal.preco_consultoria) &&
    Boolean(personal.preco_presencial) &&
    modalidadesAtendidas.length > 1;
  const expCurta = personal.tempo_experiencia ? personal.tempo_experiencia.split(" ")[0] : "Pro";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.topBarAbsolute}>
        <TouchableOpacity style={styles.btnHeaderIcon} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </TouchableOpacity>

        {!isOwner && matchPreCalculado ? (
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
          <View style={styles.previewPillTop}>
            <View style={styles.previewPillDot} />
            <Text style={styles.previewPillTopText}>VISUALIZAÇÃO DO ALUNO</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.coverBox}>
          {capaUrl ? (
            <Image source={{ uri: capaUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[hexToRgba(accent, 0.42), "#14141E", "#040406"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coverImage}
            />
          )}
          <LinearGradient colors={["rgba(4,4,6,0.55)", "transparent"]} style={styles.coverTopFade} />
          <LinearGradient colors={["transparent", "rgba(4,4,6,0.75)", "#040406"]} style={styles.coverBottomFade} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarHalo, { backgroundColor: hexToRgba(accent, 0.16) }]} />
            <View style={[styles.avatarRing, { borderColor: accent }]}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImg} resizeMode="cover" />
            </View>
            <View style={styles.avatarStatusBadge}>
              {personal.cref_verificado ? (
                <MaterialCommunityIcons name="check-decagram" size={20} color="#00E676" />
              ) : (
                <View style={[styles.onlineDot, { backgroundColor: isPoucasVagas ? "#FF3B30" : "#00E676" }]} />
              )}
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nomeText}>{personal.nome || "Profissional"}</Text>
          </View>

          <Text style={styles.headlineText} numberOfLines={3}>
            {personal.headline ||
              personal.descricao ||
              "Personal Trainer no MatchTrainer • Treino sob medida para o seu objetivo."}
          </Text>

          <View style={styles.quickInfoRow}>
            {personal.cref ? (
              <View
                style={[
                  styles.quickInfoPill,
                  {
                    borderColor: personal.cref_verificado ? "rgba(0, 230, 118, 0.4)" : accentBorder,
                    backgroundColor: personal.cref_verificado ? "rgba(0, 230, 118, 0.08)" : accentSoft,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={personal.cref_verificado ? "#00E676" : accent}
                />
                <Text style={styles.quickInfoText}>CREF {personal.cref}</Text>
              </View>
            ) : null}

            <View style={styles.quickInfoPill}>
              <Ionicons name="location" size={13} color={accent} />
              <Text style={styles.quickInfoText}>
                {formatarLocalizacaoPremium(personal.cidade, personal.bairro)}
              </Text>
            </View>

            {personal.instagram ? (
              <TouchableOpacity
                style={styles.btnSocialMini}
                onPress={() => actions.abrirRedeSocial("instagram", personal.instagram)}
                activeOpacity={0.75}
              >
                <Ionicons name="logo-instagram" size={16} color="#FFF" />
              </TouchableOpacity>
            ) : null}

            {personal.tiktok ? (
              <TouchableOpacity
                style={styles.btnSocialMini}
                onPress={() => actions.abrirRedeSocial("tiktok", personal.tiktok)}
                activeOpacity={0.75}
              >
                <FontAwesome5 name="tiktok" size={13} color="#FFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.kpiRow}>
            <TouchableOpacity
              style={styles.kpiItem}
              onPress={() => actions.setAbaAtiva("depoimentos")}
              activeOpacity={0.75}
            >
              <View style={styles.kpiValueRow}>
                <Ionicons name="star" size={14} color={accent} />
                <Text style={styles.kpiValue}>{notaMedia > 0 ? notaMedia.toFixed(1) : "Novo"}</Text>
              </View>
              <Text style={styles.kpiLabel}>
                {avaliacoes.length > 0 ? `${avaliacoes.length} aval.` : "Avaliação"}
              </Text>
            </TouchableOpacity>

            <View style={styles.kpiDivider} />

            <View style={styles.kpiItem}>
              <View style={styles.kpiValueRow}>
                <Ionicons name="barbell-outline" size={14} color={accent} />
                <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>
                  {expCurta}
                </Text>
              </View>
              <Text style={styles.kpiLabel}>Experiência</Text>
            </View>

            <View style={styles.kpiDivider} />

            <View style={styles.kpiItem}>
              <View style={styles.kpiValueRow}>
                <Ionicons
                  name={isPoucasVagas ? "time-outline" : "checkmark-circle-outline"}
                  size={14}
                  color={isPoucasVagas ? "#FF3B30" : "#00E676"}
                />
                <Text
                  style={[styles.kpiValue, { color: isPoucasVagas ? "#FF3B30" : "#00E676" }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {personal.status_agenda || "Disponível"}
                </Text>
              </View>
              <Text style={styles.kpiLabel}>Agenda</Text>
            </View>
          </View>

          <View style={styles.investCard}>
            <View style={styles.investHeader}>
              <View style={styles.investHeaderLeft}>
                <View style={[styles.investIconBox, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                  <Ionicons name="wallet-outline" size={15} color={accent} />
                </View>
                <Text style={styles.investHeaderTitle}>Investimento</Text>
              </View>

              <View style={styles.modalidadesRow}>
                {modalidadesAtendidas.map((mod) => (
                  <View key={mod} style={[styles.modBadge, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
                    <Ionicons
                      name={mod === "Consultoria" ? "phone-portrait-outline" : "barbell-outline"}
                      size={11}
                      color={accent}
                    />
                    <Text style={[styles.modBadgeText, { color: accent }]}>{mod}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.pricesGrid}>
              {temAmbosPrecos ? (
                <>
                  <View style={styles.priceTile}>
                    <Text style={styles.priceTileLabel}>Consultoria Online</Text>
                    <View style={styles.priceTileValRow}>
                      <Text style={[styles.priceTileVal, { color: accent }]}>R$ {personal.preco_consultoria}</Text>
                      <Text style={styles.priceTileUnit}>/mês</Text>
                    </View>
                  </View>

                  <View style={styles.priceTile}>
                    <Text style={styles.priceTileLabel}>Presencial</Text>
                    <View style={styles.priceTileValRow}>
                      <Text style={styles.priceTileVal}>R$ {personal.preco_presencial}</Text>
                      <Text style={styles.priceTileUnit}>/aula</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.priceTile}>
                  <Text style={styles.priceTileLabel}>{labelPrecoExibido}</Text>
                  <View style={styles.priceTileValRow}>
                    <Text style={[styles.priceTileVal, { color: accent }]}>
                      {precoExibido === "--" ? "Sob consulta" : `R$ ${precoExibido}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {modalidadesAtendidas.includes("Presencial") && turnosFormatados.length > 0 ? (
              <View style={styles.turnosRow}>
                <Ionicons name="time-outline" size={15} color={accent} />
                <Text style={styles.turnosText} numberOfLines={1}>
                  Turnos presenciais: {turnosFormatados.join(" • ")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {!isOwner && temPropostaPendente ? (
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
        ) : null}

        <View style={styles.tabContainer}>
          {[
            { id: "autoridade" as AbaVitrine, label: "Perfil", icon: "person-outline" },
            { id: "resultados" as AbaVitrine, label: "Resultados", icon: "grid-outline" },
            { id: "depoimentos" as AbaVitrine, label: `Avaliações (${avaliacoes.length})`, icon: "star-outline" },
          ].map((tab) => {
            const ativa = abaAtiva === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, ativa && { backgroundColor: accentSoft, borderColor: accentBorder }]}
                onPress={() => actions.setAbaAtiva(tab.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={tab.icon as any} size={15} color={ativa ? accent : "#71717A"} />
                <Text style={[styles.tabText, ativa && { color: accent, fontWeight: "900" }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {abaAtiva === "autoridade" ? (
          <Authority
            personal={personal}
            corDestaque={accent}
            vitrineConfig={vitrineConfig}
            formacoes={formacoes}
            todasAsTags={todasAsTags}
            locaisAtendimento={locaisAtendimento}
            dnaAtendimento={dnaAtendimento}
            diferenciaisLegacy={especialidades?.diferenciais}
          />
        ) : null}

        {abaAtiva === "resultados" ? (
          <Results publicacoes={publicacoes} isOwner={false} onPublicarNovo={() => {}} />
        ) : null}

        {abaAtiva === "depoimentos" ? (
          <Testimonials
            notaMedia={notaMedia}
            avaliacoes={avaliacoes}
            depoimentosFixadosIds={depoimentosFixadosIds}
          />
        ) : null}
      </ScrollView>

      <BlurView
        intensity={Platform.OS === "ios" ? 85 : 100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={styles.footerBlur}
      >
        {isOwner ? (
          <View style={styles.ownerViewFooter}>
            <View style={styles.ownerViewInfo}>
              <Ionicons name="eye-outline" size={18} color={accent} />
              <Text style={styles.ownerViewText}>
                Visualização exata do aluno. Para alterar dados ou vitrine, use Editar Perfil.
              </Text>
            </View>
            <TouchableOpacity style={styles.btnOwnerBack} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.btnOwnerBackText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerRow}>
            {personal.whatsapp_ativo !== false ? (
              <TouchableOpacity
                style={styles.btnWhatsApp}
                onPress={() => actions.handleContato("whatsapp")}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="whatsapp" size={24} color="#00E676" />
              </TouchableOpacity>
            ) : null}

            {temPropostaPendente ? (
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
        destaqueAberto={null}
        onFecharDestaque={() => {}}
        modalMatchVisivel={modalMatchVisivel}
        onFecharMatch={() => actions.setModalMatchVisivel(false)}
        matchPreCalculado={matchPreCalculado}
        onIniciarChat={() => actions.handleContato("chat")}
        modalPropostaVisivel={modalPropostaVisivel}
        onFecharProposta={() => actions.setModalPropostaVisivel(false)}
        propostaPendente={propostaPendente}
        onAssinarContrato={actions.assinarContrato}
      />
    </View>
  );
}