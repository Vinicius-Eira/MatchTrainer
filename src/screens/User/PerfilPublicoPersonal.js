import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Platform, Dimensions, Modal
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Octicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
    motivos.push(`Especialista no seu objetivo: ${alunoPrefs.objetivo}`);
  }

  if (alunoPrefs.limitacao && alunoPrefs.limitacao !== 'nenhuma') {
    if (personalEspecs.limitacoes?.includes(alunoPrefs.limitacao)) {
      score += 15;
      motivos.push(`Preparado para: ${alunoPrefs.limitacao}`);
      if (alunoPrefs.sub_limitacao && alunoPrefs.sub_limitacao.length > 0) {
        const trataDor = alunoPrefs.sub_limitacao.some(dor => personalEspecs.subs?.includes(dor));
        if (trataDor) {
          score += 10;
          motivos.push(`Foco na sua necessidade: ${alunoPrefs.sub_limitacao[0]}`);
        }
      } else { score += 10; }
    }
  } else { score += 25; }

  if (alunoPrefs.perfil_treinador && personalEspecs.perfil === alunoPrefs.perfil_treinador) {
    score += 20;
    motivos.push("A didática é exatamente o que você busca.");
  }

  if (alunoPrefs.investimento && personalEspecs.investimento === alunoPrefs.investimento) {
    score += 10;
    motivos.push("Encaixa perfeitamente no seu orçamento.");
  } else { score += 5; }

  if (alunoPrefs.frequencia && personalEspecs.frequencia === alunoPrefs.frequencia) {
    score += 10;
    motivos.push("Disponibilidade ideal para sua rotina.");
  } else { score += 5; }

  if(motivos.length === 0) motivos.push("Possui perfil compatível com sua região.");
  return { percentual: Math.min(99, score), motivos };
};

const getEspecialidadeInfo = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('hipertrofia')) return { icon: 'dumbbell', title: 'Hipertrofia', desc: 'Treinos elaborados para ganho de massa e volume muscular.' };
  if (t.includes('emagrecimento')) return { icon: 'fire-alt', title: 'Emagrecimento', desc: 'Metodologia de alta intensidade focada na queima de gordura.' };
  if (t.includes('saude') || t.includes('saúde') || t.includes('qualidade')) return { icon: 'heartbeat', title: 'Saúde & Bem-Estar', desc: 'Foco na melhora da qualidade de vida e condicionamento.' };
  if (t.includes('performance') || t.includes('rendimento')) return { icon: 'bolt', title: 'Performance', desc: 'Treinamento focado em alto rendimento e superação de limites.' };
  if (t.includes('gestante') || t.includes('gravidez')) return { icon: 'baby', title: 'Gestantes', desc: 'Acompanhamento seguro e adaptado para todas as fases da gravidez.' };
  if (t.includes('idoso') || t.includes('terceira') || t.includes('envelhecimento')) return { icon: 'walking', title: 'Terceira Idade', desc: 'Atenção especial à mobilidade, fortalecimento e longevidade.' };
  if (t.includes('lesão') || t.includes('lesao') || t.includes('dor') || t.includes('reabilitação') || t.includes('reabilitacao')) return { icon: 'band-aid', title: 'Reabilitação Física', desc: 'Cuidado técnico focado na prevenção e fortalecimento de lesões.' };
  if (t.includes('médica') || t.includes('medica') || t.includes('clínica') || t.includes('clinica') || t.includes('patologia')) return { icon: 'notes-medical', title: 'Acompanhamento Clínico', desc: 'Treino 100% alinhado com recomendações médicas específicas.' };
  if (t.includes('cardio') || t.includes('coração')) return { icon: 'heart-broken', title: 'Cardiopatias', desc: 'Prescrição de exercícios monitorada para a saúde do coração.' };
  if (t.includes('hiperten') || t.includes('pressão')) return { icon: 'tachometer-alt', title: 'Hipertensão', desc: 'Controle de intensidade focado na estabilidade pressórica.' };
  if (t.includes('diabet') || t.includes('glicemia')) return { icon: 'tint', title: 'Diabetes', desc: 'Manejo glicêmico através do exercício físico bem estruturado.' };
  if (t.includes('postura') || t.includes('coluna')) return { icon: 'child', title: 'Correção Postural', desc: 'Trabalho focado em core, flexibilidade e alinhamento biomecânico.' };

  return { icon: 'bullseye', title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: 'Acompanhamento especializado com foco total nesta necessidade.' };
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
        
        // CORREÇÃO: Utilizando p_id para casar com a função RPC do Supabase
        supabase.rpc("get_media_avaliacoes", { p_id: personalId }), 
        
        // CORREÇÃO: Busca as avaliações estruturadas e por ordem da mais recente
        supabase.from("avaliacoes")
          .select("id, nota, comentario, criado_em, usuarios(nome)")
          .eq("personal_id", personalId)
          .order("criado_em", { ascending: false })
          .limit(5)
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

      const { data: conexoes, error: errBusca } = await supabase
        .from('conexoes')
        .select('id, status, criado_em, atualizado_em')
        .eq('usuario_id', user.id)
        .eq('personal_id', personal.id);

      if (errBusca) throw errBusca;

      let bloqueado = false;
      let horasRestantes = 0;
      let conexaoAtivaOuPendente = null;

      if (conexoes && conexoes.length > 0) {
        for (let conn of conexoes) {
          if (['pendente', 'em_contato', 'aguardando_personal', 'aceito_personal', 'aluno_ativo', 'lead'].includes(conn.status)) {
            conexaoAtivaOuPendente = conn;
          }

          if (conn.status === 'inativo' || conn.status === 'recusado') {
            const dataCancelamento = new Date(conn.atualizado_em || conn.criado_em);
            const hoje = new Date();
            const diffHoras = Math.abs(hoje - dataCancelamento) / 36e5;

            if (diffHoras < 24) {
              bloqueado = true;
              horasRestantes = Math.ceil(24 - diffHoras);
            }
          }
        }
      }

      if (bloqueado) {
        Alert.alert(
          "Ação Bloqueada 🛑",
          `Você encerrou a parceria com este profissional recentemente.\n\nPara evitar spam no aplicativo, aguarde ${horasRestantes} hora(s) antes de tentar enviar uma nova solicitação para ele.`
        );
        return; 
      }

      let conexaoId = null;

      if (tipo === "whatsapp") {
        if (!conexaoAtivaOuPendente) {
           await supabase.from("conexoes").insert([{ usuario_id: user.id, personal_id: personal.id, status: "lead" }]);
        }
        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Encontrei seu perfil no Match Trainer e gostaria de tirar algumas dúvidas.`;
        Linking.openURL(url).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
      } else {
        if (!conexaoAtivaOuPendente) {
          const { data: novaConexao, error: erroCriar } = await supabase
            .from('conexoes')
            .insert([{ usuario_id: user.id, personal_id: personal.id, status: 'em_contato' }])
            .select('id')
            .single();
            
          if (erroCriar) throw erroCriar;
          conexaoId = novaConexao.id;
        } else {
          conexaoId = conexaoAtivaOuPendente.id;
        }
        
        navigation.navigate('Chat', { conexaoId: conexaoId, nomeOutro: personal.nome, fotoOutro: personal.foto_url, tipoUsuarioLogado: 'aluno' });
      }
    } catch (error) { 
      console.error("Erro no handleContato:", error);
      Alert.alert("Erro", "Não foi possível iniciar o contato. Tente novamente."); 
    }
  };

  const abrirRedeSocial = (tipo, handle) => {
    let url = "";
    if (tipo === 'instagram') url = `https://instagram.com/${handle.replace('@', '')}`;
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
  ].filter(tag => tag && tag !== "nenhuma");
  
  const temGaleria = personal.galeria_fotos && Array.isArray(personal.galeria_fotos) && personal.galeria_fotos.length > 0;
  const fotoPerfil = personal.foto_url || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(255, 107, 0, 0.15)', '#000000']} style={styles.heroCoverGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorderGlow}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} resizeMode="cover" />
            </View>
            
            {matchData && (
              <TouchableOpacity style={styles.matchBadgeFloat} activeOpacity={0.9} onPress={() => setModalMatchVisivel(true)}>
                <LinearGradient colors={['#FF6B00', '#FF8C00']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.matchBadgeGradient}>
                  <FontAwesome5 name="fire-alt" size={12} color="#000" />
                  <Text style={styles.matchBadgeText}>{matchData.percentual}% MATCH</Text>
                  <Octicons name="info" size={12} color="rgba(0,0,0,0.6)" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.nomeText}>{personal.nome || "Profissional"}</Text>
            {personal.cref_verificado && <MaterialCommunityIcons name="check-decagram" size={28} color={theme.colors.primary} style={{ marginLeft: 6 }} />}
          </View>

          <View style={styles.locationEditorialRow}>
            <Octicons name="location" size={14} color={theme.colors.primary} />
            <Text style={styles.locationEditorialText}>
              {formatarLocalizacaoPremium(personal.cidade, personal.bairro)}
            </Text>
          </View>

          {personal.cref && (
            <View style={styles.crefPillCentered}>
              <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.primary} />
              <Text style={styles.crefNeonText}>CREF {personal.cref}</Text>
            </View>
          )}

          {(personal.instagram) && (
            <View style={styles.socialDockContainer}>
              {personal.instagram && (
                <TouchableOpacity style={styles.btnSocialDock} onPress={() => abrirRedeSocial('instagram', personal.instagram)} activeOpacity={0.7}>
                  <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.statsFloatGrid}>
          <View style={styles.statFloatCard}>
            <Ionicons name="star" size={20} color={theme.colors.primary} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue}>{notaMedia ? Number(notaMedia).toFixed(1) : "--"}</Text>
            <Text style={styles.statFloatLabel}>Avaliação</Text>
          </View>
          
          <View style={styles.statFloatCard}>
            <FontAwesome5 name="dumbbell" size={18} color={theme.colors.primary} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue}>{personal.tempo_experiencia?.split(" ")[0] || "--"}</Text>
            <Text style={styles.statFloatLabel}>Experiência</Text>
          </View>
          
          <View style={styles.statFloatCard}>
            <MaterialCommunityIcons name="wallet-outline" size={22} color={theme.colors.primary} style={styles.statFloatIcon} />
            <Text style={styles.statFloatValue}>R$ {personal.preco_medio || "--"}</Text>
            <Text style={styles.statFloatLabel}>Por Aula</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderTitle}>
            <View style={styles.iconAccentBg}>
              <Ionicons name="person" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderTitle}>Sobre Mim</Text>
          </View>
          
          <View style={styles.aboutCard}>
            <FontAwesome5 name="quote-left" size={60} color="rgba(255, 107, 0, 0.05)" style={styles.quoteWatermark} />
            <Text style={styles.aboutTextPremium}>
              {personal.descricao || "Este profissional ainda não adicionou uma descrição sobre seu trabalho. Entre em contato para saber mais detalhes!"}
            </Text>
          </View>
        </View>

        {todasAsTags.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <Ionicons name="analytics" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardHeaderTitle}>Foco & Especificidades</Text>
            </View>
            
            <View style={styles.specialtiesColumn}>
              {todasAsTags.map((tag, idx) => {
                const info = getEspecialidadeInfo(tag);
                return (
                  <View key={`spec-${idx}`} style={styles.specialtyDetailCard}>
                    <View style={styles.specialtyIconBg}>
                      <FontAwesome5 name={info.icon} size={18} color={theme.colors.primary} />
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

        {(especialidades?.diferenciais || especialidades?.resultados) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderTitle}>
              <View style={styles.iconAccentBg}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardHeaderTitle}>Por que treinar comigo?</Text>
            </View>

            <View style={styles.diferenciaisRow}>
              {especialidades?.diferenciais && (
                <View style={[styles.achievementCard, { flex: 1, marginRight: 6 }]}>
                  <View style={styles.achievementHeader}>
                    <Ionicons name="diamond" size={18} color={theme.colors.primary} />
                    <Text style={styles.achievementTitle}>Diferencial</Text>
                  </View>
                  <Text style={styles.achievementText}>{especialidades.diferenciais}</Text>
                </View>
              )}

              {especialidades?.resultados && (
                <View style={[styles.achievementCard, { flex: 1, marginLeft: 6 }]}>
                  <View style={styles.achievementHeader}>
                    <Ionicons name="trophy" size={18} color={theme.colors.primary} />
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
                <Ionicons name="images" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardHeaderTitle}>Portfólio</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {personal.galeria_fotos.map((foto, index) => (
                <TouchableOpacity key={index} style={styles.galleryItemContainer} activeOpacity={0.9}>
                  <Image source={{ uri: foto }} style={styles.galleryImageFull} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.galleryOverlay}>
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
              <Ionicons name="chatbox-ellipses" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderTitle}>O que dizem sobre mim</Text>
          </View>

          {avaliacoes.length === 0 ? (
            <View style={styles.luxuryEmptyState}>
              <Ionicons name="star-outline" size={40} color="rgba(255,107,0,0.2)" style={{ marginBottom: 12 }} />
              <Text style={styles.luxuryEmptyTitle}>Padrão de Excelência</Text>
              <Text style={styles.luxuryEmptyText}>
                As avaliações ficarão visíveis após a conclusão do primeiro ciclo dos alunos.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 5 }}>
              {avaliacoes.map((av) => (
                <View key={av.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarLetter}>
                        {av.usuarios?.nome ? av.usuarios.nome.charAt(0).toUpperCase() : 'A'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{av.usuarios?.nome || 'Aluno Match Trainer'}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={13} color={theme.colors.primary} style={{marginRight: 2}} />
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

      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.conversionFooter}>
        <Text style={styles.footerHint}>Tire suas dúvidas sem compromisso.</Text>
        <View style={styles.twinButtonsRow}>
          {personal.whatsapp_ativo !== false && (
            <TouchableOpacity style={styles.btnWhatsApp} onPress={() => handleContato("whatsapp")} activeOpacity={0.85}>
              <MaterialCommunityIcons name="whatsapp" size={26} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnActionSolidFull} onPress={() => handleContato("chat")} activeOpacity={0.85}>
            <Ionicons name="chatbubbles-outline" size={22} color="#000" />
            <Text style={styles.btnActionSolidText}>Iniciar Conversa</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <Modal visible={modalMatchVisivel} transparent={true} animationType="fade" onRequestClose={() => setModalMatchVisivel(false)}>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadgeBg}>
                <FontAwesome5 name="fire-alt" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.modalTitle}>{matchData?.percentual}% Compatível</Text>
              <Text style={styles.modalSubtitle}>Por que {personal.nome?.split(' ')[0]} é ideal para você?</Text>
            </View>
            <View style={styles.modalBody}>
              {matchData?.motivos?.map((motivo, index) => (
                <View key={index} style={styles.motivoRow}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} style={{marginTop: 2}} />
                  <Text style={styles.motivoText}>{motivo}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.modalBtnClose} onPress={() => setModalMatchVisivel(false)} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>Fechar Análise</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  scrollContent: { paddingBottom: 180 }, 

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? 55 : 40, left: 20, zIndex: 100 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },

  heroSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 15, position: 'relative' },
  heroCoverGradient: { position: 'absolute', top: 0, width: width, height: 280, opacity: 0.8 },
  
  avatarWrapper: { position: 'relative', marginBottom: 20, zIndex: 2 },
  avatarBorderGlow: { padding: 4, borderRadius: 100, backgroundColor: "#000", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 20 },
  avatarImage: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: "rgba(255,107,0,0.5)" },
  
  matchBadgeFloat: { position: 'absolute', bottom: -12, alignSelf: 'center' },
  matchBadgeGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", shadowColor: "#FF6B00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  matchBadgeText: { color: "#000", fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6, marginTop: 15 },
  nomeText: { fontFamily: theme.fonts.title, fontSize: 32, color: "#FFF", textAlign: "center", letterSpacing: -0.5 },
  
  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: 14, color: "#AAA", letterSpacing: 0.5, fontWeight: "500" },

  crefPillCentered: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: "#111", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,107,0,0.4)", marginBottom: 20, gap: 6 },
  crefNeonText: { color: "#FFF", fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  
  socialDockContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  btnSocialDock: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#111", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },

  statsFloatGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 40, gap: 10 },
  statFloatCard: { flex: 1, backgroundColor: "#0A0A0A", paddingVertical: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: "#1A1A1A", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 },
  statFloatIcon: { marginBottom: 10 },
  statFloatValue: { color: "#FFF", fontSize: 20, fontWeight: '900', fontFamily: theme.fonts.title, letterSpacing: -0.5 },
  statFloatLabel: { color: "#666", fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' },

  sectionContainer: { marginHorizontal: 20, marginBottom: 35 },
  sectionHeaderTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconAccentBg: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,107,0,0.1)", justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: 20, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  aboutCard: { backgroundColor: "#0A0A0A", padding: 24, borderRadius: 24, borderWidth: 1, borderColor: "#1A1A1A", position: 'relative', overflow: 'hidden' },
  quoteWatermark: { position: 'absolute', top: -5, left: 10 },
  aboutTextPremium: { fontFamily: theme.fonts.body, fontSize: 15, color: "#BBB", lineHeight: 26, zIndex: 1, paddingTop: 15 },

  specialtiesColumn: { gap: 12 },
  specialtyDetailCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#0A0A0A", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#1A1A1A" },
  specialtyIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255, 107, 0, 0.08)", justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)" },
  specialtyTextWrap: { flex: 1 },
  specialtyTitle: { color: "#FFF", fontSize: 15, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.3 },
  specialtyDesc: { color: "#888", fontSize: 13, lineHeight: 18 },

  diferenciaisRow: { flexDirection: 'row', justifyContent: 'space-between' },
  achievementCard: { backgroundColor: "#0A0A0A", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#1A1A1A", position: 'relative', overflow: 'hidden' },
  achievementHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  achievementTitle: { color: theme.colors.primary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  achievementText: { color: "#AAA", fontSize: 14, lineHeight: 22 },

  galleryContainer: { marginBottom: 35 },
  galleryScroll: { gap: 16, paddingHorizontal: 20 },
  galleryItemContainer: { width: width * 0.75, height: 320, backgroundColor: "#0A0A0A", borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: "#1A1A1A" },
  galleryImageFull: { width: '100%', height: '100%' },
  galleryOverlay: { position: 'absolute', bottom: 0, width: '100%', height: 100, justifyContent: 'flex-end', padding: 15, alignItems: 'flex-end' },
  galleryIconExpand: { backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 20, overflow: 'hidden' },

  luxuryEmptyState: { backgroundColor: "#0A0A0A", borderRadius: 24, padding: 35, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1A1A1A", borderStyle: 'dashed' },
  luxuryEmptyTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: 18, marginBottom: 8 },
  luxuryEmptyText: { color: "#666", fontSize: 14, textAlign: "center", lineHeight: 22 },
  
  reviewCard: { backgroundColor: "#0A0A0A", padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: "#1A1A1A" },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1A1A1A", justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: "#333" },
  reviewAvatarLetter: { color: "#888", fontSize: 18, fontWeight: 'bold', fontFamily: theme.fonts.title },
  reviewName: { color: "#FFF", fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  reviewStars: { flexDirection: 'row' },
  reviewText: { color: "#BBB", fontSize: 15, fontStyle: 'italic', lineHeight: 24 },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === "ios" ? 35 : 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  twinButtonsRow: { flexDirection: "row", gap: 12 },
  btnWhatsApp: { backgroundColor: "#25D366", width: 60, height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnActionSolidFull: { flex: 1, backgroundColor: theme.colors.primary, height: 60, borderRadius: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnActionSolidText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },
  footerHint: { color: "#888", fontSize: 12, textAlign: 'center', fontWeight: '600', marginBottom: 12, letterSpacing: 0.5 },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: "#0A0A0A", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "#222", alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 1, shadowRadius: 40 },
  modalHeader: { alignItems: 'center', marginBottom: 25 },
  modalBadgeBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  modalTitle: { color: "#FFF", fontSize: 26, fontFamily: theme.fonts.title, marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { color: "#888", fontSize: 14, textAlign: 'center' },
  modalBody: { width: '100%', backgroundColor: "#111", borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: "#222" },
  motivoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  motivoText: { color: "#CCC", fontSize: 14, fontWeight: '500', marginLeft: 12, flex: 1, lineHeight: 22 },
  modalBtnClose: { backgroundColor: "rgba(255,255,255,0.05)", width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  modalBtnText: { color: "#FFF", fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }
});                                                                                                                                                                  