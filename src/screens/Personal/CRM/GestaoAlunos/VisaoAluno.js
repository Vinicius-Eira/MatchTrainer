import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../../services/supabase";
import { theme } from "../../../../theme/theme";
import {
  moderateScale,
  scale,
  verticalScale,
} from "../../../../utils/responsive";

const { width, height } = Dimensions.get("window");

const MAP_INVESTIMENTO = {
  base: "R$ 90 a 110 / aula",
  mid: "R$ 120 a 150 / aula",
  premium: "A partir de R$ 160 / aula",
  pacote: "Pacote Mensal",
};
const MAP_PERFIL = {
  acolhedor: "O Acolhedor (Didático e paciente)",
  motivador: "O Motivador (Intenso e animado)",
  tecnico: "O Técnico (Foco em biomecânica)",
  estrategista: "O Estrategista (Foco em metas)",
};
const MAP_HISTORICO = {
  iniciante: "Iniciante Total",
  inconstante: "Inconstante (Vai e para)",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

const NIVEIS_MAP = {
  Iniciante: "Iniciante Total",
  Intermediario: "Intermediário",
  Avancado: "Avançado",
};

const MAP_FREQUENCIA = {
  "1-2": "1 a 2 dias/sem",
  "3-4": "3 a 4 dias/sem",
  "5-6": "5 a 6 dias/sem",
  "7": "Todos os dias",
};

export default function VisaoAluno({ route, navigation }) {
  const { conexaoId, aluno, statusAtual } = route.params;
  const [status, setStatus] = useState(statusAtual);
  
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [alunoSolicitouSaida, setAlunoSolicitouSaida] = useState(false);
  const [dataInicioParceria, setDataInicioParceria] = useState(null);
  const [planoAtivo, setPlanoAtivo] = useState(null);
  const [anamnese, setAnamnese] = useState(null);

  let prefs = {};
  try {
    prefs =
      typeof aluno.preferencias === "string"
        ? JSON.parse(aluno.preferencias)
        : aluno.preferencias || {};
  } catch (e) {}

  const carregarDadosAluno = async () => {
    setIsFetchingData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const [planoRes, anamneseRes, msgsRes, conexaoRes] = await Promise.all([
        supabase
          .from("planos")
          .select("*")
          .eq("aluno_id", aluno.id)
          .eq("personal_id", session.user.id)
          .eq("status", "ativo")
          .single(),
        supabase
          .from("anamneses")
          .select("*")
          .eq("usuario_id", aluno.id)
          .eq("personal_id", session.user.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("mensagens")
          .select("conteudo")
          .eq("conexao_id", conexaoId)
          .eq("tipo_remetente", "aluno")
          .like("conteudo", "%solicitar o encerramento%"),
        supabase
          .from("conexoes")
          .select("confirmado_em, atualizado_em, criado_em, status")
          .eq("id", conexaoId)
          .single()
      ]);

      if (planoRes.data) setPlanoAtivo(planoRes.data);
      if (anamneseRes.data) setAnamnese(anamneseRes.data);
      if (msgsRes.data && msgsRes.data.length > 0) setAlunoSolicitouSaida(true);
      
      if (conexaoRes.data) {
        setDataInicioParceria(
          conexaoRes.data.confirmado_em || conexaoRes.data.atualizado_em || conexaoRes.data.criado_em
        );
        if (conexaoRes.data.status !== status) {
          setStatus(conexaoRes.data.status);
        }
      }
    } catch (error) {
      console.log("Erro ao buscar dados extras do aluno:", error);
    } finally {
      setIsFetchingData(false);
    }
  };

  useEffect(() => {
    carregarDadosAluno();
  }, [conexaoId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const { data } = await supabase.from('conexoes').select('status').eq('id', conexaoId).single();
        if (data && data.status !== status) {
          setStatus(data.status); 
          carregarDadosAluno(); 
        }
      } catch (e) {}
    });
    return unsubscribe;
  }, [navigation, conexaoId, status]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosAluno();
    setRefreshing(false);
  };

  const irParaNovoContrato = () => {
    navigation.navigate("AdicionarAluno", {
      leadInjetado: aluno, 
      conexaoId: conexaoId,
      planoAtivo: planoAtivo 
    });
  };

  const atualizarStatusBasico = async (novoStatus) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("conexoes").update({ status: novoStatus }).eq("id", conexaoId);
      setStatus(novoStatus);

      if (novoStatus === "inativo") {
        if (planoAtivo) {
          await supabase.from("planos").update({ status: "cancelado" }).eq("id", planoAtivo.id);
          await supabase.from("historico_financeiro_logs").insert([
            {
              personal_id: session.user.id,
              aluno_id: aluno.id,
              referencia_id: planoAtivo.id,
              tipo_evento: "CONTRATO_CANCELADO",
              descricao: `Contrato encerrado e parceria movida para inativos.`,
              metadados: { acao: "cancelamento" },
            },
          ]);
        }
        Alert.alert("Ciclo Encerrado", "O aluno foi movido para os inativos e as cobranças futuras foram canceladas.");
        navigation.goBack();
      } else if (novoStatus === "recusado") {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao processar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalEncerraParceria = () => {
    const dataInicio = new Date(dataInicioParceria || Date.now());
    const hoje = new Date();
    const diffDays = Math.floor(Math.abs(hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    let msg = "Tem certeza que deseja encerrar o contrato e pausar as cobranças?\n\nO aluno irá para o seu arquivo de inativos.";
    if (diffDays <= 7) msg = "Este contrato foi iniciado há menos de 7 dias (Período de Adaptação).\n\nDeseja encerrar e cancelar as cobranças?";
    else if (diffDays < 30) msg = "Atenção: O aluno não completou o primeiro ciclo de 30 dias.\n\nTem certeza que deseja forçar o cancelamento do contrato agora?";

    Alert.alert("Encerrar Parceria", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sim, Encerrar", style: "destructive", onPress: () => atualizarStatusBasico("inativo") },
    ]);
  };

  const abrirChat = () =>
    navigation.navigate("Chat", {
      conexaoId,
      nomeOutro: aluno.nome,
      fotoOutro: aluno.foto_url,
      tipoUsuarioLogado: "personal",
    });

  const calcularIdade = (d) => {
    if (!d) return "--";
    const n = new Date(d.includes("/") ? `${d.split("/")[2]}-${d.split("/")[1]}-${d.split("/")[0]}` : d);
    const h = new Date();
    let i = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) i--;
    return isNaN(i) ? "--" : i.toString();
  };

  const calcularIMC = (p, a) => {
    if (!p || !a) return null;
    const h = a > 3 ? a / 100 : a;
    const imc = parseFloat(p) / (h * h);
    let c = "", cor = theme.colors.textSecondary;
    if (imc < 18.5) { c = "Abaixo"; cor = theme.colors.warning; } 
    else if (imc < 24.9) { c = "Normal"; cor = theme.colors.success; } 
    else if (imc < 29.9) { c = "Sobrepeso"; cor = theme.colors.primary; } 
    else { c = "Obesidade"; cor = theme.colors.danger; }
    return { valor: imc.toFixed(1), classificacao: c, cor };
  };

  const fotoUrlRaw = aluno?.foto_url;
  let fotoValida = null;
  if (typeof fotoUrlRaw === 'string' && fotoUrlRaw.trim().length > 5) {
      fotoValida = fotoUrlRaw;
  }

  const objetivoFinal = anamnese?.objetivo || aluno?.objetivo_principal || prefs.objetivo_principal || prefs.objetivo || "Não informado";
  const metaDePeso = prefs.meta_peso; 
  
  const freqReal = prefs.frequencia_semanal || prefs.frequencia;
  const displayFrequencia = MAP_FREQUENCIA[freqReal] || "Não informado";

  const historicoReal = anamnese?.nivel_experiencia;
  const displayHistorico = NIVEIS_MAP[historicoReal] || MAP_HISTORICO[prefs.historico] || "Não informado";

  const isRestrito = anamnese ? anamnese.tem_restricao : (prefs.limitacao && prefs.limitacao !== "nenhuma");
  const descRestricao = anamnese?.detalhes_restricao || (prefs.sub_limitacao?.length > 0 ? prefs.sub_limitacao.join(", ") : prefs.detalhe_outra_limitacao);

  const dadosIMC = calcularIMC(aluno.peso, aluno.altura);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <BlurView intensity={Platform.OS === "ios" ? 70 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
          <Feather name="chevron-left" size={26} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha do Aluno</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}>
        {alunoSolicitouSaida && status === "aluno_ativo" && (
          <View style={styles.bannerDesistencia}>
            <Ionicons name="warning" size={24} color={theme.colors.backgroundPure} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerDesistenciaTitle}>Solicitação de Desligamento</Text>
              <Text style={styles.bannerDesistenciaText}>Este aluno solicitou o fim da consultoria. Confirme o encerramento no final da tela.</Text>
            </View>
          </View>
        )}

        <View style={styles.heroSection}>
          <LinearGradient colors={["rgba(255,107,0,0.15)", theme.colors.background]} style={styles.heroGradient} />
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            {fotoValida ? (
              <Image source={{ uri: fotoValida }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' }]}>
                <Ionicons name="person" size={55} color="#555" />
              </View>
            )}
            
            {status === "aluno_ativo" && <View style={styles.onlineBadge}><View style={styles.onlineBadgeInner} /></View>}
            {status === "inativo" && (
              <View style={[styles.onlineBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.textMuted }]}>
                <Ionicons name="archive" size={14} color={theme.colors.textMuted} />
              </View>
            )}
          </View>
          
          <Text style={styles.studentName}>{aluno.nome}</Text>
          <Text style={styles.studentGoal}>Foco: {objetivoFinal}</Text>

          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoPill}>
              <Ionicons name="location" size={14} color={theme.colors.primary} />
              <Text style={styles.quickInfoText} numberOfLines={1} ellipsizeMode="tail">{aluno.cidade || "Sem Local"}</Text>
            </View>
            
            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=55${aluno.telefone?.replace(/\D/g, "")}`)} style={[styles.quickInfoPill, { borderColor: theme.colors.whatsapp }]}>
              <Ionicons name="logo-whatsapp" size={14} color={theme.colors.whatsapp} />
              <Text style={[styles.quickInfoText, { color: theme.colors.whatsapp }]} numberOfLines={1} ellipsizeMode="tail">{aluno.telefone || "Sem número"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isFetchingData ? (
           <View style={{ paddingVertical: 40, alignItems: 'center' }}>
             <ActivityIndicator size="small" color={theme.colors.primary} />
           </View>
        ) : (
          <>
            {status === "aluno_ativo" && planoAtivo && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="document-text" size={20} color="#00E676" />
                  <Text style={styles.sectionHeading}>Contrato Ativo</Text>
                </View>
                <View style={styles.contratoCard}>
                  <LinearGradient colors={["rgba(0,230,118,0.1)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFill} borderRadius={20} />
                  <View style={styles.contratoRowTop}>
                    <Text style={styles.contratoValueTop}>{planoAtivo.frequencia}</Text>
                    <Text style={styles.contratoLabelTop}>Dia {planoAtivo.dia_vencimento}</Text>
                  </View>
                  <View style={styles.contratoRow}>
                    <View style={styles.contratoCol}>
                      <Text style={styles.contratoLabel}>Serviços Contratados</Text>
                      <Text style={styles.contratoValue}>{planoAtivo.servicos_inclusos ? planoAtivo.servicos_inclusos.join(" + ") : "Não informado"}</Text>
                    </View>
                    <View style={styles.contratoColRight}>
                      <Text style={styles.contratoLabel}>Valor Total</Text>
                      <Text style={[styles.contratoValue, { color: "#00E676", fontSize: 20 }]}>R$ {Number(planoAtivo.valor_mensal).toFixed(2)}</Text>
                    </View>
                  </View>
                  {planoAtivo.observacoes ? <Text style={styles.contratoObsText}>Obs: {planoAtivo.observacoes}</Text> : null}
                  <TouchableOpacity style={styles.btnEditarContrato} onPress={irParaNovoContrato}>
                    <Text style={styles.btnEditarContratoText}>Ajustar Contrato</Text>
                    <Ionicons name="chevron-forward" size={14} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {status === "aluno_ativo" && !planoAtivo && !isFetchingData && (
              <View style={styles.sectionContainer}>
                <View style={styles.bannerAlertaSemContrato}>
                  <Ionicons name="warning" size={22} color="#FFD700" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerAlertaTitle}>Atenção: Aluno Sem Contrato</Text>
                    <Text style={styles.bannerAlertaText}>Este aluno é um cadastro antigo e não possui vínculo no Recebimentos.</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.btnCriarContratoUrgente} onPress={irParaNovoContrato} activeOpacity={0.8}>
                  <Text style={styles.btnCriarContratoUrgenteText}>Configurar Contrato Agora</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <FontAwesome5 name="clipboard-list" size={18} color={theme.colors.primary} />
                <Text style={styles.sectionHeading}>Raio-X do Treinamento</Text>
              </View>
              <View style={styles.goalPremiumCard}>
                <LinearGradient colors={["rgba(255,107,0,0.12)", "rgba(255,107,0,0.02)"]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.goalIconBox}>
                  <Feather name="target" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.goalTextContent}>
                  <Text style={styles.goalLabel}>Objetivo Principal</Text>
                  <Text style={styles.goalValue} numberOfLines={1}>{objetivoFinal}</Text>
                </View>
              </View>

              {prefs.sub_objetivo && prefs.sub_objetivo.length > 0 && (
                <View style={styles.subTagsContainer}>
                  {prefs.sub_objetivo.map((sub, index) => (
                    <View key={index} style={styles.subTagPill}>
                      <Text style={styles.subTagText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.trainingGrid}>
                <View style={styles.trainingGridRow}>
                  <View style={styles.trainingGridItem}>
                    <MaterialCommunityIcons name="medal-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                    <Text style={styles.tgLabel}>Histórico Físico</Text>
                    <Text style={styles.tgValue} numberOfLines={1}>{displayHistorico}</Text>
                  </View>
                  <View style={styles.trainingGridItem}>
                    <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} style={styles.tgIcon} />
                    <Text style={styles.tgLabel}>Frequência</Text>
                    <Text style={styles.tgValue} numberOfLines={1}>{displayFrequencia}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionHeading}>Biometria & Saúde</Text>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} style={styles.statIcon} />
                  <Text style={styles.statValue}>{calcularIdade(aluno.data_nascimento)}</Text>
                  <Text style={styles.statLabel}>Anos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <MaterialCommunityIcons name="human-male-height" size={20} color={theme.colors.primary} style={styles.statIcon} />
                  <Text style={styles.statValue}>{aluno.altura ? `${aluno.altura}` : "--"}</Text>
                  <Text style={styles.statLabel}>Cm</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.colors.text} style={styles.statIcon} />
                  <Text style={styles.statValue}>{aluno.peso ? `${aluno.peso}` : "--"}</Text>
                  <Text style={styles.statLabel}>Atual</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Ionicons name="flag" size={20} color={theme.colors.success} style={styles.statIcon} />
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>{metaDePeso ? `${metaDePeso}` : "--"}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.success }]}>Meta (Kg)</Text>
                </View>
              </View>

              {dadosIMC && (
                <View style={[styles.imcCard, { borderColor: `${dadosIMC.cor}40`, backgroundColor: `${dadosIMC.cor}08` }]}>
                  <View style={styles.imcHeaderRow}>
                    <Text style={styles.imcTitle}>Índice de Massa Corporal (IMC)</Text>
                  </View>
                  <View style={styles.imcValueRow}>
                    <Text style={styles.imcNumber}>{dadosIMC.valor}</Text>
                    <View style={[styles.imcBadge, { backgroundColor: `${dadosIMC.cor}20`, borderColor: dadosIMC.cor }]}>
                      <View style={[styles.imcBadgeDot, { backgroundColor: dadosIMC.cor }]} />
                      <Text style={[styles.imcBadgeText, { color: dadosIMC.cor }]}>{dadosIMC.classificacao}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={[styles.medicalAlertCard, isRestrito ? styles.medicalAlertDanger : styles.medicalAlertSafe]}>
                <View style={styles.medicalAlertHeader}>
                  <Ionicons name={isRestrito ? "warning" : "checkmark-circle"} size={22} color={isRestrito ? theme.colors.danger : theme.colors.success} />
                  <Text style={[styles.medicalAlertTitle, isRestrito ? { color: theme.colors.danger } : { color: theme.colors.success }]}>
                    {isRestrito ? "Atenção: Restrições Físicas" : "Nenhuma Restrição Relatada"}
                  </Text>
                </View>
                {isRestrito && descRestricao && (
                  <View style={styles.medicalAlertBody}>
                    <Text style={styles.medicalConditionDesc}>{descRestricao}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionHeading}>Alinhamento Comercial</Text>
              </View>
              <View style={styles.commercialCard}>
                <View style={styles.commercialRow}>
                  <View style={styles.commercialIconBg}><FontAwesome5 name="user-tie" size={16} color={theme.colors.primary} /></View>
                  <View style={styles.commercialContent}>
                    <Text style={styles.commercialLabel}>Professor Desejado</Text>
                    <Text style={styles.commercialValue}>{MAP_PERFIL[prefs.perfil_treinador] || "Sem preferência exata"}</Text>
                  </View>
                </View>
                <View style={styles.dividerCommercial} />
                <View style={styles.commercialRow}>
                  <View style={styles.commercialIconBg}><FontAwesome5 name="money-bill-wave" size={16} color={theme.colors.success} /></View>
                  <View style={styles.commercialContent}>
                    <Text style={styles.commercialLabel}>Orçamento / Investimento</Text>
                    <Text style={[styles.commercialValue, { color: theme.colors.success }]}>{MAP_INVESTIMENTO[prefs.investimento] || "Aberto a propostas"}</Text>
                  </View>
                </View>
              </View>
            </View>

            {status === "aluno_ativo" && (
              <View style={styles.dangerZone}>
                <TouchableOpacity style={styles.btnDangerOutline} onPress={handlePersonalEncerraParceria}>
                  <Text style={styles.btnDangerText}>Encerrar Contrato</Text>
                </TouchableOpacity>
                <Text style={styles.dangerZoneHelp}>O aluno perderá acesso aos treinos e será movido para o histórico.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {status !== "inativo" && (
        <View style={styles.floatingActionBar}>
          
          {status === "aguardando_assinatura" ? (
            <View style={styles.actionColumn}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnChatOutline} onPress={abrirChat} activeOpacity={0.8}>
                  <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.btnChatOutlineText}>Falar no Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnAccept, { backgroundColor: '#222', borderColor: '#333', borderWidth: 1 }]} 
                  onPress={() => Alert.alert("Proposta Bloqueada 🔒", "A proposta já foi enviada e está aguardando a assinatura do aluno.\n\nSe ele pedir algum ajuste pelo chat, o sistema liberará a edição novamente.")} 
                  activeOpacity={0.85}
                >
                  <Text style={[styles.btnAcceptText, { color: '#888', fontSize: moderateScale(14) }]}>Aguardando</Text>
                  <Ionicons name="lock-closed" size={18} color="#888" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          ) : status === "lead" || status === "em_contato" ? (
            <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Responder Aluno</Text>
            </TouchableOpacity>
          ) : status === "pendente" || status === "aguardando_personal" ? (
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.btnChatOutline} onPress={abrirChat} activeOpacity={0.8}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.btnChatOutlineText}>Conversar Antes</Text>
              </TouchableOpacity>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnDecline} onPress={() => atualizarStatusBasico("recusado")} disabled={loading}>
                  <Feather name="x" size={24} color={theme.colors.danger} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnAccept} onPress={irParaNovoContrato} disabled={loading} activeOpacity={0.85}>
                  <Text style={styles.btnAcceptText}>Criar Proposta VIP</Text>
                  <Ionicons name="document-text" size={20} color={theme.colors.backgroundPure} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnChat} onPress={abrirChat} activeOpacity={0.85}>
              <Ionicons name="chatbubbles" size={22} color={theme.colors.backgroundPure} />
              <Text style={styles.btnChatText}>Abrir Conversa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: scale(20), paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(50), paddingBottom: verticalScale(15), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : "transparent" },
  iconButton: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontFamily: theme.fonts.title, textTransform: "uppercase", letterSpacing: 1.5 },
  scrollContent: { paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(100), paddingBottom: verticalScale(220) },

  bannerDesistencia: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.warning, padding: scale(20), marginHorizontal: scale(20), marginTop: verticalScale(10), borderRadius: moderateScale(16) },
  bannerDesistenciaTitle: { color: theme.colors.backgroundPure, fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase" },
  bannerDesistenciaText: { color: "rgba(0,0,0,0.7)", fontSize: moderateScale(13), fontWeight: "600", marginTop: verticalScale(4) },

  bannerAlertaSemContrato: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 215, 0, 0.1)", padding: scale(15), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.4)", marginBottom: verticalScale(15) },
  bannerAlertaTitle: { color: "#FFD700", fontSize: moderateScale(13), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(2) },
  bannerAlertaText: { color: "#FFF", fontSize: moderateScale(12), lineHeight: moderateScale(18) },
  btnCriarContratoUrgente: { backgroundColor: "#FFD700", paddingVertical: verticalScale(14), borderRadius: moderateScale(12), alignItems: "center", shadowColor: "#FFD700", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5 },
  btnCriarContratoUrgenteText: { color: "#000", fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase" },

  heroSection: { alignItems: "center", paddingTop: verticalScale(10), paddingBottom: verticalScale(25), position: "relative" },
  heroGradient: { position: "absolute", top: verticalScale(-100), left: 0, right: 0, height: verticalScale(350) },
  avatarWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  avatarGlow: { position: "absolute", width: scale(120), height: scale(120), borderRadius: moderateScale(60), backgroundColor: theme.colors.primary, opacity: 0.2, blurRadius: 25 },
  avatar: { width: scale(130), height: scale(130), borderRadius: moderateScale(65), borderWidth: 3, borderColor: theme.colors.primary, backgroundColor: theme.colors.surface, zIndex: 2 },
  onlineBadge: { position: "absolute", bottom: verticalScale(4), right: scale(8), width: scale(28), height: scale(28), borderRadius: moderateScale(14), backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center", zIndex: 3 },
  onlineBadgeInner: { width: scale(18), height: scale(18), borderRadius: moderateScale(9), backgroundColor: theme.colors.success },
  studentName: { color: theme.colors.text, fontSize: moderateScale(28), fontFamily: theme.fonts.title, marginBottom: verticalScale(4), textAlign: "center", letterSpacing: 0.5 },
  studentGoal: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "900", marginBottom: verticalScale(20), textTransform: "uppercase", letterSpacing: 1.5 },

  quickInfoRow: { flexDirection: "row", gap: scale(8), justifyContent: "center", paddingHorizontal: scale(20), width: "100%" },
  quickInfoPill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surfaceLight, paddingHorizontal: scale(10), paddingVertical: verticalScale(8), borderRadius: moderateScale(20), borderWidth: 1, borderColor: theme.colors.border, gap: scale(6), overflow: "hidden" },
  quickInfoText: { color: theme.colors.textBody, fontSize: moderateScale(11), fontWeight: "700", letterSpacing: 0.3, flexShrink: 1 },

  sectionContainer: { paddingHorizontal: scale(20), marginBottom: verticalScale(35) },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(16) },
  sectionHeading: { color: theme.colors.text, fontSize: moderateScale(18), fontFamily: theme.fonts.title, marginLeft: scale(10), letterSpacing: 0.5 },

  contratoCard: { backgroundColor: "#111", borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#00E676", position: "relative", overflow: "hidden" },
  contratoRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.15)", paddingHorizontal: scale(20), paddingVertical: verticalScale(10) },
  contratoValueTop: { color: "#00E676", fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase" },
  contratoLabelTop: { color: "#FFF", fontSize: moderateScale(12), fontWeight: "bold" },
  contratoRow: { flexDirection: "row", padding: scale(20), justifyContent: "space-between", alignItems: "center" },
  contratoCol: { flex: 1, alignItems: "flex-start" },
  contratoColRight: { flex: 1, alignItems: "flex-end" },
  contratoLabel: { color: "#888", fontSize: moderateScale(10), fontWeight: "bold", textTransform: "uppercase", marginBottom: verticalScale(4) },
  contratoValue: { color: "#FFF", fontSize: moderateScale(16), fontWeight: "900" },
  contratoObsText: { color: "#AAA", fontSize: moderateScale(12), fontStyle: "italic", paddingHorizontal: scale(20), paddingBottom: verticalScale(15) },
  btnEditarContrato: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(12), borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" },
  btnEditarContratoText: { color: "#888", fontSize: moderateScale(12), fontWeight: "bold", marginRight: scale(4), textTransform: "uppercase" },

  goalPremiumCard: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), padding: scale(20), marginBottom: verticalScale(16), borderWidth: 1, borderColor: "rgba(255,107,0,0.3)", overflow: "hidden" },
  goalIconBox: { width: scale(50), height: scale(50), borderRadius: moderateScale(16), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(16), borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  goalTextContent: { flex: 1, justifyContent: "center" },
  goalLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(11), textTransform: "uppercase", fontWeight: "900", marginBottom: verticalScale(4), letterSpacing: 1 },
  goalValue: { color: theme.colors.text, fontSize: moderateScale(18), fontFamily: theme.fonts.title, letterSpacing: 0.5, textTransform: "capitalize" },

  subTagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: scale(8), marginBottom: verticalScale(16) },
  subTagPill: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: scale(12), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), borderWidth: 1, borderColor: theme.colors.borderLight },
  subTagText: { color: theme.colors.textBody, fontSize: moderateScale(12), fontWeight: "600" },

  trainingGrid: { gap: verticalScale(12) },
  trainingGridRow: { flexDirection: "row", gap: scale(12) },
  trainingGridItem: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), padding: scale(18), borderWidth: 1, borderColor: theme.colors.border, alignItems: "flex-start" },
  tgIcon: { marginBottom: verticalScale(12), opacity: 0.9 },
  tgLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(10), textTransform: "uppercase", fontWeight: "900", letterSpacing: 0.5, marginBottom: verticalScale(4) },
  tgValue: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: "700" },

  statsContainer: { flexDirection: "row", backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), paddingVertical: verticalScale(20), borderWidth: 1, borderColor: theme.colors.border, marginBottom: verticalScale(16), shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  statBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  statIcon: { marginBottom: verticalScale(6), opacity: 0.8 },
  statValue: { color: theme.colors.text, fontSize: moderateScale(22), fontFamily: theme.fonts.title, marginBottom: verticalScale(2) },
  statLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(10), textTransform: "uppercase", letterSpacing: 1, fontWeight: "800" },
  statDivider: { width: 1, backgroundColor: theme.colors.borderLight },

  imcCard: { flexDirection: "column", borderRadius: moderateScale(20), padding: scale(20), borderWidth: 1, marginBottom: verticalScale(16) },
  imcHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(8) },
  imcTitle: { color: theme.colors.textSecondary, fontSize: moderateScale(11), fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  imcValueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  imcNumber: { color: theme.colors.text, fontSize: moderateScale(36), fontFamily: theme.fonts.title },
  imcBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: moderateScale(12), borderWidth: 1 },
  imcBadgeDot: { width: scale(8), height: scale(8), borderRadius: moderateScale(4), marginRight: scale(6) },
  imcBadgeText: { fontSize: moderateScale(12), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },

  medicalAlertCard: { borderRadius: moderateScale(20), padding: scale(18), borderWidth: 1 },
  medicalAlertSafe: { backgroundColor: "rgba(0, 230, 118, 0.05)", borderColor: "rgba(0, 230, 118, 0.2)" },
  medicalAlertDanger: { backgroundColor: "rgba(255, 59, 48, 0.1)", borderColor: "rgba(255, 59, 48, 0.3)" },
  medicalAlertHeader: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  medicalAlertTitle: { fontSize: moderateScale(14), fontWeight: "900", textTransform: "uppercase" },
  medicalAlertBody: { marginTop: verticalScale(12), paddingTop: verticalScale(12), borderTopWidth: 1, borderTopColor: "rgba(255, 59, 48, 0.2)" },
  medicalConditionText: { color: theme.colors.textSecondary, fontSize: moderateScale(13), fontWeight: "700", marginBottom: verticalScale(4) },
  medicalConditionDesc: { color: theme.colors.text, fontSize: moderateScale(14), fontStyle: "italic", marginTop: verticalScale(6), backgroundColor: "rgba(0,0,0,0.3)", padding: scale(10), borderRadius: moderateScale(8) },

  commercialCard: { backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), borderWidth: 1, borderColor: theme.colors.border, padding: scale(20) },
  commercialRow: { flexDirection: "row", alignItems: "center" },
  commercialIconBg: { width: scale(44), height: scale(44), borderRadius: moderateScale(14), backgroundColor: theme.colors.surfaceLight, justifyContent: "center", alignItems: "center", marginRight: scale(14) },
  commercialContent: { flex: 1 },
  commercialLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(11), textTransform: "uppercase", fontWeight: "900", marginBottom: verticalScale(4), letterSpacing: 0.5 },
  commercialValue: { color: theme.colors.text, fontSize: moderateScale(14), fontWeight: "700" },
  dividerCommercial: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: verticalScale(16) },

  dangerZone: { paddingHorizontal: scale(20), paddingBottom: verticalScale(20) },
  btnDangerOutline: { paddingVertical: verticalScale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255,59,48,0.4)", alignItems: "center" },
  btnDangerText: { color: theme.colors.danger, fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  dangerZoneHelp: { color: theme.colors.textMuted, fontSize: moderateScale(11), textAlign: "center", marginTop: verticalScale(10) },

  floatingActionBar: { position: "absolute", bottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(25), left: scale(20), right: scale(20), backgroundColor: "#000", borderRadius: moderateScale(24), padding: scale(12), borderWidth: 1, borderColor: "#222", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  actionColumn: { flexDirection: "column", gap: verticalScale(12) },
  
  btnAguardandoAssinatura: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255, 215, 0, 0.1)", paddingVertical: verticalScale(14), borderRadius: moderateScale(16), borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.4)", gap: scale(8) },
  btnAguardandoText: { color: "#FFD700", fontSize: moderateScale(14), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  
  btnChatOutline: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.surfaceLight, paddingVertical: verticalScale(14), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, gap: scale(8) },
  btnChatOutlineText: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
  actionRow: { flexDirection: "row", gap: scale(12) },
  btnDecline: { width: scale(64), height: scale(64), borderRadius: moderateScale(20), backgroundColor: "rgba(255,59,48,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,59,48,0.3)" },
  btnAccept: { flex: 1, backgroundColor: "#00E676", height: verticalScale(64), borderRadius: moderateScale(20), flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#00E676", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnAcceptText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },
  btnChat: { backgroundColor: theme.colors.primary, height: verticalScale(64), borderRadius: moderateScale(20), flexDirection: "row", justifyContent: "center", alignItems: "center", gap: scale(10) },
  btnChatText: { color: theme.colors.backgroundPure, fontSize: moderateScale(17), fontWeight: "900", letterSpacing: 0.5 },
});