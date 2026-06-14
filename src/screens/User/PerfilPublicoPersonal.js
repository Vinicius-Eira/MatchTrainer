import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get('window');

const formatarLocalizacaoPremium = (cidade, bairro, estado) => {
  if (!cidade && !bairro) return "LOCAL NÃO DEFINIDO";
  
  const strBairro = bairro ? `${bairro.trim()} • ` : "";
  const strCidade = cidade ? cidade.trim() : "";
  const strEstado = estado ? estado.trim().toUpperCase() : "SP";

  if (!bairro && cidade && cidade.includes("/")) {
    return cidade.trim().toUpperCase();
  }

  return `${strBairro}${strCidade}/${strEstado}`.toUpperCase();
};

const getIconeEspecialidade = (nome) => {
  const n = nome.toLowerCase();
  if (n.includes("emagrecimento") || n.includes("perda")) return "fire";
  if (n.includes("musculação") || n.includes("hipertrofia") || n.includes("força")) return "dumbbell";
  if (n.includes("funcional") || n.includes("cross")) return "kettlebell";
  if (n.includes("corrida") || n.includes("aeróbico")) return "run";
  if (n.includes("reabilitação") || n.includes("fisioterapia") || n.includes("postura")) return "human-handsup";
  return "check-circle-outline"; 
};

export default function PerfilPublicoPersonal({ route, navigation }) {
  const { personalId } = route.params;
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notaMedia, setNotaMedia] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    carregarPerfilCompleto();
  }, [personalId]);

  const carregarPerfilCompleto = async () => {
    try {
      const [reqPersonal, reqNota] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { personal_id: personalId }),
      ]);

      if (reqPersonal.error) throw reqPersonal.error;
      setPersonal(reqPersonal.data);
      setNotaMedia(reqNota.data);
    } catch (error) {
      Alert.alert("Erro", "Perfil indisponível no momento.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleContato = async (tipo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return Alert.alert("Aviso", "Crie uma conta para falar com o personal.");
      }

      const { data: conexaoExistente } = await supabase
        .from('conexoes')
        .select('id, status')
        .eq('usuario_id', user.id)
        .eq('personal_id', personal.id)
        .maybeSingle();

      if (conexaoExistente && conexaoExistente.status === 'recusado') {
        return Alert.alert('Aviso', 'Este personal não está aceitando novos alunos no momento.');
      }

      let conexaoId = conexaoExistente?.id;

      if (tipo === "whatsapp") {
        if (!conexaoExistente) {
          await supabase.from("conexoes").insert([
            { usuario_id: user.id, personal_id: personal.id, status: "lead" }
          ]);
        }

        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Vi seu perfil no app e busco acompanhamento.`;

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          Linking.openURL(url);
        } else {
          Alert.alert("Aviso", "O WhatsApp não está instalado neste dispositivo.");
        }

      } else {
        if (!conexaoExistente) {
          const { data: novaConexao, error: erroCriar } = await supabase
            .from('conexoes')
            .insert([{ usuario_id: user.id, personal_id: personal.id, status: 'em_contato' }])
            .select('id')
            .single();
            
          if (erroCriar) throw erroCriar;
          conexaoId = novaConexao.id;

        } else if (conexaoExistente.status === 'lead') {
          await supabase
            .from('conexoes')
            .update({ status: 'em_contato' })
            .eq('id', conexaoId);
        }

        navigation.navigate('Chat', { 
          conexaoId: conexaoId, 
          nomeOutro: personal.nome, 
          fotoOutro: personal.foto_url, 
          tipoUsuarioLogado: 'aluno' 
        });
      }

    } catch (error) {
      console.error("Erro ao contatar personal:", error);
      Alert.alert("Erro", "Não foi possível iniciar o contato.");
    }
  };

  const abrirRedeSocial = (tipo, handle) => {
    let url = "";
    if (tipo === 'instagram') url = `https://instagram.com/${handle.replace('@', '')}`;
    if (tipo === 'tiktok') url = `https://tiktok.com/@${handle.replace('@', '')}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
  };

  if (loading || !personal) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const especialidades = Array.isArray(personal.especialidades) ? personal.especialidades : JSON.parse(personal.especialidades || "[]");
  const temGaleria = personal.galeria_fotos && Array.isArray(personal.galeria_fotos) && personal.galeria_fotos.length > 0;
  
  const nomeExibicao = personal.nome || "Profissional";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image source={{ uri: personal.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400" }} style={styles.avatarImage} />
            {personal.cref_verificado && (
              <View style={styles.verifiedBadgeFloat}>
                <MaterialCommunityIcons name="check-decagram" size={20} color="#FFF" />
              </View>
            )}
          </View>

          <Text style={styles.nomeText}>{nomeExibicao}</Text>

          <View style={styles.locationEditorialRow}>
            <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
            <Text style={styles.locationEditorialText}>
              {formatarLocalizacaoPremium(personal.cidade, personal.bairro, personal.estado)}
            </Text>
          </View>
          
          {personal.cref && (
            <View style={styles.crefPill}>
              <MaterialCommunityIcons name="card-account-details-outline" size={14} color="#888" style={{marginRight: 6}} />
              <Text style={styles.crefText}>CREF: {personal.cref}</Text>
            </View>
          )}

          {(personal.instagram || personal.tiktok) && (
            <View style={styles.socialsWrapper}>
              {personal.instagram && (
                <TouchableOpacity style={styles.btnSocialIg} onPress={() => abrirRedeSocial('instagram', personal.instagram)} activeOpacity={0.8}>
                  <Ionicons name="logo-instagram" size={16} color="#FFF" />
                  <Text style={styles.btnSocialText}>Instagram</Text>
                </TouchableOpacity>
              )}
              {personal.tiktok && (
                <TouchableOpacity style={styles.btnSocialTk} onPress={() => abrirRedeSocial('tiktok', personal.tiktok)} activeOpacity={0.8}>
                  <FontAwesome5 name="tiktok" size={14} color="#FFF" />
                  <Text style={styles.btnSocialText}>TikTok</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.statsRowPremium}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statValueBase}>{personal.tempo_experiencia?.split(" ")[0] || "-"}</Text>
              <Text style={styles.statLabelSub}>ANOS EXP.</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={notaMedia ? styles.statValueBase : styles.statValueMuted}>
                {notaMedia ? Number(notaMedia).toFixed(1) : "--"}
              </Text>
              <Text style={styles.statLabelSub}>AVALIAÇÃO</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="cash-multiple" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.statTextWrap}>
              <Text style={styles.statValueBase}>
                <Text style={styles.priceCurrency}>R$</Text> {personal.preco_medio || "--"}
              </Text>
              <Text style={styles.statLabelSub}>/ SESSÃO</Text>
            </View>
          </View>
        </View>

        {especialidades.length > 0 && (
          <View style={styles.sectionPremium}>
            <Text style={styles.sectionTitleCenter}>Foco do Treinamento</Text>
            <View style={styles.specialtiesWrapCenter}>
              {especialidades.map((esp, idx) => (
                <View key={idx} style={idx === 0 ? styles.specPrimary : styles.specSecondary}>
                  <MaterialCommunityIcons name={getIconeEspecialidade(esp)} size={16} color={idx === 0 ? theme.colors.primary : "#AAA"} style={{ marginRight: 6 }} />
                  <Text style={idx === 0 ? styles.specTextPrimary : styles.specTextSecondary}>{esp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionPremium}>
          <Text style={styles.sectionTitleCenter}>Sobre Mim</Text>
          <View style={styles.aboutPremiumCardCenter}>
            <MaterialCommunityIcons name="format-quote-open" size={32} color={theme.colors.primary} style={styles.quoteIconCenter} />
            <Text style={styles.aboutTextPremiumCenter}>
              {personal.descricao 
                ? personal.descricao 
                : "Este profissional ainda não adicionou uma descrição detalhada sobre sua metodologia e história de trabalho."}
            </Text>
          </View>
        </View>

        {personal.video_pitch && (
          <View style={styles.sectionPremium}>
            <Text style={styles.sectionTitleCenter}>Metodologia em Ação</Text>
            <TouchableOpacity style={styles.videoThumbnailContainer} activeOpacity={0.9} onPress={() => Linking.openURL(personal.video_pitch)}>
              <Image source={{ uri: personal.foto_url }} style={styles.videoThumbnail} blurRadius={12} />
              <View style={styles.videoOverlay}>
                <View style={styles.playButtonWrapper}>
                  <Ionicons name="play" size={32} color="#000" style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.videoTitle}>Assistir Apresentação</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {temGaleria && (
          <View style={styles.sectionPremium}>
            <Text style={styles.sectionTitleCenter}>Estrutura e Resultados</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {personal.galeria_fotos.map((foto, index) => (
                <TouchableOpacity key={index} style={styles.galleryItem} activeOpacity={0.95}>
                  <Image source={{ uri: foto }} style={styles.galleryImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.galleryGradient} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.sectionPremium, { marginBottom: 60 }]}>
          <Text style={styles.sectionTitleCenter}>O que dizem os alunos</Text>

          {avaliacoes.length === 0 ? (
            <View style={styles.luxuryEmptyState}>
              <View style={styles.starsRowEmpty}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star-outline" size={28} color={theme.colors.primary} style={{ marginHorizontal: 4 }} />
                ))}
              </View>
              <Text style={styles.luxuryEmptyTitle}>Padrão de Excelência</Text>
              <Text style={styles.luxuryEmptyText}>
                O personal {nomeExibicao} ainda não possui avaliações públicas registradas na plataforma.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              {avaliacoes.map((av) => (
                <View key={av.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Ionicons name="person-circle-outline" size={28} color={theme.colors.primary} />
                    <Text style={styles.reviewName}>{av.usuarios?.nome || 'Aluno'}</Text>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={12} color={theme.colors.primary} />
                      ))}
                    </View>
                  </View>
                  {av.comentario && (
                    <Text style={styles.reviewText}>{av.comentario}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      <View style={styles.conversionFooter}>
        {personal.whatsapp_ativo !== false ? (
          <View style={styles.twinButtonsRow}>
            <TouchableOpacity style={styles.btnWhatsApp} onPress={() => handleContato("whatsapp")} activeOpacity={0.85}>
              <MaterialCommunityIcons name="whatsapp" size={22} color="#FFF" />
              <Text style={styles.btnWhatsAppText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnActionOutline} onPress={() => handleContato("chat")} activeOpacity={0.7}>
              <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.btnActionOutlineText}>Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnActionSolidFull} onPress={() => handleContato("chat")} activeOpacity={0.85}>
            <Ionicons name="chatbubbles" size={22} color="#000" />
            <Text style={styles.btnActionSolidText}>Iniciar Conversa no App</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#070707" },
  scrollContent: { paddingBottom: 160 },

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? 55 : 30, left: 20, zIndex: 10 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },

  heroSection: { alignItems: "center", paddingTop: Platform.OS === "ios" ? 90 : 70, paddingHorizontal: 20, marginBottom: 20 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatarImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: theme.colors.primary },
  avatarGlow: { position: "absolute", top: -5, left: -5, right: -5, bottom: -5, borderRadius: 100, backgroundColor: theme.colors.primary, opacity: 0.25, blurRadius: 25 },
  verifiedBadgeFloat: { position: 'absolute', bottom: 4, right: 8, backgroundColor: '#4CAF50', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#070707' },
  
  nomeText: { fontFamily: theme.fonts.title, fontSize: 32, color: "#FFF", textAlign: "center", letterSpacing: 0.5, marginBottom: 6 },
  
  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 16 },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: 13, color: "#AAA", letterSpacing: 1.2, fontWeight: "700" },

  crefPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161616', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 20 },
  crefText: { color: '#888', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },

  socialsWrapper: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 5 },
  btnSocialIg: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(225, 48, 108, 0.1)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(225, 48, 108, 0.3)', gap: 6 },
  btnSocialTk: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', gap: 6 },
  btnSocialText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  sectionPremium: { marginHorizontal: 20, marginBottom: 35 },
  sectionTitleCenter: { fontFamily: theme.fonts.title, fontSize: 20, color: "#FFF", marginBottom: 16, letterSpacing: 0.5, textAlign: "center" },

  statsRowPremium: { flexDirection: "row", backgroundColor: "#121212", borderRadius: 16, paddingVertical: 18, borderWidth: 1, borderColor: "#242424", alignItems: "center", justifyContent: "space-evenly", marginHorizontal: 20, marginBottom: 40 },
  statItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  statIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statTextWrap: { alignItems: "center" },
  statDivider: { width: 1, height: "60%", backgroundColor: "#2A2A2A" },
  statValueBase: { fontFamily: theme.fonts.title, fontSize: 17, color: "#FFF" },
  statValueMuted: { fontFamily: theme.fonts.title, fontSize: 17, color: "#555" },
  priceCurrency: { fontSize: 13, color: theme.colors.primary, fontFamily: theme.fonts.body, fontWeight: 'bold' },
  statLabelSub: { fontFamily: theme.fonts.body, fontSize: 10, color: "#888", fontWeight: "800", marginTop: 4, letterSpacing: 0.5, textAlign: "center" },

  specialtiesWrapCenter: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  specPrimary: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 107, 0, 0.15)", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.6)" },
  specTextPrimary: { color: theme.colors.primary, fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  specSecondary: { flexDirection: "row", alignItems: "center", backgroundColor: "#161616", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "#333" },
  specTextSecondary: { color: "#CCC", fontSize: 13, fontWeight: "600", letterSpacing: 0.5 },

  aboutPremiumCardCenter: { backgroundColor: '#121212', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#242424', alignItems: 'center' },
  quoteIconCenter: { marginBottom: 12, opacity: 0.8 },
  aboutTextPremiumCenter: { fontFamily: theme.fonts.body, fontSize: 15, color: "#DCDCDC", lineHeight: 26, textAlign: 'center' },

  videoThumbnailContainer: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#333' },
  videoThumbnail: { width: '100%', height: '100%', opacity: 0.6 },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playButtonWrapper: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  videoTitle: { color: '#FFF', fontSize: 16, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  galleryScroll: { gap: 12, paddingHorizontal: 5, paddingBottom: 10 },
  galleryItem: { width: width * 0.7, height: 220, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  galleryImage: { width: '100%', height: '100%' },
  galleryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },

  luxuryEmptyState: { backgroundColor: '#121212', borderRadius: 16, padding: 30, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1F1F1F" },
  starsRowEmpty: { flexDirection: 'row', marginBottom: 16 },
  luxuryEmptyTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: 18, marginBottom: 10, letterSpacing: 0.5 },
  luxuryEmptyText: { color: "#888", fontSize: 14, textAlign: "center", lineHeight: 22 },
  
  reviewCard: { backgroundColor: '#161616', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#262626' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewName: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  reviewStars: { flexDirection: 'row', marginLeft: 'auto' },
  reviewText: { color: '#DDD', fontSize: 14, fontStyle: 'italic', lineHeight: 22, marginTop: 4 },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(7,7,7,0.95)", paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === "ios" ? 35 : 20, borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  twinButtonsRow: { flexDirection: "row", gap: 12 },
  
  btnWhatsApp: { flex: 1, backgroundColor: "#25D366", height: 56, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnWhatsAppText: { color: "#FFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  
  btnActionOutline: { flex: 1, backgroundColor: "transparent", height: 56, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: theme.colors.primary },
  btnActionOutlineText: { color: theme.colors.primary, fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  btnActionSolidFull: { backgroundColor: theme.colors.primary, width: "100%", height: 56, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
});