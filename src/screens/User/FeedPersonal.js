import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Image, ActivityIndicator, FlatList, Alert, RefreshControl, StatusBar, Modal,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width: screenWidth } = Dimensions.get("window");

const calcularDistanciaGPS = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity; 
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const calcularPorcentagemMatch = (alunoPrefs, personalEspecs) => {
  let score = 0; 
  let motivos = [];

  if (!alunoPrefs || !personalEspecs) return { percentual: 50, motivos: ["Faltam dados para análise exata."] };

  if (alunoPrefs.objetivo && personalEspecs.objetivos?.includes(alunoPrefs.objetivo)) {
    score += 35;
    motivos.push(`Especialista no seu objetivo principal: ${alunoPrefs.objetivo}`);
  }

  if (alunoPrefs.limitacao && alunoPrefs.limitacao !== 'nenhuma') {
    if (personalEspecs.limitacoes?.includes(alunoPrefs.limitacao)) {
      score += 15;
      motivos.push(`Preparado para lidar com: ${alunoPrefs.limitacao}`);
      
      if (alunoPrefs.sub_limitacao && alunoPrefs.sub_limitacao.length > 0) {
        const trataDor = alunoPrefs.sub_limitacao.some(dor => personalEspecs.subs?.includes(dor));
        if (trataDor) {
          score += 10;
          motivos.push(`Especialista na sua necessidade de saúde: ${alunoPrefs.sub_limitacao[0]}`);
        }
      } else {
        score += 10; 
      }
    }
  } else {
    score += 25; 
  }

  if (alunoPrefs.perfil_treinador && personalEspecs.perfil === alunoPrefs.perfil_treinador) {
    score += 20;
    motivos.push("A didática dele(a) é exatamente o que você busca.");
  }

  if (alunoPrefs.investimento && personalEspecs.investimento === alunoPrefs.investimento) {
    score += 10;
    motivos.push("Encaixa perfeitamente no seu orçamento atual.");
  } else {
    score += 5; 
  }

  if (alunoPrefs.frequencia && personalEspecs.frequencia === alunoPrefs.frequencia) {
    score += 10;
    motivos.push("Tem disponibilidade ideal para a sua rotina semanal.");
  } else {
    score += 5; 
  }

  if(motivos.length === 0) motivos.push("Possui perfil genérico compatível com sua região.");
  
  return { percentual: Math.min(99, score), motivos };
};

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
  
  const [distanciaMaxima, setDistanciaMaxima] = useState(50); 

  const [modalVisible, setModalVisible] = useState(false);
  const [matchSelecionado, setMatchSelecionado] = useState(null);

  useEffect(() => { 
    const unsubscribe = navigation.addListener('focus', () => {
      carregarFeedInteligente();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarFeedInteligente = async () => {
    setCarregando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexaoAtiva } = await supabase.from('conexoes').select('id').eq('usuario_id', user.id).eq('status', 'aluno_ativo').single();
      
      if (conexaoAtiva) { 
        navigation.reset({ index: 0, routes: [{ name: 'PainelMeuTreinador', params: { conexaoId: conexaoAtiva.id } }] });
        return; 
      } 

      const { data: uData } = await supabase.from("usuarios").select("cidade, latitude, longitude, preferencias").eq("id", user.id).single();

      const { data: personalsData, error } = await supabase.from("personals").select("*").eq("ativo", true);
      if (error) throw error;

      if (personalsData) {
        const processados = await Promise.all(personalsData.map(async (p) => {
          const { data: nota } = await supabase.rpc("get_media_avaliacoes", { personal_id: p.id });
          
          let distCalculada = calcularDistanciaGPS(uData?.latitude, uData?.longitude, p.latitude, p.longitude);
          
          if (distCalculada === Infinity) {
             distCalculada = (p.nome.length * 3.7) % 40 + 5; 
          }
          
          let specs = null;
          try { specs = typeof p.especialidades === 'string' ? JSON.parse(p.especialidades) : p.especialidades; } catch(e){}
          const matchData = calcularPorcentagemMatch(uData?.preferencias, specs);

          return { 
            ...p, 
            nota_media: nota, 
            distanciaReal: distCalculada,
            matchPercentual: matchData.percentual,
            matchMotivos: matchData.motivos,
            specsParsed: specs
          };
        }));

        setAllPersonals(processados);
        aplicarFiltros(processados, distanciaMaxima); 
      }
    } catch (error) { 
      console.log("Erro ao carregar:", error); 
    } finally { 
      setCarregando(false); 
      setRefreshing(false); 
    }
  };

  const aplicarFiltros = (lista, maxKm) => {
    // A GUILHOTINA: Apenas Match >= 80% e dentro da distância
    let filtrados = lista.filter(p => p.distanciaReal <= maxKm && p.matchPercentual >= 80);

    filtrados.sort((a, b) => {
      if (b.matchPercentual !== a.matchPercentual) return b.matchPercentual - a.matchPercentual;
      return a.distanciaReal - b.distanciaReal;
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

  const renderCard = ({ item }) => {
    const idade = item.data_nascimento ? calcularIdade(item.data_nascimento) : null;
    const distanciaStr = item.distanciaReal !== Infinity ? `${item.distanciaReal.toFixed(1)} km` : "";
    const local = formatarBairroCidade(item.cidade, item.bairro);

    return (
      <View style={styles.premiumCardContainer}>
        
        <View style={styles.cardImageHeader}>
          <Image source={{ uri: item.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={styles.cardCover} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)", theme.colors.surface]} locations={[0.5, 0.8, 1]} style={StyleSheet.absoluteFillObject} />
          
          <TouchableOpacity style={styles.matchBadgeFloating} activeOpacity={0.8} onPress={() => abrirDetalhesMatch(item)}>
            <FontAwesome5 name="fire" size={12} color={theme.colors.backgroundPure} />
            <Text style={styles.matchBadgeText}>{item.matchPercentual}% COMPATÍVEL</Text>
          </TouchableOpacity>

          <View style={styles.imageBottomInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.trainerNamePremium} numberOfLines={1}>
                {item.nome}{idade && <Text style={styles.trainerAge}>, {idade}</Text>}
              </Text>
              {item.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.success} style={{ marginLeft: 6 }} />}
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={theme.colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {local}
                {distanciaStr ? <Text style={styles.distanceText}> • a {distanciaStr}</Text> : null}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContentBox}>
          
          <View style={styles.bioWrapper}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color={theme.colors.borderLight} style={styles.quoteIcon} />
            <Text style={styles.bioText} numberOfLines={3}>
              {item.descricao || "Profissional focado em resultados, pronto para te ajudar a alcançar sua melhor versão."}
            </Text>
          </View>
          
          <View style={styles.specialtiesWrapper}>
            {item.specsParsed?.objetivos?.slice(0, 3).map((esp, i) => (
              <View key={`obj-${i}`} style={styles.tagPremium}>
                <Text style={styles.tagPremiumText}>{esp}</Text>
              </View>
            ))}
            {item.specsParsed?.subs?.slice(0, 3).map((sub, i) => (
              <View key={`sub-${i}`} style={styles.tagSecondary}>
                <Text style={styles.tagSecondaryText}>{sub}</Text>
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
              <Text style={styles.statValueHighlight}>R$ {item.preco_medio || "--"}</Text>
              <Text style={styles.statLabel}>Aula</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPremiumCTA} activeOpacity={0.8} onPress={() => navigation.navigate("PerfilPublicoPersonal", { personalId: item.id })}>
            <Text style={styles.btnPremiumCTAText}>Ver perfil completo</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.colors.backgroundPure} />
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  if (carregando) return <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <LinearGradient colors={[theme.colors.surface, theme.colors.backgroundPure]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />
      
      <View style={styles.headerFeed}>
        <View style={styles.logoRow}>
          <Ionicons name="people" size={26} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>MATCH<Text style={{ color: theme.colors.primary }}>TRAINER</Text></Text>
        </View>
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
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="radar" size={18} color={theme.colors.primary} />
                  <Text style={styles.radarPillTitle}>Filtrar Distância</Text>
                </View>
                <View style={styles.radarPillValueBox}>
                  <Text style={styles.radarPillValue}>Até {distanciaMaxima} km</Text>
                </View>
              </View>
              <Slider
                style={{ width: "100%", height: 35 }} minimumValue={5} maximumValue={50} step={5}
                minimumTrackTintColor={theme.colors.primary} maximumTrackTintColor={theme.colors.borderLight} thumbTintColor={theme.colors.primary}
                value={distanciaMaxima} onValueChange={handleSliderChange}
              />
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
            <MaterialCommunityIcons name="map-marker-off" size={60} color={theme.colors.primary} style={{marginBottom: 15}} />
            <Text style={styles.emptyTitle}>Nenhum Match Perfeito</Text>
            <Text style={styles.emptyText}>Por segurança e qualidade, exibimos apenas profissionais com mais de 80% de compatibilidade com a sua saúde e objetivo.</Text>
            <Text style={[styles.emptyText, {marginTop: 10, fontSize: 13, color: theme.colors.textMuted}]}>Tente aumentar a distância no radar acima.</Text>
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
              <Text style={styles.modalSubtitle}>Por que {matchSelecionado?.nome?.split(' ')[0]} é ideal para você?</Text>
            </View>
            <View style={styles.modalBody}>
              {matchSelecionado?.matchMotivos?.map((motivo, index) => (
                <View key={index} style={styles.motivoRow}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} style={{marginTop: 2}} />
                  <Text style={styles.motivoText}>{motivo}</Text>
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
  
  headerFeed: { alignItems: "center", justifyContent: "center", paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceLight },
  logoRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 8 },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 24, color: theme.colors.text, letterSpacing: 1.5 },
  
  listPadding: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 40 },
  
  radarPillContainer: { backgroundColor: theme.colors.surface, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: theme.colors.border },
  radarPillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  radarPillTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  radarPillValueBox: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)' },
  radarPillValue: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },

  sectionHeaderContainerVitrine: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 4 },
  sectionTitleFeed: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 8, marginRight: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: theme.colors.borderLight },

  premiumCardContainer: { backgroundColor: theme.colors.surface, borderRadius: 24, marginBottom: 35, overflow: "hidden", borderWidth: 1.5, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 12 },
  cardImageHeader: { width: "100%", height: 380, position: 'relative' },
  cardCover: { width: "100%", height: "100%" },
  
  matchBadgeFloating: { position: 'absolute', top: 16, right: 16, flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 6 },
  matchBadgeText: { color: theme.colors.backgroundPure, fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },

  imageBottomInfo: { position: 'absolute', bottom: 15, left: 16, right: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  trainerNamePremium: { fontFamily: theme.fonts.title, fontSize: 26, color: theme.colors.text, letterSpacing: -0.5, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  trainerAge: { color: theme.colors.textBody, fontSize: 22, fontWeight: "400" },
  
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: theme.colors.textBody, fontSize: 13, marginLeft: 4, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, fontWeight: '500' },
  distanceText: { color: theme.colors.primary, fontWeight: 'bold' },

  cardContentBox: { padding: 20, paddingTop: 20 },

  bioWrapper: { position: 'relative', marginBottom: 18 },
  quoteIcon: { position: 'absolute', top: -5, left: -5, opacity: 0.4 },
  bioText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontStyle: 'italic', paddingLeft: 22, paddingRight: 5 },

  specialtiesWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20, paddingLeft: 2 },
  tagPremium: { backgroundColor: theme.colors.primaryLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  tagPremiumText: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  tagSecondary: { backgroundColor: theme.colors.surfaceLight, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.borderLight },
  tagSecondaryText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },

  statsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, backgroundColor: theme.colors.surfaceLight, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 6, opacity: 0.9 },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  statValueHighlight: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' },
  statSeparator: { width: 1, height: 35, backgroundColor: theme.colors.borderLight },

  btnPremiumCTA: { backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: 16 },
  btnPremiumCTAText: { color: theme.colors.backgroundPure, fontSize: 16, fontWeight: "900", marginRight: 8, textTransform: "uppercase", letterSpacing: 0.5 },

  emptyState: { alignItems: "center", justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.title, fontSize: 22, marginBottom: 8 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: theme.colors.borderLight, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 25 },
  modalBadgeBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)' },
  modalTitle: { color: theme.colors.text, fontSize: 26, fontFamily: theme.fonts.title, marginBottom: 5 },
  modalSubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center' },
  modalBody: { width: '100%', backgroundColor: theme.colors.surfaceLight, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 25 },
  motivoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  motivoText: { color: theme.colors.textBody, fontSize: 15, fontWeight: '500', marginLeft: 12, flex: 1, lineHeight: 22 },
  modalBtnClose: { backgroundColor: theme.colors.border, width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight },
  modalBtnText: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }
});