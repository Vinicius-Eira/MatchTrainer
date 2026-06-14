import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Image, ActivityIndicator, FlatList, Alert, RefreshControl, StatusBar, ScrollView
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import * as Linking from 'expo-linking';

const { width: screenWidth } = Dimensions.get("window");

const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

const formatarLocalizacao = (cidade) => {
  if (!cidade) return "Não informado";
  const cleanCity = cidade.trim();
  if (cleanCity.includes("/") || cleanCity.includes("-")) return cleanCity;
  return `${cleanCity} • SP`;
};

export default function FeedPersonal({ navigation }) {
  const [personals, setPersonals] = useState([]);
  const [meuTreinador, setMeuTreinador] = useState(null); 
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    carregarFeedInteligente();
  }, []);

  const carregarFeedInteligente = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conexaoAtiva } = await supabase
        .from('conexoes')
        .select('id, personals(*)')
        .eq('usuario_id', user.id)
        .eq('status', 'aluno_ativo')
        .single();

      if (conexaoAtiva) {
        setMeuTreinador({ conexaoId: conexaoAtiva.id, dados: conexaoAtiva.personals });
        return;
      } else {
        setMeuTreinador(null);
      }

      const { data: uData } = await supabase
        .from("usuarios")
        .select("cidade, objetivo, latitude, longitude")
        .eq("id", user.id)
        .single();

      let query = supabase.from("personals").select("*").eq("ativo", true).limit(50);

      if (!uData?.latitude && uData?.cidade) {
        query = query.ilike("cidade", `%${uData.cidade}%`);
      }

      const { data: personalsData, error } = await supabase.from("personals").select("*").eq("ativo", true);

      if (error) throw error;

      if (personalsData) {
        const formatados = await Promise.all(
          personalsData.map(async (p) => {
            const { data: nota } = await supabase.rpc("get_media_avaliacoes", { personal_id: p.id });
            return { ...p, nota_media: nota, distancia_real: p.distancia_real || "2.5" };
          })
        );
        setPersonals(formatados);
      }
    } catch (error) {
      console.log("Erro silencioso ao carregar feed:", error);
    } finally {
      setCarregando(false);
      setRefreshing(false); 
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarFeedInteligente();
  }, []);


  if (meuTreinador && !carregando) {
    const { conexaoId, dados } = meuTreinador;
    let espVip = "Treinador Especialista";
    if (dados.especialidades) {
      try {
        const parsed = Array.isArray(dados.especialidades) ? dados.especialidades : JSON.parse(dados.especialidades);
        if (parsed.length > 0) espVip = parsed[0];
      } catch (e) {}
    }

    return (
      <LinearGradient colors={['#0F0F0F', '#000000']} style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
        
        <View style={styles.headerPremium}>
          <View style={styles.logoRow}>
            <Ionicons name="people" size={26} color={theme.colors.primary} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>PERSONAL<Text style={{ color: theme.colors.primary }}>MATCH</Text></Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.hubContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        >
          <View style={styles.hubTitleWrapper}>
            <Text style={styles.hubMainTitle}>Meu Treinamento</Text>
            <Text style={styles.hubSubTitle}>Seu acompanhamento centralizado</Text>
          </View>

          <LinearGradient colors={['#1A1A1A', '#0D0D0D']} style={styles.vipCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.badgeAbsolute}>
              <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>TREINADOR ATIVO</Text>
            </View>
            
            <View style={styles.vipHeader}>
              <View style={styles.avatarGlowContainer}>
                <View style={styles.avatarGlow} />
                <Image source={{ uri: dados.foto_url || 'https://via.placeholder.com/150' }} style={styles.vipAvatar} />
              </View>
              <View style={styles.vipInfo}>
                <Text style={styles.vipName} numberOfLines={1}>{dados.nome}</Text>
                <Text style={styles.vipEspecialidade}>{espVip}</Text>
              </View>
            </View>
            
            <View style={styles.vipActions}>
              <TouchableOpacity style={styles.btnVipPrimary} onPress={() => navigation.navigate('Chat', { conexaoId, nomeOutro: dados.nome, fotoOutro: dados.foto_url, tipoUsuarioLogado: 'aluno' })}>
                <Ionicons name="chatbubbles" size={20} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.btnVipPrimaryText}>Mensagem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnVipSecondary} onPress={() => {
                if(!dados.telefone) return Alert.alert('Aviso', 'O treinador não cadastrou um WhatsApp.');
                Linking.openURL(`whatsapp://send?phone=55${dados.telefone.replace(/\D/g, '')}`).catch(() => Alert.alert('Erro', 'WhatsApp não encontrado.'));
              }}>
                <MaterialCommunityIcons name="whatsapp" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={[styles.sectionHeaderContainer, { marginTop: 40, marginBottom: 15 }]}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitleFeed}>Sua Rotina</Text>
            <View style={styles.sectionHeaderLine} />
          </View>

          <TouchableOpacity style={styles.moduleCardDisabled} activeOpacity={0.9}>
            <View style={styles.moduleIconSecondary}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.moduleTextWrapper}>
              <Text style={styles.moduleTitleDisabled}>Ficha de Treino</Text>
              <Text style={styles.moduleDescDisabled}>Peça sua planilha atualizada direto no chat do seu treinador.</Text>
            </View>
            <View style={styles.lockBadgePill}>
              <Ionicons name="lock-closed" size={12} color="#AAA" style={{ marginRight: 4 }} />
              <Text style={styles.lockBadgeText}>EM BREVE</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCardDisabled} activeOpacity={0.9}>
            <View style={styles.moduleIconSecondary}>
              <Ionicons name="body" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.moduleTextWrapper}>
              <Text style={styles.moduleTitleDisabled}>Avaliação Física</Text>
              <Text style={styles.moduleDescDisabled}>Acompanhe sua evolução, peso e medidas periodicamente.</Text>
            </View>
            <View style={styles.lockBadgePill}>
              <Ionicons name="lock-closed" size={12} color="#AAA" style={{ marginRight: 4 }} />
              <Text style={styles.lockBadgeText}>EM BREVE</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  const renderCard = ({ item }) => {
    let especialidades = [];
    try {
      especialidades = Array.isArray(item.especialidades) ? item.especialidades : JSON.parse(item.especialidades || "[]");
    } catch(e) {}

    const idade = item.data_nascimento ? calcularIdade(item.data_nascimento) : null;

    return (
      <TouchableOpacity 
        style={styles.premiumCardContainer} 
        activeOpacity={0.95} 
        onPress={() => navigation.navigate("PerfilPublicoPersonal", { personalId: item.id })}
      >
        <View style={styles.cardImageHeader}>
          <Image source={{ uri: item.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600" }} style={styles.cardCover} resizeMode="cover" />
          
          <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(8,8,8,0.5)", "#0C0C0C"]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFillObject} />

          <View style={styles.cardFloatingTop}>
            {item.nota_media ? (
              <View style={styles.glassBadge}>
                <Ionicons name="star" size={13} color={theme.colors.primary} />
                <Text style={styles.glassBadgeText}>{Number(item.nota_media).toFixed(1)}</Text>
              </View>
            ) : (
              <View style={styles.glassBadgeNovo}>
                <Text style={styles.glassBadgeTextNovo}>NOVO</Text>
              </View>
            )}
          </View>

          <View style={styles.imageBottomInfo}>
            <View style={styles.nameRowPremium}>
              <Text style={styles.trainerNamePremium} numberOfLines={1}>
                {item.nome}
                {idade && <Text style={styles.trainerAge}>, {idade}</Text>}
              </Text>
              {item.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={24} color="#388E3C" style={{ marginLeft: 6 }} />}
            </View>
            
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={16} color={theme.colors.primary} />
                <Text style={styles.locationTextImmersive}>{formatarLocalizacao(item.cidade)}</Text>
              </View>
              {item.distancia_real && (
                <View style={styles.distanceRow}>
                  <MaterialCommunityIcons name="map-marker-path" size={14} color={theme.colors.primary} style={{ opacity: 0.8 }} />
                  <Text style={styles.distanceText}>Está a {item.distancia_real} km de você</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardContentBox}>
          
          <View style={styles.specialtiesWrapperCenter}>
            {especialidades.slice(0, 3).map((esp, i) => (
              <View key={i} style={styles.tagMinimal}>
                <Text style={styles.tagMinimalText}>{esp}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dividerSoft} />

          <View style={styles.statsGridCenter}>
            <View style={styles.statBoxCenter}>
              <View style={styles.statIconBgCenter}>
                <FontAwesome5 name="dumbbell" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValueCenter}>{item.tempo_experiencia || "Profissional"}</Text>
              <Text style={styles.statLabelCenter}>EXPERIÊNCIA</Text>
            </View>
            
            <View style={styles.statSeparatorCenter} />
            
            <View style={styles.statBoxCenter}>
              <View style={styles.statIconBgCenter}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValueHighlightCenter}>R$ {item.preco_medio || "--"}</Text>
              <Text style={styles.statLabelCenter}>VALOR MÉDIO</Text>
            </View>
          </View>

          <LinearGradient colors={[theme.colors.primary, '#E65C00']} style={styles.btnPremiumCTA} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
            <Text style={styles.btnPremiumCTAText}>Ver Perfil Completo</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </LinearGradient>

        </View>
      </TouchableOpacity>
    );
  };

  if (carregando) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  return (
    <LinearGradient colors={['#121212', '#000000']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.headerPremium}>
        <View style={styles.logoRow}>
          <Ionicons name="people" size={26} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>PERSONAL<Text style={{ color: theme.colors.primary }}>MATCH</Text></Text>
        </View>
      </View>
      
      <FlatList
        data={personals}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} progressBackgroundColor="#121212" />}
        ListHeaderComponent={
          personals.length > 0 && (
            <View style={styles.sectionHeaderContainerVitrine}>
              <Ionicons name="barbell" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitleFeed}>Encontre seu Personal</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="radar" size={60} color={theme.colors.primary} />
              <FontAwesome5 name="dumbbell" size={20} color="#121212" style={styles.emptyIconInner} />
            </View>
            <Text style={styles.emptyTitle}>Buscando treinadores...</Text>
            <Text style={styles.emptyText}>Não encontramos profissionais na sua área no momento. Puxe para atualizar.</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#070707" },
  headerPremium: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  logoRow: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 6 },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 22, color: "#FFF", letterSpacing: 1.5 },
  listPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  hubContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 60 },
  hubTitleWrapper: { marginBottom: 25 },
  hubMainTitle: { color: '#FFF', fontSize: 32, fontFamily: theme.fonts.title, letterSpacing: -0.5 },
  hubSubTitle: { color: '#888', fontSize: 14, marginTop: 4 },
  vipCard: { borderRadius: 28, padding: 24, paddingTop: 35, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: "#000", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10, marginBottom: 10, position: 'relative' },
  badgeAbsolute: { position: 'absolute', top: 0, right: 24, backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(255,107,0,0.3)', flexDirection: 'row', alignItems: 'center' },
  badgeText: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  vipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, marginTop: 5 },
  avatarGlowContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  avatarGlow: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.primary, opacity: 0.25, blurRadius: 20 },
  vipAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: theme.colors.primary, zIndex: 1 },
  vipInfo: { flex: 1, marginLeft: 18 },
  vipName: { color: '#FFF', fontSize: 26, fontFamily: theme.fonts.title, marginBottom: 4 },
  vipEspecialidade: { color: '#AAA', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  vipActions: { flexDirection: 'row', gap: 12 },
  btnVipPrimary: { flex: 1, backgroundColor: theme.colors.primary, height: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnVipPrimaryText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  btnVipSecondary: { width: 56, height: 56, backgroundColor: '#111', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1, borderColor: '#222' },
  moduleCardDisabled: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1, borderColor: '#1A1A1A', opacity: 0.8 },
  moduleIconPrimary: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  moduleIconSecondary: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  moduleTextWrapper: { flex: 1, marginLeft: 16, marginRight: 10 },
  moduleTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  moduleTitleDisabled: { color: '#888', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  moduleDesc: { color: '#AAA', fontSize: 13, lineHeight: 18 },
  moduleDescDisabled: { color: '#555', fontSize: 13, lineHeight: 18 },
  lockBadgePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  lockBadgeText: { color: '#AAA', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  
  sectionHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingLeft: 4 },
  sectionHeaderContainerVitrine: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingLeft: 4, marginTop: 10 },
  sectionTitleFeed: { color: '#FFF', fontSize: 18, fontFamily: theme.fonts.title, marginLeft: 8, marginRight: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#222' },

  premiumCardContainer: { backgroundColor: "#0C0C0C", borderRadius: 32, marginBottom: 32, overflow: "hidden", borderWidth: 1, borderColor: theme.colors.primary, shadowColor: "#000", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 12 },
  
  cardImageHeader: { width: "100%", height: 350, position: 'relative' },
  cardCover: { width: "100%", height: "100%" },
  
  cardFloatingTop: { flexDirection: "row", justifyContent: "flex-end", alignItems: 'center', position: 'absolute', top: 20, right: 20 },
  glassBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: "rgba(255,107,0,0.5)", backdropFilter: "blur(10px)" },
  glassBadgeText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  glassBadgeNovo: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  glassBadgeTextNovo: { color: "#000", fontSize: 10, fontWeight: "900", letterSpacing: 1 },

  imageBottomInfo: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  nameRowPremium: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  trainerNamePremium: { fontFamily: theme.fonts.title, fontSize: 32, color: "#FFF", letterSpacing: -0.5, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  trainerAge: { color: "#DDD", fontSize: 26, fontWeight: "400" },
  
  locationContainer: { flexDirection: 'column', alignItems: 'flex-start' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locationTextImmersive: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 6, letterSpacing: 0.5, textShadowColor: 'rgba(0, 0, 0, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 2 },
  distanceText: { color: theme.colors.primary, fontSize: 13, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.3 },

  cardContentBox: { padding: 24, paddingTop: 20, backgroundColor: "#0C0C0C" },
  
  specialtiesWrapperCenter: { flexDirection: "row", flexWrap: "wrap", justifyContent: 'center', gap: 8, marginBottom: 20 },
  tagMinimal: { backgroundColor: "#1A1A1A", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#2A2A2A" },
  tagMinimalText: { color: "#AAA", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },

  dividerSoft: { height: 1, backgroundColor: "#1A1A1A", marginBottom: 20 },

  statsGridCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  statBoxCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statIconBgCenter: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,107,0,0.15)' },
  statLabelCenter: { color: '#666', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statValueCenter: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  statValueHighlightCenter: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 2 },
  statSeparatorCenter: { width: 1, height: 40, backgroundColor: '#222', marginHorizontal: 10 },

  btnPremiumCTA: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 56, borderRadius: 18, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 },
  btnPremiumCTAText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 0.5, marginRight: 8 },

  emptyState: { alignItems: "center", justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyIconContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyIconInner: { position: 'absolute' },
  emptyTitle: { color: '#FFF', fontFamily: theme.fonts.title, fontSize: 20, marginBottom: 8 },
  emptyText: { color: '#777', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});