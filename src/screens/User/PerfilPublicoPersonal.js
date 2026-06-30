import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Platform, Dimensions, Modal
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get('window');

const formatarLocalizacaoPremium = (cidade, bairro) => {
  if (!cidade && !bairro) return "LOCAL NÃO DEFINIDO";
  if (bairro && cidade) return `${bairro.trim()}, ${cidade.trim()}`;
  if (bairro) return bairro.trim();
  return cidade.trim();
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
      } else { score += 10; }
    }
  } else { score += 25; }

  if (alunoPrefs.perfil_treinador && personalEspecs.perfil === alunoPrefs.perfil_treinador) {
    score += 20;
    motivos.push("A didática dele(a) é exatamente o que você busca.");
  }

  if (alunoPrefs.investimento && personalEspecs.investimento === alunoPrefs.investimento) {
    score += 10;
    motivos.push("Encaixa perfeitamente no seu orçamento atual.");
  } else { score += 5; }

  if (alunoPrefs.frequencia && personalEspecs.frequencia === alunoPrefs.frequencia) {
    score += 10;
    motivos.push("Tem disponibilidade ideal para a sua rotina semanal.");
  } else { score += 5; }

  if(motivos.length === 0) motivos.push("Possui perfil genérico compatível com sua região.");
  return { percentual: Math.min(99, score), motivos };
};

export default function PerfilPublicoPersonal({ route, navigation }) {
  const { personalId } = route.params;
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notaMedia, setNotaMedia] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  
  const [matchData, setMatchData] = useState(null);
  const [modalMatchVisivel, setModalMatchVisivel] = useState(false);

  useEffect(() => { carregarPerfilCompleto(); }, [personalId]);

  const carregarPerfilCompleto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [reqPersonal, reqNota, reqAvaliacoes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { personal_id: personalId }),
        supabase.from("avaliacoes").select("*, usuarios(nome)").eq("personal_id", personalId).limit(5)
      ]);

      if (reqPersonal.error) throw reqPersonal.error;
      const prof = reqPersonal.data;
      setPersonal(prof);
      setNotaMedia(reqNota.data);
      if (reqAvaliacoes.data) setAvaliacoes(reqAvaliacoes.data);

      if (user) {
        const { data: uData } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
        let specs = null;
        try { specs = typeof prof.especialidades === 'string' ? JSON.parse(prof.especialidades) : prof.especialidades; } catch(e){}
        const matchCalculado = calcularPorcentagemMatch(uData?.preferencias, specs);
        setMatchData(matchCalculado);
      }

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
      if (!user) return Alert.alert("Aviso", "Crie uma conta para falar com o personal.");

      const { data: conexaoExistente } = await supabase.from('conexoes').select('id, status').eq('usuario_id', user.id).eq('personal_id', personal.id).maybeSingle();

      if (conexaoExistente && conexaoExistente.status === 'recusado') {
        return Alert.alert('Aviso', 'Este personal não está aceitando novos contatos no momento.');
      }

      let conexaoId = conexaoExistente?.id;

      if (tipo === "whatsapp") {
        if (!conexaoExistente) await supabase.from("conexoes").insert([{ usuario_id: user.id, personal_id: personal.id, status: "lead" }]);
        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Encontrei seu perfil no Match Trainer e gostaria de tirar algumas dúvidas.`;
        Linking.openURL(url).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
      } else {
        if (!conexaoExistente) {
          const { data: novaConexao, error: erroCriar } = await supabase.from('conexoes').insert([{ usuario_id: user.id, personal_id: personal.id, status: 'pendente' }]).select('id').single();
          if (erroCriar) throw erroCriar;
          conexaoId = novaConexao.id;
        }
        navigation.navigate('Chat', { conexaoId: conexaoId, nomeOutro: personal.nome, fotoOutro: personal.foto_url, tipoUsuarioLogado: 'aluno' });
      }
    } catch (error) { Alert.alert("Erro", "Não foi possível iniciar o contato."); }
  };

  const abrirRedeSocial = (tipo, handle) => {
    let url = "";
    if (tipo === 'instagram') url = `https://instagram.com/${handle.replace('@', '')}`;
    if (tipo === 'tiktok') url = `https://tiktok.com/@${handle.replace('@', '')}`;
    if (tipo === 'twitter') url = `https://twitter.com/${handle.replace('@', '')}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
  };

  if (loading || !personal) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  let especialidades = {};
  try { especialidades = typeof personal.especialidades === 'string' ? JSON.parse(personal.especialidades) : personal.especialidades; } catch(e) {}
  
  const todasAsTags = [
    ...(especialidades?.objetivos || []),
    ...(especialidades?.limitacoes || []),
    ...(especialidades?.subs || [])
  ];
  
  const temGaleria = personal.galeria_fotos && Array.isArray(personal.galeria_fotos) && personal.galeria_fotos.length > 0;
  const fotoPerfil = personal.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.backgroundPure} />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text} style={{ marginLeft: -2 }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} resizeMode="cover" />
            
            {matchData && (
              <TouchableOpacity style={styles.matchBadgeFloat} activeOpacity={0.9} onPress={() => setModalMatchVisivel(true)}>
                <FontAwesome5 name="fire" size={14} color={theme.colors.backgroundPure} />
                <Text style={styles.matchBadgeText}>{matchData.percentual}% COMPATÍVEL</Text>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.backgroundPure} style={{marginLeft: 2}} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nomeText}>{personal.nome || "Profissional"}</Text>
            {personal.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={26} color={theme.colors.success} style={{ marginLeft: 6 }} />}
          </View>

          <View style={styles.locationEditorialRow}>
            <Ionicons name="location-sharp" size={14} color={theme.colors.primary} />
            <Text style={styles.locationEditorialText}>
              {formatarLocalizacaoPremium(personal.cidade, personal.bairro)}
            </Text>
          </View>

          {personal.cref && (
            <View style={styles.crefNeonCard}>
              <MaterialCommunityIcons name="card-account-details-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.crefNeonText}>CREF {personal.cref}</Text>
            </View>
          )}

          {(personal.instagram || personal.tiktok || personal.twitter) && (
            <View style={styles.socialDockContainer}>
              <View style={styles.socialDockBox}>
                {personal.instagram && (
                  <TouchableOpacity style={styles.btnSocialDock} onPress={() => abrirRedeSocial('instagram', personal.instagram)}>
                    <Ionicons name="logo-instagram" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                )}
                {personal.tiktok && (
                  <TouchableOpacity style={styles.btnSocialDock} onPress={() => abrirRedeSocial('tiktok', personal.tiktok)}>
                    <FontAwesome5 name="tiktok" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                )}
                {personal.twitter && (
                  <TouchableOpacity style={styles.btnSocialDock} onPress={() => abrirRedeSocial('twitter', personal.twitter)}>
                    <FontAwesome5 name="twitter" size={14} color="#1DA1F2" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={18} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{notaMedia ? Number(notaMedia).toFixed(1) : "--"}</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statBox}>
            <FontAwesome5 name="dumbbell" size={16} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{personal.tempo_experiencia?.split(" ")[0] || "--"}</Text>
            <Text style={styles.statLabel}>Exp.</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statBox}>
            <Ionicons name="cash" size={18} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValueHighlight}>R$ {personal.preco_medio || "--"}</Text>
            <Text style={styles.statLabel}>Por Aula</Text>
          </View>
        </View>

        {todasAsTags.length > 0 && (
          <View style={styles.cardGeral}>
            <View style={styles.cardHeaderBoxCenter}>
              <Ionicons name="ribbon" size={20} color={theme.colors.primary} style={{marginRight: 8}} />
              <Text style={styles.cardHeaderTitle}>Especialidades e Foco</Text>
            </View>
            
            <View style={styles.specialtiesListContainer}>
              {todasAsTags.map((tag, idx) => (
                <View key={`tag-${idx}`} style={styles.specialtyListItem}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} style={{marginRight: 10}} />
                  <Text style={styles.specialtyListText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <MaterialCommunityIcons name="format-quote-open" size={22} color={theme.colors.primary} style={{marginRight: 8}} />
            <Text style={styles.cardHeaderTitle}>Sobre Mim & Metodologia</Text>
          </View>
          <Text style={styles.aboutTextPremium}>
            {personal.descricao || "Este profissional ainda não adicionou detalhes sobre sua metodologia."}
          </Text>

          {especialidades?.diferenciais && (
            <View style={styles.subCardHighlight}>
              <View style={styles.diferencialHeader}>
                <Ionicons name="diamond" size={16} color={theme.colors.primary} />
                <Text style={styles.subCardTitle}>Diferenciais Competitivos</Text>
              </View>
              <Text style={styles.subCardText}>{especialidades.diferenciais}</Text>
            </View>
          )}

          {especialidades?.resultados && (
            <View style={styles.subCardHighlight}>
              <View style={styles.diferencialHeader}>
                <Ionicons name="trending-up" size={16} color={theme.colors.primary} />
                <Text style={styles.subCardTitle}>Resultados Comprovados</Text>
              </View>
              <Text style={styles.subCardText}>{especialidades.resultados}</Text>
            </View>
          )}
        </View>

        {temGaleria && (
          <View style={styles.cardGeralSemPadding}>
            <View style={[styles.cardHeaderBox, {paddingHorizontal: 20, paddingTop: 20}]}>
              <Ionicons name="images" size={18} color={theme.colors.primary} style={{marginRight: 8}} />
              <Text style={styles.cardHeaderTitle}>Portfólio Visual</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {personal.galeria_fotos.map((foto, index) => (
                <TouchableOpacity key={index} style={styles.galleryItemContainer} activeOpacity={0.95}>
                  <Image source={{ uri: foto }} style={styles.galleryImageFull} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.sectionPremium, { marginBottom: 60 }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="chatbox-ellipses" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>O que dizem os alunos</Text>
          </View>

          {avaliacoes.length === 0 ? (
            <View style={styles.luxuryEmptyState}>
              <View style={styles.starsRowEmpty}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={24} color={theme.colors.borderLight} style={{ marginHorizontal: 4 }} />
                ))}
              </View>
              <Text style={styles.luxuryEmptyTitle}>Padrão de Excelência</Text>
              <Text style={styles.luxuryEmptyText}>
                As avaliações ficarão visíveis após a conclusão do primeiro ciclo de consultoria dos alunos.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 15 }}>
              {avaliacoes.map((av) => (
                <View key={av.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Ionicons name="person" size={16} color={theme.colors.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{av.usuarios?.nome || 'Aluno Match Trainer'}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < av.nota ? "star" : "star"} size={12} color={i < av.nota ? theme.colors.primary : theme.colors.borderLight} style={{marginRight: 2}} />
                        ))}
                      </View>
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
        <Text style={styles.footerHint}>Tire suas dúvidas sem compromisso antes de decidir.</Text>
        <View style={styles.twinButtonsRow}>
          {personal.whatsapp_ativo !== false && (
            <TouchableOpacity style={styles.btnWhatsApp} onPress={() => handleContato("whatsapp")} activeOpacity={0.85}>
              <MaterialCommunityIcons name="whatsapp" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnActionSolidFull} onPress={() => handleContato("chat")} activeOpacity={0.85}>
            <Ionicons name="chatbubbles" size={20} color={theme.colors.backgroundPure} />
            <Text style={styles.btnActionSolidText}>Iniciar Conversa</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalMatchVisivel} transparent={true} animationType="fade" onRequestClose={() => setModalMatchVisivel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadgeBg}>
                <FontAwesome5 name="fire" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.modalTitle}>{matchData?.percentual}% Compatível</Text>
              <Text style={styles.modalSubtitle}>Por que {personal.nome?.split(' ')[0]} é ideal para você?</Text>
            </View>
            <View style={styles.modalBody}>
              {matchData?.motivos?.map((motivo, index) => (
                <View key={index} style={styles.motivoRow}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} style={{marginTop: 2}} />
                  <Text style={styles.motivoText}>{motivo}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.modalBtnClose} onPress={() => setModalMatchVisivel(false)} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.backgroundPure },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.backgroundPure },
  scrollContent: { paddingBottom: 160 },

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? 55 : 30, left: 20, zIndex: 10 },
  btnVoltar: { backgroundColor: "rgba(0,0,0,0.6)", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.colors.borderLight },

  heroSection: { alignItems: 'center', paddingTop: Platform.OS === "ios" ? 80 : 60, paddingHorizontal: 20, marginBottom: 25 },
  avatarWrapper: { position: 'relative', marginBottom: 25 },
  avatarImage: { width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: theme.colors.primary },
  
  matchBadgeFloat: { position: 'absolute', bottom: -12, alignSelf: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 8 },
  matchBadgeText: { color: theme.colors.backgroundPure, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  nomeText: { fontFamily: theme.fonts.title, fontSize: 32, color: theme.colors.text, textAlign: "center", letterSpacing: -0.5 },
  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 15 },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textSecondary, letterSpacing: 0.5, fontWeight: "600" },

  crefNeonCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
    gap: 8
  },
  crefNeonText: { color: theme.colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  
  socialDockContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  socialDockBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 8, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
  btnSocialDock: { width: 34, height: 34, borderRadius: 12, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },

  statsGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 30, backgroundColor: theme.colors.surfaceLight, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 8, opacity: 0.9 },
  statValue: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold' },
  statValueHighlight: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' },
  statSeparator: { width: 1, height: 40, backgroundColor: theme.colors.borderLight },

  cardGeral: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, marginHorizontal: 20, marginBottom: 35, borderWidth: 1, borderColor: theme.colors.borderLight },
  cardGeralSemPadding: { backgroundColor: theme.colors.surface, borderRadius: 24, marginHorizontal: 20, marginBottom: 35, borderWidth: 1, borderColor: theme.colors.borderLight, paddingBottom: 20 },
  cardHeaderBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardHeaderBoxCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cardHeaderTitle: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  specialtiesListContainer: { flexDirection: "column", gap: 10 },
  specialtyListItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surfaceLight, 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderRadius: 14, 
    borderLeftWidth: 3, 
    borderLeftColor: theme.colors.primary 
  },
  specialtyListText: { color: theme.colors.textBody, fontSize: 14, fontWeight: "600", letterSpacing: 0.3 },

  aboutTextPremium: { fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.textBody, lineHeight: 24 },
  subCardHighlight: { backgroundColor: theme.colors.background, padding: 16, borderRadius: 16, marginTop: 20, borderWidth: 1, borderColor: theme.colors.border },
  diferencialHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  subCardTitle: { color: theme.colors.primary, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
  subCardText: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20 },

  galleryScroll: { gap: 16, paddingHorizontal: 20 },
  galleryItemContainer: { width: width * 0.65, height: 260, backgroundColor: theme.colors.backgroundPure, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  galleryImageFull: { width: '100%', height: '100%' },

  sectionPremium: { marginHorizontal: 20, marginBottom: 35 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontFamily: theme.fonts.title, fontSize: 20, color: theme.colors.text, letterSpacing: 0.5 },

  luxuryEmptyState: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: theme.colors.borderLight, marginTop: 10 },
  starsRowEmpty: { flexDirection: 'row', marginBottom: 12 },
  luxuryEmptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.title, fontSize: 16, marginBottom: 8 },
  luxuryEmptyText: { color: theme.colors.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 20 },
  
  reviewCard: { backgroundColor: theme.colors.surfaceLight, padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewName: { color: theme.colors.text, fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  reviewStars: { flexDirection: 'row' },
  reviewText: { color: theme.colors.textSecondary, fontSize: 14, fontStyle: 'italic', lineHeight: 22 },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.95)", paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === "ios" ? 35 : 20, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerHint: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 12, fontWeight: '500' },
  twinButtonsRow: { flexDirection: "row", gap: 12 },
  
  btnWhatsApp: { backgroundColor: theme.colors.whatsapp, width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  btnActionSolidFull: { flex: 1, backgroundColor: theme.colors.primary, height: 56, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  btnActionSolidText: { color: theme.colors.backgroundPure, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: theme.colors.borderLight, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 25 },
  modalBadgeBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,107,0,0.3)' },
  modalTitle: { color: theme.colors.text, fontSize: 26, fontFamily: theme.fonts.title, marginBottom: 5 },
  modalSubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center' },
  modalBody: { width: '100%', backgroundColor: theme.colors.surfaceLight, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 25 },
  motivoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  motivoText: { color: theme.colors.textBody, fontSize: 15, fontWeight: '500', marginLeft: 12, flex: 1, lineHeight: 22 },
  modalBtnClose: { backgroundColor: theme.colors.backgroundPure, width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderLight },
  modalBtnText: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }
});