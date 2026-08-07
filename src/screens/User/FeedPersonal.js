import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

const { width: screenWidth } = Dimensions.get("window");

const formatarBairroCidade = (cidade, bairro) => {
  if (!cidade && !bairro) return "Local não informado";
  if (bairro && cidade) return `${bairro}, ${cidade}`;
  return bairro || cidade;
};

const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};

export default function FeedPersonal({ navigation }) {
  const [allPersonals, setAllPersonals] = useState([]);
  const [personalsExibidos, setPersonalsExibidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [distanciaMaxima, setDistanciaMaxima] = useState(20);

  const [modalVisible, setModalVisible] = useState(false);
  const [matchSelecionado, setMatchSelecionado] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarFeedInteligente();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarFeedInteligente = async () => {
    setCarregando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexoesAtivas, error: errConn } = await supabase
        .from("conexoes")
        .select("id")
        .eq("usuario_id", user.id) 
        .eq("status", "aluno_ativo")
        .order("atualizado_em", { ascending: false })
        .limit(1);

      if (conexoesAtivas && conexoesAtivas.length > 0) {
        navigation.reset({
          index: 0,
          routes: [{ name: "PainelMeuTreinador", params: { conexaoId: conexoesAtivas[0].id } }],
        });
        return;
      }

      const { data: matches, error: matchError } = await supabase.rpc(
        "get_match_personals",
        { p_aluno_id: user.id }
      );
      
      if (matchError) throw matchError;

      if (matches && matches.length > 0) {
        const personalIds = matches.map((m) => m.personal_id);
        const { data: perfisFull } = await supabase
          .from("personals")
          .select("*")
          .in("id", personalIds);

        const processados = await Promise.all(
          matches.map(async (m) => {
            const perfil = perfisFull?.find((p) => p.id === m.personal_id);
            if (!perfil) return null;

            const { data: nota } = await supabase.rpc("get_media_avaliacoes", {
              p_id: m.personal_id,
            });

            let motivos = [];
            const det = m.detalhes_pontuacao || {};

            if (det.peso_objetivo > 0) motivos.push({ icone: "🎯", texto: "Especialista no seu principal objetivo." });
            if (det.peso_distancia > 0) motivos.push({ icone: "📍", texto: `Apenas ${Number(m.distancia_km).toFixed(1)} km de você.` });
            if (det.peso_disponibilidade > 0) motivos.push({ icone: "🌙", texto: "Turno compatível com a sua rotina." });
            if (det.peso_preco > 0) motivos.push({ icone: "💰", texto: "Dentro da sua faixa de preço ideal." });
            if (det.peso_especialidade > 0) motivos.push({ icone: "💪", texto: "Experiência com suas necessidades e restrições." });
            if (det.peso_genero > 0) motivos.push({ icone: "✨", texto: "Bate com a sua preferência de perfil." });

            if (motivos.length === 0) motivos.push({ icone: "🤝", texto: "Perfil altamente compatível com sua busca geral." });

            let badgeUi = "HÍBRIDO";
            let iconUi = "diamond";
            
            const servicos = m.servicos_oferecidos || perfil.servicos_oferecidos || [];
            if (servicos.length === 1) {
              badgeUi = servicos[0].toUpperCase();
              iconUi = badgeUi === "CONSULTORIA" ? "phone-portrait" : "barbell";
            }

            let specs = null;
            try {
              specs = typeof perfil.especialidades === "string" ? JSON.parse(perfil.especialidades) : perfil.especialidades;
            } catch (e) {}

            return {
              ...perfil,
              id: m.personal_id,
              nota_media: nota,
              distanciaReal: Number(m.distancia_km),
              matchPercentual: m.score_compatibilidade,
              matchMotivos: motivos,
              specsParsed: specs,
              badgeUi,
              iconUi,
              precoAvaliar: m.preco_medio,
              servicosOferecidosSeguros: servicos
            };
          }),
        );

        const validos = processados.filter((p) => p !== null);
        setAllPersonals(validos);
        aplicarFiltros(validos, distanciaMaxima);
      } else {
        setAllPersonals([]);
        setPersonalsExibidos([]);
      }
    } catch (error) {
      console.log("Erro ao carregar Match:", error);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  const aplicarFiltros = (lista, maxKm) => {
    let filtrados = lista.filter((p) => {
      const servicos = p.servicosOferecidosSeguros || [];
      const isApenasConsultoria = servicos.length === 1 && servicos[0] === "Consultoria";
      
      if (isApenasConsultoria) return true;
      return p.distanciaReal <= maxKm;
    });
    setPersonalsExibidos(filtrados);
  };

  const handleSliderChange = (valor) => {
    setDistanciaMaxima(valor);
    aplicarFiltros(allPersonals, valor);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarFeedInteligente();
  }, []);

  const abrirDetalhesMatch = (personal) => {
    setMatchSelecionado(personal);
    setModalVisible(true);
  };

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          setCarregando(true);
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
        },
      },
    ]);
  };

  const renderCard = ({ item }) => {
    const idade = item.data_nascimento ? calcularIdade(item.data_nascimento) : null;
    const local = formatarBairroCidade(item.cidade, item.bairro);

    const isConsultoria = item.distanciaReal > 100;
    const distanciaStr = isConsultoria ? "📱 100% Online" : `a ${item.distanciaReal.toFixed(1)} km`;
    const corBadge = item.badgeUi === "HÍBRIDO" ? "#0A84FF" : theme.colors.primary;
    const isPoucasVagas = item.status_agenda === "Poucas Vagas" || item.status_agenda === "Quase Lotada";

    return (
      <View style={styles.premiumCardContainer}>
        <View style={styles.cardImageHeader}>
          <Image source={{ uri: item.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={styles.cardCover} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)", theme.colors.surface]} locations={[0.5, 0.8, 1]} style={StyleSheet.absoluteFillObject} />

          <View style={styles.badgeTopLeft}>
            <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
              <Ionicons name={item.iconUi} size={12} color={corBadge} style={{ marginRight: 6 }} />
              <Text style={[styles.badgeText, { color: corBadge }]}>{item.badgeUi}</Text>
            </BlurView>
          </View>

          <TouchableOpacity style={styles.badgeTopRight} activeOpacity={0.8} onPress={() => abrirDetalhesMatch(item)}>
            <BlurView intensity={80} tint="dark" style={[ styles.badgeBlur, { borderColor: "rgba(255, 107, 0, 0.4)" } ]}>
              <FontAwesome5 name="fire" size={12} color={theme.colors.primary} />
              <Text style={styles.badgeTextMatch}>{item.matchPercentual}% MATCH</Text>
            </BlurView>
          </TouchableOpacity>

          <View style={styles.imageBottomInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.trainerNamePremium} numberOfLines={1}>
                {item.nome}
                {idade && <Text style={styles.trainerAge}>, {idade}</Text>}
              </Text>
              {item.cref_verificado && (
                <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.success} style={{ marginLeft: 6 }} />
              )}
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={theme.colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {isConsultoria ? "Todo o Brasil" : local}
                {distanciaStr ? <Text style={isConsultoria ? styles.distanceTextOnline : styles.distanceText}> • {distanciaStr}</Text> : null}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContentBox}>
          {isPoucasVagas && (
            <View style={styles.agendaAlertBox}>
              <Ionicons name="time" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.agendaAlertText}>{item.status_agenda === "Quase Lotada" ? "AGENDA QUASE LOTADA" : "POUCAS VAGAS DISPONÍVEIS"}</Text>
            </View>
          )}

          <View style={[styles.bioWrapper, isPoucasVagas && { marginTop: 10 }]}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color={theme.colors.borderLight} style={styles.quoteIcon} />
            <Text style={styles.bioText} numberOfLines={3}>{item.descricao || "Profissional focado em resultados, pronto para te ajudar a alcançar sua melhor versão."}</Text>
          </View>

          <View style={styles.specialtiesWrapper}>
            {item.specsParsed?.objetivos?.slice(0, 3).map((esp, i) => (
              <View key={`obj-${i}`} style={styles.tagPremium}>
                <Text style={styles.tagPremiumText}>{esp}</Text>
              </View>
            ))}
            {item.turnos_disponiveis?.slice(0, 2).map((turno, i) => (
              <View key={`turno-${i}`} style={styles.tagSecondary}>
                <Text style={styles.tagSecondaryText}>{turno}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="star" size={18} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{item.nota_media ? Number(item.nota_media).toFixed(1) : "--"}</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statBox}>
              <FontAwesome5 name="dumbbell" size={14} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValue}>{item.tempo_experiencia?.split(" ")[0] || "--"}</Text>
              <Text style={styles.statLabel}>Anos Exp.</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statBox}>
              <Ionicons name="cash" size={18} color={theme.colors.primary} style={styles.statIcon} />
              <Text style={styles.statValueHighlight}>R$ {item.precoAvaliar || "--"}</Text>
              <Text style={styles.statLabel}>Mensal</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.btnPremiumCTA} 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate("PerfilPublicoPersonal", { 
              personalId: item.id, 
              matchPreCalculado: { matchPercentual: item.matchPercentual, matchMotivos: item.matchMotivos }
            })}
          >
            <Text style={styles.btnPremiumCTAText}>Ver perfil completo</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.backgroundPure} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (carregando) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <LinearGradient colors={[theme.colors.surface, theme.colors.backgroundPure]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

      <View style={styles.headerFeed}>
        <View style={styles.logoRow}>
          <Ionicons name="people" size={26} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>MATCH<Text style={{ color: theme.colors.primary }}>TRAINER</Text></Text>
        </View>
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={personalsExibidos}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.radarPillContainer}>
              <View style={styles.radarPillHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialCommunityIcons name="radar" size={18} color={theme.colors.primary} />
                  <Text style={styles.radarPillTitle}>Filtro de Distância GPS</Text>
                </View>
                <View style={styles.radarPillValueBox}>
                  <Text style={styles.radarPillValue}>Até {distanciaMaxima} km</Text>
                </View>
              </View>
              <Slider
                style={{ width: "100%", height: 35 }}
                minimumValue={5}
                maximumValue={100}
                step={5}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.borderLight}
                thumbTintColor={theme.colors.primary}
                value={distanciaMaxima}
                onValueChange={handleSliderChange}
              />
              <Text style={{ color: theme.colors.textMuted, fontSize: 10, textAlign: "center", marginTop: 5 }}>
                *A distância se aplica apenas para atendimentos presenciais.
              </Text>
            </View>

            {personalsExibidos.length > 0 && (
              <View style={styles.sectionHeaderContainerVitrine}>
                <Ionicons name="compass-outline" size={22} color={theme.colors.primary} />
                <Text style={styles.sectionTitleFeed}>Seus Melhores Matches</Text>
                <View style={styles.sectionHeaderLine} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off" size={60} color={theme.colors.primary} style={{ marginBottom: 15 }} />
            <Text style={styles.emptyTitle}>Nenhum Match Perfeito</Text>
            <Text style={styles.emptyText}>Por segurança e qualidade, exibimos apenas profissionais com alta compatibilidade com seu objetivo e turno.</Text>
            <Text style={[ styles.emptyText, { marginTop: 10, fontSize: 13, color: theme.colors.textMuted } ]}>Tente aumentar a distância no radar acima.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent={true} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadgeBg}>
                <FontAwesome5 name="fire" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.modalTitle}>{matchSelecionado?.matchPercentual}% Compatível</Text>
              <Text style={styles.modalSubtitle}>Por que {matchSelecionado?.nome?.split(" ")[0]} é ideal para você?</Text>
            </View>
            <View style={styles.modalBody}>
              {matchSelecionado?.matchMotivos?.map((motivo, index) => (
                <View key={index} style={styles.motivoRow}>
                  <Text style={{ fontSize: 18, marginTop: 1 }}>{motivo.icone}</Text>
                  <Text style={styles.motivoText}>{motivo.texto}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.modalBtnClose} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },

  headerFeed: { alignItems: "center", justifyContent: "center", paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), paddingBottom: verticalScale(20), borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceLight, position: "relative" },
  logoRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: scale(8) },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(24), color: theme.colors.text, letterSpacing: 1.5 },
  btnLogout: { position: "absolute", right: scale(20), top: Platform.OS === "ios" ? verticalScale(60) : verticalScale(40), padding: scale(5) },

  listPadding: { paddingHorizontal: scale(20), paddingTop: verticalScale(15), paddingBottom: verticalScale(40) },

  radarPillContainer: { backgroundColor: theme.colors.surface, paddingVertical: verticalScale(15), paddingHorizontal: scale(20), borderRadius: moderateScale(20), marginBottom: verticalScale(25), borderWidth: 1, borderColor: theme.colors.border },
  radarPillHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(5) },
  radarPillTitle: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: "bold", marginLeft: scale(8) },
  radarPillValueBox: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: scale(12), paddingVertical: verticalScale(4), borderRadius: moderateScale(12), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  radarPillValue: { color: theme.colors.primary, fontSize: moderateScale(12), fontWeight: "900" },

  sectionHeaderContainerVitrine: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(24), paddingLeft: scale(4) },
  sectionTitleFeed: { color: theme.colors.text, fontSize: moderateScale(18), fontFamily: theme.fonts.title, marginLeft: scale(8), marginRight: scale(12), textTransform: "uppercase", letterSpacing: 0.5 },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderLight },

  premiumCardContainer: { backgroundColor: theme.colors.surface, borderRadius: moderateScale(24), marginBottom: verticalScale(35), overflow: "hidden", borderWidth: 1.5, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 12 },
  cardImageHeader: { width: "100%", height: verticalScale(380), position: "relative" },
  cardCover: { width: "100%", height: "100%" },

  badgeTopLeft: { position: "absolute", top: verticalScale(16), left: scale(16), borderRadius: moderateScale(12), overflow: "hidden" },
  badgeTopRight: { position: "absolute", top: verticalScale(16), right: scale(16), borderRadius: moderateScale(12), overflow: "hidden" },
  badgeBlur: { flexDirection: "row", alignItems: "center", paddingVertical: verticalScale(6), paddingHorizontal: scale(12), backgroundColor: "rgba(0,0,0,0.5)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  badgeText: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "bold", letterSpacing: 0.5 },
  badgeTextMatch: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 0.5, marginLeft: scale(6) },

  imageBottomInfo: { position: "absolute", bottom: verticalScale(15), left: scale(16), right: scale(16) },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(2) },
  trainerNamePremium: { fontFamily: theme.fonts.title, fontSize: moderateScale(26), color: theme.colors.text, letterSpacing: -0.5, textShadowColor: "rgba(0, 0, 0, 0.9)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  trainerAge: { color: theme.colors.textBody, fontSize: moderateScale(22), fontWeight: "400" },

  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { color: theme.colors.textBody, fontSize: moderateScale(13), marginLeft: scale(4), textShadowColor: "rgba(0, 0, 0, 0.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, fontWeight: "500" },
  distanceText: { color: theme.colors.primary, fontWeight: "bold" },
  distanceTextOnline: { color: "#00E676", fontWeight: "900" },

  cardContentBox: { paddingHorizontal: scale(20), paddingVertical: verticalScale(20) },

  agendaAlertBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FF3B30", alignSelf: "flex-start", paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: moderateScale(8), marginBottom: verticalScale(10) },
  agendaAlertText: { color: "#FFF", fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 0.5 },

  bioWrapper: { position: "relative", marginBottom: verticalScale(18) },
  quoteIcon: { position: "absolute", top: verticalScale(-5), left: scale(-5), opacity: 0.4 },
  bioText: { color: theme.colors.textSecondary, fontSize: moderateScale(14), lineHeight: moderateScale(20), fontStyle: "italic", paddingLeft: scale(22), paddingRight: scale(5) },

  specialtiesWrapper: { flexDirection: "row", flexWrap: "wrap", gap: scale(6), marginBottom: verticalScale(20), paddingLeft: scale(2) },
  tagPremium: { backgroundColor: theme.colors.primaryLight, paddingVertical: verticalScale(4), paddingHorizontal: scale(10), borderRadius: moderateScale(8), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  tagPremiumText: { color: theme.colors.primary, fontSize: moderateScale(11), fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  tagSecondary: { backgroundColor: theme.colors.surfaceLight, paddingVertical: verticalScale(4), paddingHorizontal: scale(10), borderRadius: moderateScale(8), borderWidth: 1, borderColor: theme.colors.borderLight },
  tagSecondaryText: { color: theme.colors.textSecondary, fontSize: moderateScale(11), fontWeight: "600", textTransform: "uppercase" },

  statsGrid: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: verticalScale(20), backgroundColor: theme.colors.surfaceLight, padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.border },
  statBox: { flex: 1, alignItems: "center" },
  statIcon: { marginBottom: verticalScale(6), opacity: 0.9 },
  statValue: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: "bold" },
  statValueHighlight: { color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: "bold" },
  statLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(10), marginTop: verticalScale(4), textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "800" },
  statSeparator: { width: 1, height: verticalScale(35), backgroundColor: theme.colors.borderLight },

  btnPremiumCTA: { backgroundColor: theme.colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", height: verticalScale(56), borderRadius: moderateScale(16) },
  btnPremiumCTAText: { color: theme.colors.backgroundPure, fontSize: moderateScale(16), fontWeight: "900", marginRight: scale(8), textTransform: "uppercase", letterSpacing: 0.5 },

  emptyState: { alignItems: "center", justifyContent: "center", marginTop: verticalScale(60), paddingHorizontal: scale(20) },
  emptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.title, fontSize: moderateScale(22), marginBottom: verticalScale(8) },
  emptyText: { color: theme.colors.textSecondary, fontSize: moderateScale(15), textAlign: "center", lineHeight: moderateScale(22) },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: scale(20) },
  modalContent: { width: "100%", backgroundColor: theme.colors.surface, borderRadius: moderateScale(28), padding: scale(24), borderWidth: 1, borderColor: theme.colors.borderLight, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  modalHeader: { alignItems: "center", marginBottom: verticalScale(25) },
  modalBadgeBg: { width: scale(60), height: scale(60), borderRadius: moderateScale(30), backgroundColor: theme.colors.primaryLight, justifyContent: "center", alignItems: "center", marginBottom: verticalScale(15), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  modalTitle: { color: theme.colors.text, fontSize: moderateScale(26), fontFamily: theme.fonts.title, marginBottom: verticalScale(5) },
  modalSubtitle: { color: theme.colors.textSecondary, fontSize: moderateScale(14), textAlign: "center" },
  modalBody: { width: "100%", backgroundColor: theme.colors.surfaceLight, borderRadius: moderateScale(20), padding: scale(20), borderWidth: 1, borderColor: theme.colors.border, marginBottom: verticalScale(25) },
  motivoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: verticalScale(15) },
  motivoText: { color: theme.colors.textBody, fontSize: moderateScale(15), fontWeight: "500", marginLeft: scale(12), flex: 1, lineHeight: moderateScale(22) },
  modalBtnClose: { backgroundColor: theme.colors.border, width: "100%", height: verticalScale(56), borderRadius: moderateScale(16), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.colors.borderLight },
  modalBtnText: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: "bold" },
});