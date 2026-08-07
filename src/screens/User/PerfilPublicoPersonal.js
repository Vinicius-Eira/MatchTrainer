import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../utils/responsive";

const { width, height } = Dimensions.get("window");

const formatarLocalizacaoPremium = (cidade, bairro) => {
  if (!cidade && !bairro) return "LOCAL NÃO DEFINIDO";
  if (bairro && cidade) return `${bairro.trim()}, ${cidade.trim()}`;
  if (bairro) return bairro.trim();
  return cidade.trim();
};

const getMotivoStyle = (texto) => {
  const t = texto.toLowerCase();
  if (t.includes("objetivo")) return { icon: "bullseye", color: "#0A84FF", title: "Objetivo Alinhado", bg: "rgba(10, 132, 255, 0.1)" };
  if (t.includes("horário") || t.includes("rotina") || t.includes("turno")) return { icon: "clock", color: "#FF9500", title: "Horário Compatível", bg: "rgba(255, 149, 0, 0.1)" };
  if (t.includes("cuidar") || t.includes("necessidade") || t.includes("experiência")) return { icon: "heartbeat", color: "#FF3B30", title: "Saúde Protegida", bg: "rgba(255, 59, 48, 0.1)" };
  if (t.includes("perfil") || t.includes("didática") || t.includes("preferência")) return { icon: "user-graduate", color: "#FFD60A", title: "Conexão Pessoal", bg: "rgba(255, 214, 10, 0.1)" };
  if (t.includes("orçamento") || t.includes("preço")) return { icon: "wallet", color: "#32ADE6", title: "Investimento Aprovado", bg: "rgba(50, 173, 230, 0.1)" };
  if (t.includes("km") || t.includes("distância")) return { icon: "map-marker-alt", color: "#00E676", title: "Perto de Você", bg: "rgba(0, 230, 118, 0.1)" };
  return { icon: "check-circle", color: "#00E676", title: "Afinidade Geral", bg: "rgba(0, 230, 118, 0.1)" };
};

const getEspecialidadeInfo = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes("hipertrofia")) return { icon: "dumbbell", title: "Hipertrofia", desc: "Treinos elaborados para ganho de massa e volume muscular." };
  if (t.includes("emagrecimento")) return { icon: "fire-alt", title: "Emagrecimento", desc: "Metodologia de alta intensidade focada na queima de gordura." };
  if (t.includes("saude") || t.includes("saúde") || t.includes("qualidade")) return { icon: "heartbeat", title: "Saúde & Bem-Estar", desc: "Foco na melhora da qualidade de vida e condicionamento." };
  if (t.includes("performance") || t.includes("rendimento")) return { icon: "bolt", title: "Performance", desc: "Treinamento focado em alto rendimento e superação de limites." };
  if (t.includes("gestante") || t.includes("gravidez")) return { icon: "baby", title: "Gestantes", desc: "Acompanhamento seguro e adaptado para todas as fases da gravidez." };
  if (t.includes("idoso") || t.includes("terceira") || t.includes("envelhecimento")) return { icon: "walking", title: "Terceira Idade", desc: "Atenção especial à mobilidade, fortalecimento e longevidade." };
  if (t.includes("lesão") || t.includes("lesao") || t.includes("dor") || t.includes("reabilitação")) return { icon: "band-aid", title: "Reabilitação Física", desc: "Cuidado técnico focado na prevenção e fortalecimento de lesões." };
  if (t.includes("médica") || t.includes("medica") || t.includes("clínica")) return { icon: "notes-medical", title: "Acompanhamento Clínico", desc: "Treino 100% alinhado com recomendações médicas específicas." };
  if (t.includes("cardio") || t.includes("coração")) return { icon: "heart-broken", title: "Cardiopatias", desc: "Prescrição de exercícios monitorada para a saúde do coração." };
  if (t.includes("hiperten") || t.includes("pressão")) return { icon: "tachometer-alt", title: "Hipertensão", desc: "Controle de intensidade focado na estabilidade pressórica." };
  if (t.includes("diabet") || t.includes("glicemia")) return { icon: "tint", title: "Diabetes", desc: "Manejo glicêmico através do exercício físico." };
  if (t.includes("postura") || t.includes("coluna")) return { icon: "child", title: "Correção Postural", desc: "Trabalho focado em core, flexibilidade e alinhamento biomecânico." };
  return { icon: "bullseye", title: tag.charAt(0).toUpperCase() + tag.slice(1), desc: "Acompanhamento especializado com foco total nesta necessidade." };
};

export default function PerfilPublicoPersonal({ route, navigation }) {
  const { personalId, matchPreCalculado } = route.params;
  
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notaMedia, setNotaMedia] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  
  const [modalMatchVisivel, setModalMatchVisivel] = useState(false);
  const [propostaPendenteId, setPropostaPendenteId] = useState(null);

  const [precoExibido, setPrecoExibido] = useState("--");
  const [labelPrecoExibido, setLabelPrecoExibido] = useState("Valor");

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarPerfilCompleto();
    });
    return unsubscribe;
  }, [navigation, personalId]);

  const carregarPerfilCompleto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const [reqPersonal, reqNota, reqAvaliacoes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", personalId).single(),
        supabase.rpc("get_media_avaliacoes", { p_id: personalId }),
        supabase.from("avaliacoes").select("id, nota, comentario, criado_em, usuarios(nome)").eq("personal_id", personalId).order("criado_em", { ascending: false }).limit(5),
      ]);

      if (reqPersonal.error) throw reqPersonal.error;
      const prof = reqPersonal.data;
      setPersonal(prof);
      setNotaMedia(reqNota.data);
      if (reqAvaliacoes.data) setAvaliacoes(reqAvaliacoes.data);

      if (user) {
        const { data: connData } = await supabase
          .from("conexoes")
          .select("id, status")
          .eq("usuario_id", user.id)
          .eq("personal_id", personalId)
          .eq("status", "aguardando_assinatura")
          .maybeSingle();
          
        if (connData) {
          setPropostaPendenteId(connData.id);
        } else {
          setPropostaPendenteId(null);
        }

        const { data: uData } = await supabase.from("usuarios").select("preferencias").eq("id", user.id).single();
        const alunoPrefs = uData?.preferencias || {};

        const modalidadeAluno = alunoPrefs.servicos_buscados || ["Consultoria", "Presencial"];
        let matchType = "Híbrido";
        if (modalidadeAluno.includes("Consultoria") && !modalidadeAluno.includes("Presencial")) matchType = "Consultoria";
        else if (modalidadeAluno.includes("Presencial") && !modalidadeAluno.includes("Consultoria")) matchType = "Presencial";

        let precoA = matchType === "Consultoria" ? prof.preco_consultoria : prof.preco_presencial;
        if (!precoA) precoA = prof.preco_medio;

        setPrecoExibido(precoA);
        setLabelPrecoExibido(matchType === "Consultoria" ? "Mensalidade" : "Por Aula");
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
        .from("conexoes")
        .select("id, status, criado_em, atualizado_em")
        .eq("usuario_id", user.id) 
        .eq("personal_id", personal.id);

      if (errBusca) throw errBusca;

      let bloqueado = false;
      let horasRestantes = 0;
      let conexaoExistente = null;

      if (conexoes && conexoes.length > 0) {
        conexoes.sort((a, b) => new Date(b.atualizado_em || b.criado_em) - new Date(a.atualizado_em || a.criado_em));
        conexaoExistente = conexoes[0];

        if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
          const dataCancelamento = new Date(conexaoExistente.atualizado_em || conexaoExistente.criado_em);
          const hoje = new Date();
          const diffHoras = Math.abs(hoje - dataCancelamento) / 36e5;
          if (diffHoras < 24) {
            bloqueado = true;
            horasRestantes = Math.ceil(24 - diffHoras);
          }
        }
      }

      if (bloqueado) {
        Alert.alert("Ação Bloqueada 🛑", `Você encerrou a parceria com este profissional recentemente.\n\nAguarde ${horasRestantes} hora(s) antes de enviar nova solicitação.`);
        return;
      }

      let conexaoIdFinal = null;
      setModalMatchVisivel(false);

      if (tipo === "whatsapp") {
        if (!conexaoExistente) {
          await supabase.from("conexoes").insert([{ usuario_id: user.id, personal_id: personal.id, status: "em_contato" }]);
        } else if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
           await supabase.from("conexoes").update({ status: "em_contato" }).eq("id", conexaoExistente.id);
        }
        const numLimpo = personal.telefone?.replace(/\D/g, "");
        const url = `whatsapp://send?phone=55${numLimpo}&text=Olá ${personal.nome}! Encontrei seu perfil no Match Trainer e gostaria de tirar algumas dúvidas.`;
        Linking.openURL(url).catch(() => Alert.alert("Erro", "WhatsApp não instalado."));
      } else {
        if (!conexaoExistente) {
          const { data: novaConexao, error: erroCriar } = await supabase
            .from("conexoes")
            .insert([{ usuario_id: user.id, personal_id: personal.id, status: "pendente" }])
            .select("id")
            .single();
          
          if (erroCriar) throw erroCriar;
          conexaoIdFinal = novaConexao.id;
        } else {
          conexaoIdFinal = conexaoExistente.id;
          if (conexaoExistente.status === "inativo" || conexaoExistente.status === "recusado") {
            await supabase.from("conexoes").update({ status: "pendente" }).eq("id", conexaoIdFinal);
          }
        }
        
        navigation.navigate("Chat", {
          conexaoId: conexaoIdFinal,
          nomeOutro: personal.nome,
          fotoOutro: personal.foto_url,
          tipoUsuarioLogado: "aluno",
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível iniciar o contato. Tente novamente.");
    }
  };

  const abrirRedeSocial = (tipo, handle) => {
    let url = "";
    if (tipo === "instagram") url = `https://instagram.com/${handle.replace("@", "")}`;
    Linking.openURL(url).catch(() => Alert.alert("Erro", "Não foi possível abrir o link."));
  };

  if (loading || !personal) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  let especialidades = {};
  try {
    especialidades = typeof personal.especialidades === "string" ? JSON.parse(personal.especialidades) : personal.especialidades;
  } catch (e) {}

  const todasAsTags = [
    ...(especialidades?.objetivos || []),
    ...(especialidades?.limitacoes || []),
    ...(especialidades?.subs || []),
  ].filter((tag) => tag && tag !== "nenhuma");

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
        {isPoucasVagas && (
          <View style={styles.escassezBanner}>
            <Ionicons name="time" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.escassezText}>
              Este treinador está com <Text style={{ fontWeight: "900", color: "#FFF" }}>{personal.status_agenda.toUpperCase()}</Text>. Envie sua mensagem logo!
            </Text>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "#000000"]} style={styles.heroCoverGradient} />

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorderGlow}>
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} resizeMode="cover" />
            </View>

            {matchPreCalculado && (
              <TouchableOpacity style={styles.matchBadgeFloat} activeOpacity={0.9} onPress={() => setModalMatchVisivel(true)}>
                <BlurView intensity={80} tint="dark" style={styles.matchBadgeGlass}>
                  <FontAwesome5 name="fire-alt" size={14} color={theme.colors.primary} />
                  <Text style={styles.matchBadgeText}>{matchPreCalculado.matchPercentual}% COMPATÍVEL</Text>
                  <View style={styles.matchBadgeIconBg}>
                    <Ionicons name="chevron-forward" size={12} color="#FFF" />
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
            <Octicons name="location" size={14} color={theme.colors.primary} />
            <Text style={styles.locationEditorialText}>{formatarLocalizacaoPremium(personal.cidade, personal.bairro)}</Text>
          </View>

          {personal.cref && (
            <View style={styles.crefPillCentered}>
              <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.primary} />
              <Text style={styles.crefNeonText}>CREF {personal.cref}</Text>
            </View>
          )}

          <View style={styles.modalidadesRow}>
            {modalidadesAtendidas.map((mod) => (
              <View key={mod} style={styles.modalityTag}>
                <Ionicons name={mod === "Consultoria" ? "phone-portrait" : "barbell"} size={12} color="#000" />
                <Text style={styles.modalityTagText}>{mod}</Text>
              </View>
            ))}
          </View>

          {personal.instagram && (
            <View style={styles.socialDockContainer}>
              {personal.instagram && (
                <TouchableOpacity style={styles.btnSocialDock} onPress={() => abrirRedeSocial("instagram", personal.instagram)} activeOpacity={0.7}>
                  <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {propostaPendenteId && (
          <View style={styles.propostaBanner}>
            <View style={styles.propostaBannerContent}>
              <Ionicons name="mail-unread" size={28} color="#FFD700" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.propostaBannerTitle}>Você tem uma Proposta!</Text>
                <Text style={styles.propostaBannerText}>Este personal montou um plano exclusivo com valores para você.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.btnVerProposta}
              onPress={() => navigation.navigate("PropostaAluno", { conexaoId: propostaPendenteId })}
              activeOpacity={0.8}
            >
              <Text style={styles.btnVerPropostaText}>Ver Proposta VIP</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={styles.aboutTextPremium}>{personal.descricao || "Este profissional ainda não adicionou uma descrição sobre seu trabalho. Entre em contato para saber mais detalhes!"}</Text>
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
              <Ionicons name="chatbox-ellipses" size={18} color={theme.colors.primary} />
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
              {avaliacoes.map((av) => (
                <View key={av.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarLetter}>{av.usuarios?.nome ? av.usuarios.nome.charAt(0).toUpperCase() : "A"}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewName}>{av.usuarios?.nome || "Aluno Match Trainer"}</Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < av.nota ? "star" : "star-outline"} size={13} color={theme.colors.primary} style={{ marginRight: 2 }} />
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

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.conversionFooter}>
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
                <LinearGradient colors={["#FF8C00", "#FF3B30"]} style={StyleSheet.absoluteFill} borderRadius={50} opacity={0.2} />
                <Text style={styles.scoreText}>{matchPreCalculado?.matchPercentual}%</Text>
                <Text style={styles.scoreLabel}>MATCH</Text>
              </View>
              <Text style={styles.matchReportTitle}>Análise de Compatibilidade</Text>
              <Text style={styles.matchReportSubtitle}>Por que <Text style={{ color: "#FFF" }}>{personal?.nome?.split(" ")[0]}</Text> é o treinador ideal para você?</Text>
            </View>

            <ScrollView style={styles.matchReasonsScroll} showsVerticalScrollIndicator={false}>
              {matchPreCalculado?.matchMotivos?.map((motivo, index) => {
                const styleInfo = getMotivoStyle(motivo.texto);
                return (
                  <View key={index} style={styles.reasonCard}>
                    <View style={[styles.reasonIconBox, { backgroundColor: styleInfo.bg }]}>
                      <Text style={{fontSize: 16}}>{motivo.icone}</Text>
                    </View>
                    <View style={styles.reasonTextWrap}>
                      <Text style={[styles.reasonTitle, { color: styleInfo.color }]}>{styleInfo.title}</Text>
                      <Text style={styles.reasonText}>{motivo.texto}</Text>
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
                <Ionicons name="chatbubbles" size={18} color="#000" style={{ marginRight: 6 }} />
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
  scrollContent: { paddingBottom: verticalScale(180) },

  headerAbsolute: { position: "absolute", top: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), left: scale(20), zIndex: 100 },
  btnVoltar: { backgroundColor: "rgba(20,20,20,0.8)", width: scale(44), height: scale(44), borderRadius: moderateScale(22), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },

  escassezBanner: { flexDirection: "row", backgroundColor: "#FF3B30", paddingVertical: verticalScale(12), paddingHorizontal: scale(20), justifyContent: "center", alignItems: "center", paddingTop: Platform.OS === "ios" ? verticalScale(55) : verticalScale(40), zIndex: 90 },
  escassezText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "600", flexShrink: 1 },

  heroSection: { alignItems: "center", paddingTop: verticalScale(40), paddingBottom: verticalScale(15), position: "relative" },
  heroCoverGradient: { position: "absolute", top: 0, width: "100%", height: verticalScale(280), opacity: 0.8 },

  avatarWrapper: { position: "relative", marginBottom: verticalScale(20), zIndex: 2 },
  avatarBorderGlow: { padding: scale(4), borderRadius: moderateScale(100), backgroundColor: "#000", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 25, elevation: 20 },
  avatarImage: { width: scale(160), height: scale(160), borderRadius: moderateScale(80), borderWidth: 2, borderColor: "rgba(255,107,0,0.5)" },

  matchBadgeFloat: { position: "absolute", bottom: verticalScale(-12), alignSelf: "center", borderRadius: moderateScale(20), overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,107,0,0.4)" },
  matchBadgeGlass: { flexDirection: "row", alignItems: "center", gap: scale(6), paddingLeft: scale(14), paddingRight: scale(6), paddingVertical: verticalScale(6) },
  matchBadgeText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "900", letterSpacing: 0.5 },
  matchBadgeIconBg: { backgroundColor: theme.colors.primary, width: scale(24), height: scale(24), borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center", marginLeft: scale(4) },

  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: verticalScale(6), marginTop: verticalScale(15) },
  nomeText: { fontFamily: theme.fonts.title, fontSize: moderateScale(32), color: "#FFF", textAlign: "center", letterSpacing: -0.5 },

  locationEditorialRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(6), marginBottom: verticalScale(12) },
  locationEditorialText: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#AAA", letterSpacing: 0.5, fontWeight: "500" },

  crefPillCentered: { flexDirection: "row", alignItems: "center", alignSelf: "center", backgroundColor: "#111", paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "rgba(255,107,0,0.4)", marginBottom: verticalScale(20), gap: scale(6) },
  crefNeonText: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "700", letterSpacing: 1 },

  modalidadesRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(10), marginBottom: verticalScale(20) },
  modalityTag: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.primary, paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(8), gap: scale(6) },
  modalityTagText: { color: "#000", fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase" },

  socialDockContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(14) },
  btnSocialDock: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#111", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },

  propostaBanner: { backgroundColor: "rgba(255, 215, 0, 0.1)", borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.4)", borderRadius: moderateScale(16), marginHorizontal: scale(20), marginTop: verticalScale(10), marginBottom: verticalScale(20), padding: scale(16), zIndex: 10 },
  propostaBannerContent: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(12) },
  propostaBannerTitle: { color: "#FFD700", fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
  propostaBannerText: { color: "#FFF", fontSize: moderateScale(13), marginTop: verticalScale(2), lineHeight: moderateScale(18) },
  btnVerProposta: { backgroundColor: "#FFD700", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(12), borderRadius: moderateScale(12), gap: scale(8), shadowColor: "#FFD700", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnVerPropostaText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase" },

  statsFloatGrid: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: scale(20), marginBottom: verticalScale(40), gap: scale(10) },
  statFloatCard: { flex: 1, backgroundColor: "#0A0A0A", paddingVertical: verticalScale(18), borderRadius: moderateScale(24), alignItems: "center", borderWidth: 1, borderColor: "#1A1A1A", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 },
  statFloatIcon: { marginBottom: verticalScale(10) },
  statFloatValue: { color: "#FFF", fontSize: moderateScale(20), fontWeight: "900", fontFamily: theme.fonts.title, letterSpacing: -0.5 },
  statFloatLabel: { color: "#666", fontSize: moderateScale(11), marginTop: verticalScale(4), textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "800" },

  sectionContainer: { marginHorizontal: scale(20), marginBottom: verticalScale(35) },
  sectionHeaderTitle: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  iconAccentBg: { width: scale(34), height: scale(34), borderRadius: moderateScale(10), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: moderateScale(20), fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  aboutCard: { backgroundColor: "#0A0A0A", padding: scale(24), borderRadius: moderateScale(24), borderWidth: 1, borderColor: "#1A1A1A", position: "relative", overflow: "hidden" },
  quoteWatermark: { position: "absolute", top: verticalScale(-5), left: scale(10) },
  aboutTextPremium: { fontFamily: theme.fonts.body, fontSize: moderateScale(15), color: "#BBB", lineHeight: moderateScale(26), zIndex: 1, paddingTop: verticalScale(15) },

  specialtiesColumn: { gap: verticalScale(12) },
  specialtyDetailCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#1A1A1A" },
  specialtyIconBg: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.08)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.15)" },
  specialtyTextWrap: { flex: 1 },
  specialtyTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4), letterSpacing: 0.3 },
  specialtyDesc: { color: "#888", fontSize: moderateScale(13), lineHeight: moderateScale(18) },

  diferenciaisRow: { flexDirection: "row", justifyContent: "space-between" },
  achievementCard: { backgroundColor: "#0A0A0A", padding: scale(20), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#1A1A1A", position: "relative", overflow: "hidden" },
  achievementHeader: { flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: verticalScale(10) },
  achievementTitle: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  achievementText: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(22) },

  galleryContainer: { marginBottom: verticalScale(35) },
  galleryScroll: { gap: scale(16), paddingHorizontal: scale(20) },
  galleryItemContainer: { width: scale(300), height: verticalScale(320), backgroundColor: "#0A0A0A", borderRadius: moderateScale(24), overflow: "hidden", borderWidth: 1, borderColor: "#1A1A1A" },
  galleryImageFull: { width: "100%", height: "100%" },
  galleryOverlay: { position: "absolute", bottom: 0, width: "100%", height: verticalScale(100), justifyContent: "flex-end", padding: scale(15), alignItems: "flex-end" },
  galleryIconExpand: { backgroundColor: "rgba(0,0,0,0.5)", padding: scale(8), borderRadius: moderateScale(20), overflow: "hidden" },

  luxuryEmptyState: { backgroundColor: "#0A0A0A", borderRadius: moderateScale(24), padding: scale(35), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1A1A1A", borderStyle: "dashed" },
  luxuryEmptyTitle: { color: "#FFF", fontFamily: theme.fonts.title, fontSize: moderateScale(18), marginBottom: verticalScale(8) },
  luxuryEmptyText: { color: "#666", fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22) },

  reviewCard: { backgroundColor: "#0A0A0A", padding: scale(20), borderRadius: moderateScale(20), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(14) },
  reviewAvatar: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "#333" },
  reviewAvatarLetter: { color: "#888", fontSize: moderateScale(18), fontWeight: "bold", fontFamily: theme.fonts.title },
  reviewName: { color: "#FFF", fontWeight: "bold", fontSize: moderateScale(15), marginBottom: verticalScale(4) },
  reviewStars: { flexDirection: "row" },
  reviewText: { color: "#BBB", fontSize: moderateScale(15), fontStyle: "italic", lineHeight: moderateScale(24) },

  conversionFooter: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: scale(20), paddingTop: verticalScale(15), paddingBottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(20), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  twinButtonsRow: { flexDirection: "row", gap: scale(12) },
  btnWhatsApp: { backgroundColor: "#25D366", width: scale(60), height: scale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center", shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnActionSolidFull: { flex: 1, backgroundColor: theme.colors.primary, height: verticalScale(60), borderRadius: moderateScale(18), flexDirection: "row", justifyContent: "center", alignItems: "center", gap: scale(8), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnActionSolidText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },
  footerHint: { color: "#888", fontSize: moderateScale(12), textAlign: "center", fontWeight: "600", marginBottom: verticalScale(12), letterSpacing: 0.5 },

  modalMatchOverlay: { flex: 1, justifyContent: "flex-end" },
  matchReportCard: { width: "100%", backgroundColor: "#0F0F0F", borderTopLeftRadius: moderateScale(36), borderTopRightRadius: moderateScale(36), padding: scale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(24), borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20 },
  matchReportHeader: { alignItems: "center", marginBottom: verticalScale(25) },
  scoreCircle: { width: scale(100), height: scale(100), borderRadius: moderateScale(50), borderWidth: 2, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", marginBottom: verticalScale(16), position: "relative", overflow: "hidden" },
  scoreText: { color: "#FFF", fontSize: moderateScale(32), fontFamily: theme.fonts.title },
  scoreLabel: { color: theme.colors.primary, fontSize: moderateScale(10), fontWeight: "900", letterSpacing: 1, marginTop: verticalScale(-4) },
  matchReportTitle: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), letterSpacing: -0.5 },
  matchReportSubtitle: { color: "#888", fontSize: moderateScale(14), textAlign: "center", paddingHorizontal: scale(20), lineHeight: moderateScale(20) },

  matchReasonsScroll: { width: "100%", marginBottom: verticalScale(20), maxHeight: verticalScale(300) },
  reasonCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A1A1A", padding: scale(16), borderRadius: moderateScale(20), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#2A2A2A" },
  reasonIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(14), justifyContent: "center", alignItems: "center", marginRight: scale(14) },
  reasonTextWrap: { flex: 1 },
  reasonTitle: { fontSize: moderateScale(13), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: verticalScale(4) },
  reasonText: { color: "#AAA", fontSize: moderateScale(14), lineHeight: moderateScale(20) },

  matchReportFooter: { flexDirection: "row", gap: scale(12), marginTop: verticalScale(10) },
  btnReportClose: { flex: 1, height: verticalScale(56), borderRadius: moderateScale(16), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  btnReportCloseText: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold" },
  btnReportAction: { flex: 1, height: verticalScale(56), borderRadius: moderateScale(16), backgroundColor: theme.colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnReportActionText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});