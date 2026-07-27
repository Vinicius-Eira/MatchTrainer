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

const { width, height } = Dimensions.get('window');

const formatarLocalizacaoPremium = (cidade, bairro) => {
  if (!cidade && !bairro) return "LOCAL NÃO DEFINIDO";
  if (bairro && cidade) return `${bairro.trim()}, ${cidade.trim()}`;
  if (bairro) return bairro.trim();
  return cidade.trim();
};

const calcularPorcentagemMatch = (alunoPrefs, personal, precoAvaliar, matchType) => {
  let score = 20; 
  let motivos = [];
  
  if (!alunoPrefs || !personal) return { percentual: 50, motivos: ["Faltam dados para análise exata."] };
  
  let specs = null;
  try { specs = typeof personal.especialidades === 'string' ? JSON.parse(personal.especialidades) : personal.especialidades; } catch(e){}

  if (alunoPrefs.objetivo && specs?.objetivos?.includes(alunoPrefs.objetivo)) {
    score += 30;
    motivos.push(`Especialista no seu objetivo principal: ${alunoPrefs.objetivo}.`);
  }

  if (alunoPrefs.turno_preferido === "Indiferente" || (alunoPrefs.turno_preferido && personal.turnos_disponiveis?.includes(alunoPrefs.turno_preferido))) {
    score += 15;
    motivos.push("O horário de atendimento dele é perfeitamente compatível com a sua rotina.");
  }

  if (alunoPrefs.limitacao && alunoPrefs.limitacao !== 'nenhuma') {
    if (specs?.limitacoes?.includes(alunoPrefs.limitacao)) {
      score += 10;
      motivos.push("Tem qualificação para cuidar da sua necessidade/restrição.");
    }
  } else {
    score += 10; 
  }

  let priceMatch = false;
  if (alunoPrefs.investimento && precoAvaliar) {
    if (alunoPrefs.investimento === "base" && precoAvaliar <= 120) priceMatch = true;
    else if (alunoPrefs.investimento === "mid" && precoAvaliar >= 110 && precoAvaliar <= 160) priceMatch = true;
    else if (alunoPrefs.investimento === "premium" && precoAvaliar >= 150) priceMatch = true;
  }
  if (priceMatch) {
    score += 10;
    motivos.push(`A mensalidade se encaixa perfeitamente no seu orçamento para ${matchType}.`);
  }

  if (alunoPrefs.genero_treinador === "Indiferente" || alunoPrefs.genero_treinador === personal.genero) {
    score += 10;
    motivos.push("Possui o perfil pessoal que você procura.");
  }

  if (alunoPrefs.perfil_treinador && specs?.perfil === alunoPrefs.perfil_treinador) {
    score += 4;
    motivos.push("A didática dele(a) é exatamente o que você busca.");
  }

  if(motivos.length === 0) motivos.push("Possui um perfil de treino altamente compatível com você.");
  
  return { percentual: Math.min(99, score), motivos };
};

const getMotivoStyle = (texto) => {
  const t = texto.toLowerCase();
  if (t.includes('objetivo')) return { icon: 'bullseye', color: '#0A84FF', title: 'Objetivo Alinhado', bg: 'rgba(10, 132, 255, 0.1)' };
  if (t.includes('horário') || t.includes('rotina')) return { icon: 'clock', color: '#FF9500', title: 'Horário Compatível', bg: 'rgba(255, 149, 0, 0.1)' };
  if (t.includes('cuidar') || t.includes('necessidade')) return { icon: 'heartbeat', color: '#FF3B30', title: 'Saúde Protegida', bg: 'rgba(255, 59, 48, 0.1)' };
  if (t.includes('perfil pessoal') || t.includes('didática')) return { icon: 'user-graduate', color: '#FFD60A', title: 'Conexão Pessoal', bg: 'rgba(255, 214, 10, 0.1)' };
  if (t.includes('orçamento')) return { icon: 'wallet', color: '#32ADE6', title: 'Investimento Aprovado', bg: 'rgba(50, 173, 230, 0.1)' };
  return { icon: 'check-circle', color: '#00E676', title: 'Afinidade Geral', bg: 'rgba(0, 230, 118, 0.1)' };
};

const getEspecialidadeInfo = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('hipertrofia')) return { icon: 'dumbbell', title: 'Hipertrofia', desc: 'Treinos elaborados para ganho de massa e volume muscular.' };
  if (t.includes('emagrecimento')) return { icon: 'fire-alt', title: 'Emagrecimento', desc: 'Metodologia de alta intensidade focada na queima de gordura.' };
  if (t.includes('saude') || t.includes('saúde') || t.includes('qualidade')) return { icon: 'heartbeat', title: 'Saúde & Bem-Estar', desc: 'Foco na melhora da qualidade de vida e condicionamento.' };
  if (t.includes('performance') || t.includes('rendimento')) return { icon: 'bolt', title: 'Performance', desc: 'Treinamento focado em alto rendimento e superação de limites.' };
  if (t.includes('gestante') || t.includes('gravidez')) return { icon: 'baby', title: 'Gestantes', desc: 'Acompanhamento seguro e adaptado para todas as fases da gravidez.' };
  if (t.includes('idoso') || t.includes('terceira') || t.includes('envelhecimento')) return { icon: 'walking', title: 'Terceira Idade', desc: 'Atenção especial à mobilidade, fortalecimento e longevidade.' };
  if (t.includes('lesão') || t.includes('lesao') || t.includes('dor') || t.includes('reabilitação')) return { icon: 'band-aid', title: 'Reabilitação Física', desc: 'Cuidado técnico focado na prevenção e fortalecimento de lesões.' };
  if (t.includes('médica') || t.includes('medica') || t.includes('clínica')) return { icon: 'notes-medical', title: 'Acompanhamento Clínico', desc: 'Treino 100% alinhado com recomendações médicas específicas.' };
  if (t.includes('cardio') || t.includes('coração')) return { icon: 'heart-broken', title: 'Cardiopatias', desc: 'Prescrição de exercícios monitorada para a saúde do coração.' };
  if (t.includes('hiperten') || t.includes('pressão')) return { icon: 'tachometer-alt', title: 'Hipertensão', desc: 'Controle de intensidade focado na estabilidade pressórica.' };
  if (t.includes('diabet') || t.includes('glicemia')) return { icon: 'tint', title: 'Diabetes', desc: 'Manejo glicêmico através do exercício físico.' };
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
  
  const [precoExibido, setPrecoExibido] = useState("--");
  const [labelPrecoExibido, setLabelPrecoExibido] = useState("Valor");

  useEffect(() => { carregarPerfilCompleto(); }, [personalId]);

  const carregarPerfilCompleto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [reqPersonal, reqNota, reqAvaliacoes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { p_id: personalId }), 
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
        const alunoPrefs = uData?.preferencias || {};
        
        const modalidadeAluno = alunoPrefs.servicos_buscados || ["Consultoria", "Presencial"];
        const modalidadesPersonal = prof.servicos_oferecidos || ["Consultoria", "Presencial"];
        
        let matchType = "Híbrido";
        if (modalidadeAluno.includes("Consultoria") && !modalidadeAluno.includes("Presencial")) matchType = "Consultoria";
        else if (modalidadeAluno.includes("Presencial") && !modalidadeAluno.includes("Consultoria")) matchType = "Presencial";

        let precoA = matchType === "Consultoria" ? prof.preco_consultoria : prof.preco_presencial;
        if (!precoA) precoA = prof.preco_medio;

        setPrecoExibido(precoA);
        setLabelPrecoExibido(matchType === "Consultoria" ? "Mensalidade" : "Por Aula");

        const matchCalculado = calcularPorcentagemMatch(alunoPrefs, prof, precoA, matchType);
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
          `Você encerrou a parceria com este profissional recentemente.\n\nPara evitar spam, aguarde ${horasRestantes} hora(s) antes de tentar enviar uma nova solicitação.`
        );
        return; 
      }

      let conexaoId = null;
      setModalMatchVisivel(false);

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
  const modalidadesAtendidas = personal.servicos_oferecidos || ["Consultoria", "Presencial"];
  
  const isPoucasVagas = personal.status_agenda === "Poucas Vagas" || personal.status_agenda === "Quase Lotada";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🚀 TAG DE ESCASSEZ NO TOPO DO PERFIL */}
        {isPoucasVagas && (
          <View style={styles.escassezBanner}>
            <Ionicons name="time" size={16} color="#FFF" style={{marginRight: 6}} />
            <Text style={styles.escassezText}>
              Este treinador está com <Text style={{fontWeight: '900', color: '#FFF'}}>{personal.status_agenda.toUpperCase()}</Text>. Envie sua mensagem logo!
            </Text>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={['rgba(255, 107, 0, 0.15)', '#000000']} style={styles.heroCoverGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorderGlow}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} resizeMode="cover" />
            </View>
            
            {matchData && (
              <TouchableOpacity style={styles.matchBadgeFloat} activeOpacity={0.9} onPress={() => setModalMatchVisivel(true)}>
                <BlurView intensity={80} tint="dark" style={styles.matchBadgeGlass}>
                  <FontAwesome5 name="fire-alt" size={14} color={theme.colors.primary} />
                  <Text style={styles.matchBadgeText}>{matchData.percentual}% COMPATÍVEL</Text>
                  <View style={styles.matchBadgeIconBg}>
                    <Ionicons name="chevron-forward" size={12} color="#FFF" />
                  </View>
                </BlurView>
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

          <View style={styles.modalidadesRow}>
            {modalidadesAtendidas.map(mod => (
              <View key={mod} style={styles.modalityTag}>
                <Ionicons name={mod === "Consultoria" ? "phone-portrait" : "barbell"} size={12} color="#000" />
                <Text style={styles.modalityTagText}>{mod}</Text>
              </View>
            ))}
          </View>

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
            <Text style={styles.statFloatValue}>R$ {precoExibido}</Text>
            <Text style={styles.statFloatLabel}>{labelPrecoExibido}</Text>
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
        <BlurView intensity={100} tint="dark" style={styles.modalMatchOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setModalMatchVisivel(false)} />
          
          <View style={styles.matchReportCard}>
            
            <View style={styles.matchReportHeader}>
              <View style={styles.scoreCircle}>
                <LinearGradient colors={['#FF8C00', '#FF3B30']} style={StyleSheet.absoluteFill} borderRadius={50} opacity={0.2} />
                <Text style={styles.scoreText}>{matchData?.percentual}%</Text>
                <Text style={styles.scoreLabel}>MATCH</Text>
              </View>
              <Text style={styles.matchReportTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.matchReportSubtitle}>
                Por que <Text style={{color: '#FFF'}}>{personal?.nome?.split(' ')[0]}</Text> é o treinador ideal para você?
              </Text>
            </View>

            <ScrollView style={styles.matchReasonsScroll} showsVerticalScrollIndicator={false}>
              {matchData?.motivos?.map((motivo, index) => {
                const styleInfo = getMotivoStyle(motivo);
                return (
                  <View key={index} style={styles.reasonCard}>
                    <View style={[styles.reasonIconBox, { backgroundColor: styleInfo.bg }]}>
                      <FontAwesome5 name={styleInfo.icon} size={16} color={styleInfo.color} />
                    </View>
                    <View style={styles.reasonTextWrap}>
                      <Text style={[styles.reasonTitle, { color: styleInfo.color }]}>{styleInfo.title}</Text>
                      <Text style={styles.reasonText}>{motivo}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.matchReportFooter}>
              <TouchableOpacity style={styles.btnReportClose} onPress={() => setModalMatchVisivel(false)} activeOpacity={0.8}>
                <Text style={styles.btnReportCloseText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnReportAction} onPress={() => handleContato("chat")} activeOpacity={0.8}>
                <Ionicons name="chatbubbles" size={18} color="#000" style={{marginRight: 6}} />
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
  container: { flex: 1, backgroundColor: "#050505" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#050505" },
  scrollContent: { paddingBottom: 180 }, 

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? 55 : 40, left: 20, zIndex: 100 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },

  escassezBanner: { flexDirection: 'row', backgroundColor: '#FF3B30', paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', paddingTop: Platform.OS === "ios" ? 55 : 40, zIndex: 90 },
  escassezText: { color: '#FFF', fontSize: 12, fontWeight: '600', flexShrink: 1 },

  heroSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 15, position: 'relative' },
  heroCoverGradient: { position: 'absolute', top: 0, width: width, height: 280, opacity: 0.8 },
  
  avatarWrapper: { position: 'relative', marginBottom: 20, zIndex: 2 },
  avatarBorderGlow: { padding: 4, borderRadius: 100, backgroundColor: "#000", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 20 },
  avatarImage: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: "rgba(255,107,0,0.5)" },
  
  matchBadgeFloat: { position: 'absolute', bottom: -12, alignSelf: 'center', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: "rgba(255,107,0,0.4)" },
  matchBadgeGlass: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 14, paddingRight: 6, paddingVertical: 6 },
  matchBadgeText: { color: "#FFF", fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  matchBadgeIconBg: { backgroundColor: theme.colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },

  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6, marginTop: 15 },
  nomeText: { fontFamily: theme.fonts.title, fontSize: 32, color: "#FFF", textAlign: "center", letterSpacing: -0.5 },
  
  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: 14, color: "#AAA", letterSpacing: 0.5, fontWeight: "500" },

  crefPillCentered: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: "#111", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,107,0,0.4)", marginBottom: 20, gap: 6 },
  crefNeonText: { color: "#FFF", fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  
  modalidadesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  modalityTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 6 },
  modalityTagText: { color: "#000", fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

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

  modalMatchOverlay: { flex: 1, justifyContent: 'flex-end' },
  matchReportCard: { width: '100%', backgroundColor: "#0F0F0F", borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20, maxHeight: height * 0.85 },
  matchReportHeader: { alignItems: 'center', marginBottom: 25 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' },
  scoreText: { color: "#FFF", fontSize: 32, fontFamily: theme.fonts.title },
  scoreLabel: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginTop: -4 },
  matchReportTitle: { color: "#FFF", fontSize: 24, fontFamily: theme.fonts.title, marginBottom: 8, letterSpacing: -0.5 },
  matchReportSubtitle: { color: "#888", fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  
  matchReasonsScroll: { width: '100%', marginBottom: 20 },
  reasonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1A1A1A", padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: "#2A2A2A" },
  reasonIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  reasonTextWrap: { flex: 1 },
  reasonTitle: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  reasonText: { color: "#AAA", fontSize: 14, lineHeight: 20 },

  matchReportFooter: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnReportClose: { flex: 1, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  btnReportCloseText: { color: "#FFF", fontSize: 15, fontWeight: 'bold' },
  btnReportAction: { flex: 1, height: 56, borderRadius: 16, backgroundColor: theme.colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnReportActionText: { color: "#000", fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 }
});