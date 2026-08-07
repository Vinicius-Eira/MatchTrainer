import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../theme/theme";
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive"; 
import { supabase } from "../../../../services/supabase"; 
import WidgetOnboarding from "../../../../components/WidgetOnboarding";
import { useOnboarding } from "../../../../hooks/useOnboarding";
import { FlatList, RefreshControl, TextInput, Modal } from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

export default function PersonalDashboard({ navigation }) {
  const {
    jornada,
    progressoPct,
    completarMissao,
    loadingJornada,
    recarregarJornada,
  } = useOnboarding();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("aluno_ativo");
  
  const [modalidadeFilter, setModalidadeFilter] = useState("Todos");
  const [filtrosDinamicos, setFiltrosDinamicos] = useState(["Todos"]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("recentes");
  const [origemFilter, setOrigemFilter] = useState("Todos");

  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState(null);

  const [emContato, setEmContato] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [inativos, setInativos] = useState([]);

  const [notaMedia, setNotaMedia] = useState(0);
  const [naoLidas, setNaoLidas] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarDados();
      recarregarJornada();
    });
    return unsubscribe;
  }, [navigation, recarregarJornada]);

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const carregarDados = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const [
        perfilRes,
        leadsRes,
        mediaRes,
        ativosRes,
        inativosRes,
        planosRes,
        anamnesesRes,
        convitesRes
      ] = await Promise.all([
        supabase.from("personals").select("*").eq("id", session.user.id).single(),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .in("status", [
            "pendente",
            "em_contato",
            "lead",
            "aguardando_personal",
            "aceito_personal"
          ]),
        supabase.rpc("get_media_avaliacoes", { p_id: session.user.id }),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .in("status", ["aluno_ativo", "aguardando_assinatura"]),
        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .eq("status", "inativo"),
        supabase
          .from("planos")
          .select("*")
          .eq("personal_id", session.user.id)
          .neq("status", "cancelado"),
        supabase
          .from("anamneses")
          .select("usuario_id, objetivo")
          .eq("personal_id", session.user.id),
        supabase 
          .from("convites_alunos")
          .select("*")
          .eq("personal_id", session.user.id)
      ]);

      if (perfilRes.data) {
        setPersonal(perfilRes.data);
        const servicos = perfilRes.data.servicos_oferecidos || perfilRes.data.modalidades || [];
        let arrFiltros = ["Todos"];
        if (servicos.includes("Consultoria")) arrFiltros.push("Consultoria");
        if (servicos.includes("Presencial")) arrFiltros.push("Presencial");
        if (servicos.includes("Consultoria") && servicos.includes("Presencial")) arrFiltros.push("Híbrido");
        setFiltrosDinamicos(arrFiltros);
      }

      const anamneseMap = new Map();
      if (anamnesesRes.data) {
        anamnesesRes.data.forEach(a => { if (a.objetivo) anamneseMap.set(a.usuario_id, a.objetivo); });
      }

      const convitesMap = new Map();
      if (convitesRes.data) {
          convitesRes.data.forEach(convite => {
             const email = convite.email?.toLowerCase().trim();
             if(email) {
                 let servicosEncontrados = [];
                 if (convite.servicos_inclusos) {
                   if (Array.isArray(convite.servicos_inclusos)) servicosEncontrados = convite.servicos_inclusos;
                   else if (typeof convite.servicos_inclusos === 'string') {
                     try { servicosEncontrados = JSON.parse(convite.servicos_inclusos); } 
                     catch(e) { servicosEncontrados = [convite.servicos_inclusos]; }
                   }
                 }
                 if (servicosEncontrados.length === 0 && convite.modalidade) {
                     const modFormatada = convite.modalidade.trim().toLowerCase();
                     if (modFormatada === 'híbrido' || modFormatada === 'hibrido') servicosEncontrados = ['Consultoria', 'Presencial'];
                     else servicosEncontrados = [convite.modalidade.charAt(0).toUpperCase() + convite.modalidade.slice(1).toLowerCase()];
                 }
                 convitesMap.set(email, servicosEncontrados);
             }
          });
      }

      const planosMap = new Map();
      if (planosRes.data) {
        planosRes.data.forEach((p) => {
          let servicosMapeados = [];
          if (p.servicos_inclusos) {
            if (Array.isArray(p.servicos_inclusos)) servicosMapeados = p.servicos_inclusos;
            else if (typeof p.servicos_inclusos === 'string') {
              try { servicosMapeados = JSON.parse(p.servicos_inclusos); }
              catch(e) { servicosMapeados = [p.servicos_inclusos]; }
            }
          } else {
            const textoMod = p.modalidade || p.escopo || p.tipo || p.nome || "";
            if (textoMod && typeof textoMod === 'string') {
              const modFormatada = textoMod.trim().toLowerCase();
              if (modFormatada === 'híbrido' || modFormatada === 'hibrido') servicosMapeados = ['Consultoria', 'Presencial'];
              else servicosMapeados = [textoMod.charAt(0).toUpperCase() + textoMod.slice(1).toLowerCase()];
            }
          }

          const payloadPlano = {
            temPlano: true,
            servicos: servicosMapeados,
            vencimento: p.dia_vencimento || 99,
          };

          if (p.aluno_id) planosMap.set(p.aluno_id, payloadPlano);
          if (p.conexao_id) planosMap.set(p.conexao_id, payloadPlano);
        });
      }

      const formatarAluno = (c) => {
        const planoData = planosMap.get(c.usuario_id) || planosMap.get(c.id) || { temPlano: false, servicos: [], vencimento: 99 };
        let servicosDoAluno = [...planoData.servicos];

        const emailUsuario = c.usuarios?.email?.toLowerCase().trim();
        const prefs = c.usuarios?.preferencias || {};
        const cPrefs = c.preferencias || {}; 
        const isVIP = c.origem === 'convite' || prefs.criado_pelo_personal === true || c.status === "aguardando_assinatura";

        if (servicosDoAluno.length === 0) {
          const modConvite = convitesMap.get(emailUsuario);
          if (modConvite && modConvite.length > 0) {
            servicosDoAluno = modConvite;
          } else {
            const stringDadosAluno = JSON.stringify(c) + JSON.stringify(c.usuarios || {});
            if (stringDadosAluno.includes("Híbrido") || stringDadosAluno.includes("Hibrido") || (stringDadosAluno.includes("Consultoria") && stringDadosAluno.includes("Presencial"))) {
              servicosDoAluno = ["Consultoria", "Presencial"];
            } else if (stringDadosAluno.includes("Consultoria")) {
              servicosDoAluno = ["Consultoria"];
            } else if (stringDadosAluno.includes("Presencial")) {
              servicosDoAluno = ["Presencial"];
            }
          }
        }

        let categoriaUi = "A Definir";
        let isHibrido = false;

        if (servicosDoAluno.length > 1) {
          categoriaUi = "Híbrido";
          isHibrido = true;
        } else if (servicosDoAluno.length === 1) {
          categoriaUi = servicosDoAluno[0];
        }

        const origemDefinitiva = isVIP ? 'convite' : 'match';
        
        const objetivoFinal = 
          anamneseMap.get(c.usuario_id) || 
          c.usuarios?.objetivo_principal || 
          prefs.objetivo_principal || 
          prefs.objetivo || 
          c.objetivo || 
          "Foco no Treino"; 

        const idade = calcularIdade(c.usuarios?.data_nascimento);

        return {
          ...c,
          tem_plano: planoData.temPlano || servicosDoAluno.length > 0 || isVIP, 
          servicos_array: servicosDoAluno,
          dia_vencimento: planoData.vencimento,
          modalidadeUi: categoriaUi,
          isHibrido: isHibrido,
          origem: origemDefinitiva,
          objetivoSeguro: objetivoFinal,
          idade: idade,
          isVIP: isVIP
        };
      };

      const ativosReais = (ativosRes.data || []).map(formatarAluno);
      const emContatoReais = (leadsRes.data || []).map(formatarAluno);
      const dataInativos = (inativosRes.data || []).map(formatarAluno);

      const contagemNaoLidas = {};
      const todasConexoes = [...emContatoReais, ...ativosReais, ...dataInativos];

      await Promise.all(
        todasConexoes.map(async (c) => {
          const { count } = await supabase
            .from("mensagens")
            .select("id", { count: "exact", head: true })
            .eq("conexao_id", c.id)
            .eq("lida", false)
            .neq("remetente_id", session.user.id);
          contagemNaoLidas[c.id] = count || 0;
        })
      );

      setNaoLidas(contagemNaoLidas);
      setAtivos(ativosReais);
      setEmContato(emContatoReais);
      setInativos(dataInativos);
      setNotaMedia(mediaRes.data || 0);

      if (emContatoReais.length === 0 && ativosReais.length > 0) setActiveTab("aluno_ativo");

    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    if (recarregarJornada) recarregarJornada();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair do seu painel?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
          setLoading(true);
          await supabase.auth.signOut();
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
      }},
    ]);
  };

  const getListaAtiva = () => {
    let lista = [];

    if (activeTab === "em_contato") lista = [...emContato];
    else if (activeTab === "inativo") lista = [...inativos];
    else if (activeTab === "aluno_ativo") {
      lista = [...ativos];
      if (modalidadeFilter === "Consultoria") lista = lista.filter((a) => !a.isHibrido && a.servicos_array.includes("Consultoria"));
      else if (modalidadeFilter === "Presencial") lista = lista.filter((a) => !a.isHibrido && a.servicos_array.includes("Presencial"));
      else if (modalidadeFilter === "Híbrido") lista = lista.filter((a) => a.isHibrido);
    }

    if (origemFilter !== "Todos") lista = lista.filter((a) => a.origem === origemFilter);

    if (searchQuery.trim() !== "") {
      const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const q = removerAcentos(searchQuery);
      lista = lista.filter((item) => removerAcentos(item.usuarios?.nome || "").includes(q));
    }

    if (sortOrder === "alfabetica") {
      lista.sort((a, b) => (a.usuarios?.nome || "").localeCompare(b.usuarios?.nome || ""));
    } else if (sortOrder === "vencimento" && activeTab === "aluno_ativo") {
      lista.sort((a, b) => a.dia_vencimento - b.dia_vencimento);
    } else {
      lista.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
    }

    return lista;
  };

  const renderItem = ({ item }) => {
    const isAtivo = activeTab === "aluno_ativo";
    const isInativo = activeTab === "inativo";
    const isNovo = activeTab === "em_contato";
    
    const status = item.status;
    const userData = item.usuarios;
    const temMensagemNaoLida = naoLidas[item.id] > 0;
    
    const isVIP = item.isVIP;
    const isAguardandoAssinatura = status === "aguardando_assinatura";
    
    const fotoUrl = (userData?.foto_url && typeof userData.foto_url === 'string' && userData.foto_url.trim().length > 5) 
      ? userData.foto_url 
      : null;

    let dataFormatada = "";
    if (item.criado_em) {
      const d = new Date(item.criado_em);
      const mes = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      dataFormatada = `${d.getDate()} de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`;
    }

    // Cores Semânticas de Origem solicitadas
    let leftBorderColor = isVIP ? "#0A84FF" : "#00E676"; 
    if (isInativo) leftBorderColor = "#FF3B30"; // Vermelho inativo sobrepõe

    // Dados Extras do Aluno (Peso e Frequência)
    const prefs = userData?.preferencias || {};
    const pesoStr = userData?.peso ? `${userData.peso}kg` : null;
    const freqBruta = prefs?.frequencia_semanal || prefs?.frequencia;
    const freqStr = freqBruta ? `${freqBruta.split('-')[0]}x/sem` : null;

    return (
      <TouchableOpacity
        style={[
          styles.studentCardPremium,
          { borderLeftColor: leftBorderColor },
          isInativo && { opacity: 0.65 }
        ]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("VisaoAluno", {
            conexaoId: item.id,
            aluno: userData,
            statusAtual: status,
            personalInfo: personal,
          });
        }}
      >
        <View style={styles.cardHeaderArea}>
          
          <View style={styles.avatarWrapper}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={moderateScale(20)} color="#555" />
              </View>
            )}
            {temMensagemNaoLida ? (
              <View style={styles.statusIndicatorMessage} />
            ) : isAtivo ? (
              <View style={styles.statusIndicatorOnline} />
            ) : null}
          </View>

          <View style={styles.headerInfoWrapper}>
            <View style={styles.nameAndDateRow}>
              <Text style={styles.studentNameText} numberOfLines={1}>
                {userData?.nome || "Novo Aluno"}
                {item.idade ? <Text style={styles.studentAgeText}>, {item.idade}</Text> : null}
              </Text>
              <Text style={styles.dateText}>{dataFormatada}</Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.orangePill}>
                <Ionicons name="flag" size={10} color={theme.colors.primary} style={{marginRight: 4}} />
                <Text style={styles.orangePillText} numberOfLines={1}>{item.objetivoSeguro}</Text>
              </View>

              {item.modalidadeUi !== "A Definir" && item.modalidadeUi !== "Pendente" && (
                <View style={styles.orangePill}>
                  <Ionicons name="layers" size={10} color={theme.colors.primary} style={{marginRight: 4}} />
                  <Text style={styles.orangePillText}>{item.modalidadeUi}</Text>
                </View>
              )}
            </View>

            {(pesoStr || freqStr) && (
              <View style={styles.metricsRow}>
                {pesoStr && (
                  <View style={styles.metricBadge}>
                    <MaterialCommunityIcons name="weight-kilogram" size={12} color="#888" />
                    <Text style={styles.metricBadgeText}>{pesoStr}</Text>
                  </View>
                )}
                {freqStr && (
                  <View style={styles.metricBadge}>
                    <Ionicons name="calendar-outline" size={12} color="#888" />
                    <Text style={styles.metricBadgeText}>{freqStr}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooterArea}>
          
          <View style={styles.originIndicator}>
             {isVIP ? (
                <>
                  <Ionicons name="ticket" size={12} color="#0A84FF" />
                  <Text style={[styles.originIndicatorText, { color: "#0A84FF" }]}>CONVITE</Text>
                </>
             ) : (
                <>
                  <Ionicons name="flash" size={12} color="#00E676" />
                  <Text style={[styles.originIndicatorText, { color: "#00E676" }]}>MATCH</Text>
                </>
             )}
          </View>

          <View style={styles.alertWrapper}>
            {isAguardandoAssinatura ? (
              <View style={styles.badgeAlertGold}>
                <Ionicons name="time" size={12} color="#FFD700" />
                <Text style={styles.badgeAlertGoldText}>AGUARDANDO ASSINATURA</Text>
              </View>
            ) : isAtivo && !item.tem_plano && !item.isVIP ? (
              <View style={styles.badgeAlertDanger}>
                <Ionicons name="alert-circle" size={12} color="#FF3B30" />
                <Text style={styles.badgeAlertDangerText}>SEM PLANO</Text>
              </View>
            ) : isAtivo && sortOrder === "vencimento" && item.dia_vencimento !== 99 ? (
              <View style={styles.badgeAlertNeutral}>
                <Ionicons name="calendar-outline" size={12} color="#AAA" />
                <Text style={styles.badgeAlertNeutralText}>VENCE DIA {item.dia_vencimento}</Text>
              </View>
            ) : (
               <Ionicons name="chevron-forward" size={16} color="#444" />
            )}
          </View>
          
        </View>

      </TouchableOpacity>
    );
  };

  if (loading && !personal && !refreshing)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

      <LinearGradient colors={[theme.colors.surfaceLight, theme.colors.background]} style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, paddingRight: scale(10) }}>
            <Text style={styles.greeting}>PAINEL DO TREINADOR</Text>
            <Text style={styles.personalName} numberOfLines={1}>Olá, {personal?.nome?.split(" ")[0] || "Professor"}</Text>
          </View>
          <View style={styles.headerActionsRight}>
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={moderateScale(22)} color={theme.colors.danger} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("PersonalSetup")} activeOpacity={0.7}>
              <Image source={{ uri: personal?.foto_url || "https://via.placeholder.com/150" }} style={styles.headerAvatar} />
              <View style={styles.settingsOverlay}>
                <Ionicons name="pencil" size={moderateScale(12)} color={theme.colors.backgroundPure} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsWrapper}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="account-group" size={moderateScale(22)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{ativos.length}</Text>
            <Text style={styles.statLabel}>Alunos Ativos</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("Avaliacoes")} activeOpacity={0.7}>
            <View style={styles.iconWrapperPrimary}>
              <MaterialCommunityIcons name="star" size={moderateScale(22)} color={theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{Number(notaMedia).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Sua Nota</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={emContato.length > 0 ? styles.iconWrapperAlert : styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="bell-ring" size={moderateScale(22)} color={emContato.length > 0 ? theme.colors.primary : theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{emContato.length}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />}
      >
        <WidgetOnboarding jornada={jornada} progressoPct={progressoPct} navigation={navigation} completarMissao={completarMissao} />

        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("Recebimentos")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(255, 107, 0, 0.15)" }]}>
                <Ionicons name="wallet-outline" size={moderateScale(22)} color={theme.colors.primary} />
              </View>
              <Ionicons name="arrow-forward" size={moderateScale(16)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>Recebimentos</Text>
            <Text style={styles.quickAccessSubtitle}>Caixa e PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("PainelCrescimento")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}>
                <Ionicons name="rocket-outline" size={moderateScale(22)} color="#0A84FF" />
              </View>
              <Ionicons name="arrow-forward" size={moderateScale(16)} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>MatchBusiness</Text>
            <Text style={styles.quickAccessSubtitle}>Metas e Gráficos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.actionHeaderBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]} onPress={() => navigation.navigate("AdicionarAluno")}>
              <Ionicons name="person-add" size={moderateScale(20)} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]} onPress={() => setActiveTab("em_contato")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>Novos {emContato.length > 0 && `(${emContato.length})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]} onPress={() => { setActiveTab("aluno_ativo"); setModalidadeFilter("Todos"); }} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>Ativos {ativos.length > 0 && `(${ativos.length})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "inativo" && styles.segmentBtnActive]} onPress={() => setActiveTab("inativo")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "inativo" && styles.segmentTextActive]}>Inativos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSortContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={moderateScale(18)} color={theme.colors.textSecondary} />
            <TextInput style={styles.searchInput} placeholder="Buscar aluno..." placeholderTextColor={theme.colors.textSecondary} value={searchQuery} onChangeText={setSearchQuery} keyboardAppearance="dark" />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: scale(4) }}>
                <Ionicons name="close-circle" size={moderateScale(18)} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setIsFilterModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="options" size={moderateScale(20)} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {activeTab === "aluno_ativo" && filtrosDinamicos.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.secondaryFilterContainer}>
            {filtrosDinamicos.map((mod) => (
              <TouchableOpacity key={mod} style={[styles.secondaryFilterChip, modalidadeFilter === mod && styles.secondaryFilterChipActive]} onPress={() => setModalidadeFilter(mod)}>
                <Text style={[styles.secondaryFilterText, modalidadeFilter === mod && styles.secondaryFilterTextActive]}>{mod}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <FlatList
          data={getListaAtiva()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons
                  name={activeTab === "em_contato" ? "search-outline" : activeTab === "aluno_ativo" ? "barbell-outline" : "archive-outline"}
                  size={moderateScale(36)} color={theme.colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>{searchQuery !== "" ? "Nenhum aluno encontrado" : "Nenhum registro aqui"}</Text>
              <Text style={styles.emptyText}>
                {searchQuery !== "" ? `Ninguém com o nome "${searchQuery}" nesta lista.` : activeTab === "em_contato" ? "Sua vitrine está online! Quando novos alunos se interessarem, eles aparecerão aqui." : activeTab === "aluno_ativo" ? "Você não possui alunos para este filtro de exibição." : "Os alunos com ciclos finalizados ou pausados ficarão salvos aqui."}
              </Text>
            </View>
          }
        />
      </ScrollView>

      <Modal visible={isFilterModalVisible} transparent animationType="slide" onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsFilterModalVisible(false)} activeOpacity={1} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filtrar e Ordenar</Text>

            <Text style={styles.sheetSectionTitle}>Origem da Conexão</Text>
            <View style={styles.sheetFilterRow}>
              {["Todos", "match", "convite"].map((o) => (
                <TouchableOpacity
                  key={o}
                  style={[styles.sheetFilterChip, origemFilter === o && styles.sheetFilterChipActive]}
                  onPress={() => setOrigemFilter(o)}
                >
                  <Text style={[styles.sheetFilterChipText, origemFilter === o && styles.sheetFilterChipTextActive]}>
                    {o === "Todos" ? "Qualquer" : o === "match" ? "Via Match" : "Via Convite"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Ordenar Lista por</Text>
            <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("recentes")}>
              <Text style={[styles.sortOptionText, sortOrder === "recentes" && styles.sortOptionTextActive]}>Mais Recentes</Text>
              {sortOrder === "recentes" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("alfabetica")}>
              <Text style={[styles.sortOptionText, sortOrder === "alfabetica" && styles.sortOptionTextActive]}>Ordem Alfabética (A-Z)</Text>
              {sortOrder === "alfabetica" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
            </TouchableOpacity>

            {activeTab === "aluno_ativo" && (
              <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder("vencimento")}>
                <Text style={[styles.sortOptionText, sortOrder === "vencimento" && styles.sortOptionTextActive]}>Dia de Vencimento</Text>
                {sortOrder === "vencimento" && <Ionicons name="checkmark-circle" size={moderateScale(22)} color={theme.colors.primary} />}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => setIsFilterModalVisible(false)}>
              <Text style={styles.sheetBtnCloseText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },

  headerBackground: { paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(70) : verticalScale(50), paddingBottom: verticalScale(70), borderBottomLeftRadius: moderateScale(36), borderBottomRightRadius: moderateScale(36) },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: theme.colors.primary, fontSize: moderateScale(12), fontWeight: "800", letterSpacing: 1.5, marginBottom: verticalScale(4) },
  personalName: { color: theme.colors.text, fontSize: moderateScale(28), fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  headerActionsRight: { flexDirection: "row", alignItems: "center" },
  btnLogout: { width: scale(44), height: scale(44), borderRadius: moderateScale(22), backgroundColor: "rgba(255, 59, 48, 0.15)", justifyContent: "center", alignItems: "center", marginRight: scale(16) },
  settingsBtn: { position: "relative" },
  headerAvatar: { width: scale(64), height: scale(64), borderRadius: moderateScale(32), borderWidth: 2, borderColor: theme.colors.border },
  settingsOverlay: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: scale(24), height: scale(24), borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: theme.colors.surface },

  statsWrapper: { paddingHorizontal: scale(20), marginTop: verticalScale(-45), zIndex: 10 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.colors.surface, borderRadius: moderateScale(24), paddingVertical: verticalScale(20), paddingHorizontal: scale(15), borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  statItem: { flex: 1, alignItems: "center" },
  iconWrapperNeutral: { backgroundColor: theme.colors.surfaceLight, padding: scale(8), borderRadius: moderateScale(12), marginBottom: verticalScale(8) },
  iconWrapperPrimary: { backgroundColor: "rgba(255, 107, 0, 0.15)", padding: scale(8), borderRadius: moderateScale(12), marginBottom: verticalScale(8) },
  iconWrapperAlert: { backgroundColor: "rgba(255, 107, 0, 0.15)", padding: scale(8), borderRadius: moderateScale(12), marginBottom: verticalScale(8) },
  statValue: { color: theme.colors.text, fontSize: moderateScale(20), fontWeight: "900" },
  statLabel: { color: theme.colors.textSecondary, fontSize: moderateScale(11), fontWeight: "bold", textTransform: "uppercase", marginTop: verticalScale(2), letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: "rgba(255, 107, 0, 0.2)", marginHorizontal: scale(2), marginVertical: verticalScale(10) },

  scrollContent: { padding: scale(20), paddingBottom: verticalScale(80) },

  quickAccessGrid: { flexDirection: "row", justifyContent: "space-between", gap: scale(12), marginTop: verticalScale(10), marginBottom: verticalScale(5) },
  quickAccessCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), padding: scale(16), borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quickAccessHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(12) },
  quickAccessIcon: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), justifyContent: "center", alignItems: "center" },
  quickAccessTitle: { color: theme.colors.text, fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(2), letterSpacing: 0.2 },
  quickAccessSubtitle: { color: theme.colors.textSecondary, fontSize: moderateScale(12) },

  crmHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(20), marginTop: verticalScale(25) },
  sectionTitle: { color: theme.colors.text, fontSize: moderateScale(22), fontFamily: theme.fonts.title },
  headerActions: { flexDirection: "row", gap: scale(10) },
  actionHeaderBtn: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },

  segmentControl: { flexDirection: "row", backgroundColor: theme.colors.surface, borderRadius: moderateScale(20), padding: scale(6), marginBottom: verticalScale(16), borderWidth: 1, borderColor: "#222" },
  segmentBtn: { flex: 1, paddingVertical: verticalScale(14), borderRadius: moderateScale(16), alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  segmentBtnActive: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  segmentText: { color: theme.colors.textSecondary, fontSize: moderateScale(13), fontWeight: "700" },
  segmentTextActive: { color: theme.colors.primary, fontWeight: "900" },

  searchSortContainer: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20), gap: scale(10) },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surfaceLight, height: verticalScale(50), borderRadius: moderateScale(16), paddingHorizontal: scale(16), borderWidth: 1, borderColor: theme.colors.border },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: moderateScale(15), marginLeft: scale(10), fontFamily: theme.fonts.body, height: "100%", outlineStyle: 'none' },
  sortBtn: { width: scale(50), height: scale(50), borderRadius: moderateScale(16), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },

  secondaryFilterContainer: { flexDirection: "row", gap: scale(10), marginBottom: verticalScale(20), paddingHorizontal: scale(2) },
  secondaryFilterChip: { paddingHorizontal: scale(16), paddingVertical: verticalScale(8), borderRadius: moderateScale(20), backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.borderLight },
  secondaryFilterChipActive: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: theme.colors.primary },
  secondaryFilterText: { color: theme.colors.textSecondary, fontSize: moderateScale(12), fontWeight: "700" },
  secondaryFilterTextActive: { color: theme.colors.primary, fontWeight: "900" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  bottomSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: moderateScale(30), borderTopRightRadius: moderateScale(30), paddingHorizontal: scale(24), paddingVertical: verticalScale(24), paddingBottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(24), borderWidth: 1, borderColor: theme.colors.border },
  sheetHandle: { width: scale(40), height: verticalScale(5), borderRadius: moderateScale(3), backgroundColor: "#444", alignSelf: "center", marginBottom: verticalScale(20) },
  sheetTitle: { color: "#FFF", fontSize: moderateScale(20), fontFamily: theme.fonts.title, marginBottom: verticalScale(10), textAlign: "center" },
  sheetSectionTitle: { color: theme.colors.textSecondary, fontSize: moderateScale(12), fontWeight: "bold", textTransform: "uppercase", marginTop: verticalScale(15), marginBottom: verticalScale(10), letterSpacing: 0.5 },
  sheetFilterRow: { flexDirection: "row", gap: scale(10), marginBottom: verticalScale(10) },
  sheetFilterChip: { flex: 1, paddingVertical: verticalScale(12), backgroundColor: theme.colors.surfaceLight, borderRadius: moderateScale(14), alignItems: "center", borderWidth: 1, borderColor: theme.colors.borderLight },
  sheetFilterChipActive: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: theme.colors.primary },
  sheetFilterChipText: { color: theme.colors.textSecondary, fontSize: moderateScale(13), fontWeight: "600" },
  sheetFilterChipTextActive: { color: theme.colors.primary, fontWeight: "bold" },
  sortOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: verticalScale(16), borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  sortOptionText: { color: theme.colors.textSecondary, fontSize: moderateScale(16), fontWeight: "600" },
  sortOptionTextActive: { color: theme.colors.primary, fontWeight: "bold" },
  sheetBtnClose: { marginTop: verticalScale(25), backgroundColor: theme.colors.primary, paddingVertical: verticalScale(16), borderRadius: moderateScale(16), alignItems: "center", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  sheetBtnCloseText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase" },

  /* === CARDS DE GESTÃO - DESIGN PREMIUM E LIMPO === */
  studentCardPremium: {
    backgroundColor: "#111", 
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#222",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeaderArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(16),
  },
  avatarWrapper: { 
    position: "relative", 
    marginRight: scale(14) 
  },
  avatarImage: { 
    width: scale(50), 
    height: scale(50), 
    borderRadius: moderateScale(25), 
    backgroundColor: "#222" 
  },
  avatarPlaceholder: { 
    width: scale(50), 
    height: scale(50), 
    borderRadius: moderateScale(25), 
    backgroundColor: "#1A1A1A", 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#333" 
  },
  statusIndicatorOnline: { 
    position: "absolute", 
    bottom: -2, 
    right: -2, 
    width: scale(14), 
    height: scale(14), 
    borderRadius: scale(7), 
    backgroundColor: "#00E676", 
    borderWidth: 2, 
    borderColor: "#111" 
  },
  statusIndicatorMessage: { 
    position: "absolute", 
    top: -2, 
    right: -2, 
    width: scale(16), 
    height: scale(16), 
    borderRadius: scale(8), 
    backgroundColor: theme.colors.primary, 
    borderWidth: 2, 
    borderColor: "#111" 
  },
  headerInfoWrapper: { 
    flex: 1, 
    justifyContent: "center" 
  },
  nameAndDateRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: verticalScale(6) 
  },
  studentNameText: { 
    color: "#FFF", 
    fontSize: moderateScale(16), 
    fontWeight: "700", 
    letterSpacing: 0.2, 
    flexShrink: 1 
  },
  studentAgeText: { 
    color: "#888", 
    fontWeight: "500" 
  },
  dateText: {
    color: "#666",
    fontSize: moderateScale(11),
    fontWeight: "600",
    marginLeft: scale(8),
  },
  tagsRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: scale(6),
    marginBottom: verticalScale(6)
  },
  orangePill: { 
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 0, 0.1)", 
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.25)",
    paddingHorizontal: scale(8), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(6) 
  },
  orangePillText: { 
    color: theme.colors.primary, 
    fontSize: moderateScale(10), 
    fontWeight: "700", 
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginRight: scale(6)
  },
  metricBadgeText: {
    color: '#888',
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginLeft: scale(4)
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#222",
    marginHorizontal: scale(16),
  },
  cardFooterArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  originIndicator: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: scale(4) 
  },
  originIndicatorText: { 
    fontSize: moderateScale(10), 
    fontWeight: "800", 
    letterSpacing: 0.5 
  },
  alertWrapper: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  badgeAlertGold: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255, 215, 0, 0.1)", 
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: scale(8), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(6), 
    gap: scale(4) 
  },
  badgeAlertGoldText: { 
    color: "#FFD700", 
    fontSize: moderateScale(9), 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },
  badgeAlertDanger: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255, 59, 48, 0.1)", 
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
    paddingHorizontal: scale(8), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(6), 
    gap: scale(4) 
  },
  badgeAlertDangerText: { 
    color: "#FF3B30", 
    fontSize: moderateScale(9), 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },
  badgeAlertNeutral: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#1A1A1A", 
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: scale(8), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(6), 
    gap: scale(4) 
  },
  badgeAlertNeutralText: { 
    color: "#AAA", 
    fontSize: moderateScale(9), 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },

  emptyState: { alignItems: "center", marginTop: verticalScale(40), padding: scale(20) },
  emptyIconBg: { width: scale(88), height: scale(88), borderRadius: moderateScale(44), backgroundColor: theme.colors.surface, justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20), borderWidth: 1, borderColor: theme.colors.borderLight },
  emptyTitle: { color: theme.colors.text, fontSize: moderateScale(20), fontWeight: "bold", marginBottom: verticalScale(10) },
  emptyText: { color: theme.colors.textSecondary, fontSize: moderateScale(14), textAlign: "center", lineHeight: moderateScale(22), paddingHorizontal: scale(20) },
}); 