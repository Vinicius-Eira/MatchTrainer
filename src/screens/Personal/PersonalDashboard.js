import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from "react-native";
import { BlurView } from "expo-blur";

import { useOnboarding } from '../../hooks/useOnboarding';
import WidgetOnboarding from '../../components/WidgetOnboarding';

import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

export default function PersonalDashboard({ navigation }) {
  const { jornada, progressoPct, completarMissao, loadingJornada, recarregarJornada } = useOnboarding();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("em_contato"); 
  const [modalidadeFilter, setModalidadeFilter] = useState("Todos"); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recentes"); 
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [filtrosDinamicos, setFiltrosDinamicos] = useState(["Todos"]);

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

  const carregarDados = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const [perfilRes, conexoesRes, mediaRes, ativosRes, inativosRes, planosRes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", session.user.id).single(),
        supabase.from("conexoes").select("*, usuarios(*)").eq("personal_id", session.user.id).in("status", ["pendente", "em_contato", "lead", "aguardando_personal", "aceito_personal"]),
        supabase.rpc("get_media_avaliacoes", { p_id: session.user.id }),
        supabase.from("conexoes").select("*, usuarios(*)").eq("personal_id", session.user.id).eq("status", "aluno_ativo"),
        supabase.from("conexoes").select("*, usuarios(*)").eq("personal_id", session.user.id).eq("status", "inativo"),
        supabase.from("planos").select("aluno_id, servicos_inclusos, dia_vencimento").eq("personal_id", session.user.id).eq("status", "ativo")
      ]);

      if (conexoesRes.error) {
        Alert.alert("Erro no Banco", "Falha ao buscar alunos. Verifique o console.");
      }

      if (!perfilRes.error) {
        setPersonal(perfilRes.data);
        const servicos = perfilRes.data.servicos_oferecidos || perfilRes.data.modalidades || [];
        
        let arrFiltros = ["Todos"];
        if (servicos.includes("Consultoria")) arrFiltros.push("Consultoria");
        if (servicos.includes("Presencial")) arrFiltros.push("Presencial");
        if (servicos.includes("Consultoria") && servicos.includes("Presencial")) arrFiltros.push("Híbrido");
        arrFiltros.push("Sem Contrato");
        
        setFiltrosDinamicos(arrFiltros);
      }

      const planosMap = new Map();
      if (planosRes.data) {
        planosRes.data.forEach(p => planosMap.set(p.aluno_id, {
          servicos: p.servicos_inclusos || [],
          vencimento: p.dia_vencimento || 99 
        }));
      }

      const dataLeads = conexoesRes.data || [];
      const dataInativos = inativosRes.data || [];
      
      const dataAtivos = (ativosRes.data || []).map(c => {
        const planoData = planosMap.get(c.usuario_id) || { servicos: [], vencimento: 99 };
        const servicosDoAluno = planoData.servicos;
        
        let categoriaUi = 'Sem Contrato';
        let isHibrido = false;

        if (servicosDoAluno.length > 1) {
          categoriaUi = 'Híbrido (Combo)';
          isHibrido = true;
        } else if (servicosDoAluno.length === 1) {
          categoriaUi = servicosDoAluno[0];
        }

        return {
          ...c,
          servicos_array: servicosDoAluno, 
          dia_vencimento: planoData.vencimento,
          modalidadeUi: categoriaUi, 
          isHibrido: isHibrido
        };
      });

      const contagemNaoLidas = {};
      const todasConexoes = [...dataLeads, ...dataAtivos, ...dataInativos];

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
      setEmContato(dataLeads);
      setAtivos(dataAtivos);
      setInativos(dataInativos);
      setNotaMedia(mediaRes.data || 0);

    } catch (error) {
      console.error("Erro geral ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    if(recarregarJornada) recarregarJornada(); 
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair da Conta",
      "Deseja realmente sair do seu painel?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await supabase.auth.signOut();
            navigation.reset({ index: 0, routes: [{ name: 'ChoiceScreen' }] });
          }
        }
      ]
    );
  };

  const getListaAtiva = () => {
    let lista = [];
    
    if (activeTab === "em_contato") lista = [...emContato];
    else if (activeTab === "inativo") lista = [...inativos];
    else if (activeTab === "aluno_ativo") {
      lista = [...ativos];
      if (modalidadeFilter === "Consultoria") lista = lista.filter(a => !a.isHibrido && a.servicos_array.includes("Consultoria"));
      else if (modalidadeFilter === "Presencial") lista = lista.filter(a => !a.isHibrido && a.servicos_array.includes("Presencial"));
      else if (modalidadeFilter === "Híbrido") lista = lista.filter(a => a.isHibrido);
      else if (modalidadeFilter === "Sem Contrato") lista = lista.filter(a => a.servicos_array.length === 0);
    }

    if (searchQuery.trim() !== "") {
      const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const q = removerAcentos(searchQuery);
      lista = lista.filter(item => removerAcentos(item.usuarios?.nome || "").includes(q));
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
    const status = item.status;
    const isNovo = status === "pendente" || status === "aguardando_personal";

    const userData = item.usuarios;
    const conexaoId = item.id;
    const temMensagemNaoLida = naoLidas[item.id] > 0;

    const prefs = userData?.preferencias || {};
    const pesoStr = userData?.peso ? `${userData.peso}kg` : "--";
    const freqStr = prefs.frequencia ? prefs.frequencia.split("-")[0] + "x" : "--";

    return (
      <TouchableOpacity
        style={[
          styles.alunoCard,
          isNovo && styles.alunoCardNovo,
          isAtivo && styles.alunoCardAtivo,
          isInativo && styles.alunoCardInativo, 
        ]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("VisaoAluno", {
            conexaoId: conexaoId,
            aluno: userData,
            statusAtual: status,
            personalInfo: personal,
          });
        }}
      >
        <View style={styles.cardAvatarContainer}>
          <Image
            source={{ uri: userData?.foto_url || "https://via.placeholder.com/150" }}
            style={[styles.alunoAvatar, isInativo && styles.avatarInativo]}
          />
          {temMensagemNaoLida ? (
            <View style={styles.notificationDot} />
          ) : isAtivo ? (
            <View style={styles.onlineDot} />
          ) : null}
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.alunoNome, isInativo && styles.textInativo]} numberOfLines={1}>
            {userData?.nome || "Novo Aluno"}
          </Text>

          {isAtivo || isInativo ? (
            <View style={styles.infoRowBiometria}>
              <View style={styles.biometriaItem}>
                <MaterialCommunityIcons name="scale-bathroom" size={12} color={isInativo ? theme.colors.danger : theme.colors.textSecondary} />
                <Text style={[styles.infoTextBiometria, isInativo && styles.textInativo]}>{pesoStr}</Text>
              </View>
              <View style={[styles.biometriaDivider, isInativo && { backgroundColor: "rgba(255, 59, 48, 0.2)" }]} />
              <View style={styles.biometriaItem}>
                <Ionicons name="calendar-outline" size={12} color={isInativo ? theme.colors.danger : theme.colors.textSecondary} />
                <Text style={[styles.infoTextBiometria, isInativo && styles.textInativo]}>{freqStr}/sem</Text>
              </View>
              
              {/* 🚀 Adicionando a TAG de Vencimento se estiver ordenado por Vencimento */}
              {(isAtivo && sortOrder === "vencimento" && item.dia_vencimento !== 99) && (
                <>
                  <View style={styles.biometriaDivider} />
                  <View style={styles.biometriaItem}>
                    <Ionicons name="cash-outline" size={12} color={theme.colors.primary} />
                    <Text style={[styles.infoTextBiometria, {color: theme.colors.primary}]}>Dia {item.dia_vencimento}</Text>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {userData?.cidade || "Local não informado"}
              </Text>
            </View>
          )}

          <View style={styles.tagsContainer}>
            <View style={[styles.tagObjetivo, isInativo && styles.tagObjetivoInativo]}>
              <FontAwesome5 name="fire" size={10} color={isInativo ? theme.colors.danger : theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.tagText, isInativo && { color: theme.colors.danger }]}>
                {userData?.objetivo_principal || prefs?.objetivo || "Não definido"}
              </Text>
            </View>

            {isAtivo && item.modalidadeUi && item.servicos_array?.length > 0 && (
              <View style={[styles.tagModalidade, item.isHibrido && { borderColor: "#0A84FF", backgroundColor: "rgba(10, 132, 255, 0.1)" }]}>
                <Ionicons 
                  name={item.isHibrido ? 'diamond-outline' : item.servicos_array.includes('Consultoria') ? 'phone-portrait-outline' : 'barbell-outline'} 
                  size={10} 
                  color={item.isHibrido ? "#0A84FF" : theme.colors.primary} 
                  style={{marginRight: 4}} 
                />
                <Text style={[styles.tagModalidadeText, item.isHibrido && { color: "#0A84FF" }]}>{item.modalidadeUi}</Text>
              </View>
            )}

            {isAtivo && item.servicos_array?.length === 0 && (
               <View style={styles.tagSemContrato}>
                  <Ionicons name="warning" size={10} color="#FFD700" style={{marginRight: 4}} />
                  <Text style={styles.tagSemContratoText}>S/ Contrato</Text>
               </View>
            )}

            {(status === "pendente" || status === "aguardando_personal") && (
              <View style={styles.tagStatusPrimary}><Text style={styles.tagStatusTextPrimary}>Nova Solicitação</Text></View>
            )}
            {(status === "em_contato" || status === "lead") && (
              <View style={styles.tagStatusNeutral}><Text style={styles.tagStatusTextNeutral}>Em Negociação</Text></View>
            )}
            {status === "inativo" && (
              <View style={styles.tagStatusDanger}><Text style={styles.tagStatusTextDanger}>Ciclo Encerrado</Text></View>
            )}
          </View>
        </View>

        <View style={styles.cardActionArea}>
          <View
            style={[
              styles.actionIcon,
              isNovo ? styles.actionIconPrimary : styles.actionIconSecondary,
              isInativo && styles.actionIconInativo,
            ]}
          >
            {isNovo ? (
              <Ionicons name="person-add" size={16} color={theme.colors.backgroundPure} />
            ) : isAtivo ? (
              <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
            ) : isInativo ? (
              <Ionicons name="archive" size={16} color={theme.colors.danger} />
            ) : (
              <Ionicons name="chatbubbles" size={16} color={theme.colors.text} />
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
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.greeting}>PAINEL DO TREINADOR</Text>
            <Text style={styles.personalName} numberOfLines={1}>
              Olá, {personal?.nome?.split(" ")[0] || "Professor"}
            </Text>
          </View>

          <View style={styles.headerActionsRight}>
            <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("PersonalSetup")} activeOpacity={0.7}>
              <Image source={{ uri: personal?.foto_url || "https://via.placeholder.com/150" }} style={styles.headerAvatar} />
              <View style={styles.settingsOverlay}>
                <Ionicons name="pencil" size={12} color={theme.colors.backgroundPure} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsWrapper}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="account-group" size={22} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{ativos.length}</Text>
            <Text style={styles.statLabel}>Alunos Ativos</Text>
          </View>

          <View style={styles.statDivider} />

          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("Avaliacoes")} activeOpacity={0.7}>
            <View style={styles.iconWrapperPrimary}>
              <MaterialCommunityIcons name="star" size={22} color={theme.colors.primary} />
            </View>
            <Text style={styles.statValue}>{Number(notaMedia).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Sua Nota</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={emContato.length > 0 ? styles.iconWrapperAlert : styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="bell-ring" size={22} color={emContato.length > 0 ? theme.colors.primary : theme.colors.textSecondary} />
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
        
        <WidgetOnboarding 
          jornada={jornada} 
          progressoPct={progressoPct} 
          navigation={navigation} 
          completarMissao={completarMissao} 
        />
        
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("Recebimentos")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(255, 107, 0, 0.15)" }]}>
                <Ionicons name="wallet-outline" size={22} color={theme.colors.primary} />
              </View>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>Recebimentos</Text>
            <Text style={styles.quickAccessSubtitle}>Caixa e PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessCard} activeOpacity={0.8} onPress={() => navigation.navigate("PainelCrescimento")}>
            <View style={styles.quickAccessHeader}>
              <View style={[styles.quickAccessIcon, { backgroundColor: "rgba(10, 132, 255, 0.15)" }]}>
                <Ionicons name="rocket-outline" size={22} color="#0A84FF" />
              </View>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.quickAccessTitle}>MatchBusiness</Text>
            <Text style={styles.quickAccessSubtitle}>Metas e Gráficos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionHeaderBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("AdicionarAluno")}
            >
              <Ionicons name="person-add" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]} onPress={() => setActiveTab("em_contato")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>
              Novos {emContato.length > 0 && `(${emContato.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]} onPress={() => { setActiveTab("aluno_ativo"); setModalidadeFilter("Todos"); }} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>
              Ativos {ativos.length > 0 && `(${ativos.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, activeTab === "inativo" && styles.segmentBtnActive]} onPress={() => setActiveTab("inativo")} activeOpacity={0.8}>
            <Text style={[styles.segmentText, activeTab === "inativo" && styles.segmentTextActive]}>
              Inativos
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🚀 BUSCA E ORDENAÇÃO */}
        <View style={styles.searchSortContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar aluno por nome..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardAppearance="dark"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={{padding: 4}}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setIsSortModalVisible(true)} activeOpacity={0.7}>
            <Ionicons name="filter" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 🚀 FILTRO DINÂMICO DE SERVIÇOS (APENAS ATIVOS E SE O PERSONAL OFERECER) */}
        {activeTab === "aluno_ativo" && filtrosDinamicos.length > 2 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.secondaryFilterContainer}>
            {filtrosDinamicos.map(mod => (
              <TouchableOpacity
                key={mod}
                style={[styles.secondaryFilterChip, modalidadeFilter === mod && styles.secondaryFilterChipActive]}
                onPress={() => setModalidadeFilter(mod)}
              >
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
                  size={36}
                  color={theme.colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery !== "" ? "Nenhum aluno encontrado" : "Nenhum registro aqui"}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery !== "" 
                  ? `Ninguém com o nome "${searchQuery}" nesta lista.`
                  : activeTab === "em_contato"
                  ? "Sua vitrine está online! Quando novos alunos se interessarem pelo seu perfil, eles aparecerão aqui."
                  : activeTab === "aluno_ativo"
                  ? "Você não possui alunos ativos para este filtro."
                  : "Os alunos com ciclos finalizados ou pausados ficarão salvos aqui."}
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* 🚀 BOTTOM SHEET DE ORDENAÇÃO */}
      <Modal visible={isSortModalVisible} transparent animationType="slide" onRequestClose={() => setIsSortModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{flex: 1}} onPress={() => setIsSortModalVisible(false)} activeOpacity={1} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Ordenar Lista</Text>

            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortOrder("recentes"); setIsSortModalVisible(false); }}>
              <Text style={[styles.sortOptionText, sortOrder === "recentes" && styles.sortOptionTextActive]}>Mais Recentes</Text>
              {sortOrder === "recentes" && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortOrder("alfabetica"); setIsSortModalVisible(false); }}>
              <Text style={[styles.sortOptionText, sortOrder === "alfabetica" && styles.sortOptionTextActive]}>Ordem Alfabética (A-Z)</Text>
              {sortOrder === "alfabetica" && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
            </TouchableOpacity>

            {activeTab === "aluno_ativo" && (
              <TouchableOpacity style={styles.sortOption} onPress={() => { setSortOrder("vencimento"); setIsSortModalVisible(false); }}>
                <Text style={[styles.sortOptionText, sortOrder === "vencimento" && styles.sortOptionTextActive]}>Dia de Vencimento</Text>
                {sortOrder === "vencimento" && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => setIsSortModalVisible(false)}>
               <Text style={styles.sheetBtnCloseText}>Cancelar</Text>
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

  headerBackground: { paddingHorizontal: 24, paddingTop: Platform.OS === "ios" ? 70 : 50, paddingBottom: 70, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: theme.colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 4 },
  personalName: { color: theme.colors.text, fontSize: 28, fontFamily: theme.fonts.title, letterSpacing: 0.5 },

  headerActionsRight: { flexDirection: "row", alignItems: "center" },
  btnLogout: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255, 59, 48, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 16 },
  settingsBtn: { position: "relative" },
  headerAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: theme.colors.border },
  settingsOverlay: { position: "absolute", bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: theme.colors.surface },

  statsWrapper: { paddingHorizontal: 20, marginTop: -45, zIndex: 10 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.colors.surface, borderRadius: 24, paddingVertical: 20, paddingHorizontal: 15, borderWidth: 1.5, borderColor: "rgba(255, 107, 0, 0.4)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  statItem: { flex: 1, alignItems: "center" },
  iconWrapperNeutral: { backgroundColor: theme.colors.surfaceLight, padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperPrimary: { backgroundColor: "rgba(255, 107, 0, 0.15)", padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperAlert: { backgroundColor: "rgba(255, 107, 0, 0.15)", padding: 8, borderRadius: 12, marginBottom: 8 },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: "rgba(255, 107, 0, 0.2)", marginHorizontal: 2, marginVertical: 10 },

  scrollContent: { padding: 20, paddingBottom: 80 },

  quickAccessGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 10, marginBottom: 5 },
  quickAccessCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  quickAccessHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  quickAccessIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  quickAccessTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "bold", marginBottom: 2, letterSpacing: 0.2 },
  quickAccessSubtitle: { color: theme.colors.textSecondary, fontSize: 12 },

  crmHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 25 },
  sectionTitle: { color: theme.colors.text, fontSize: 22, fontFamily: theme.fonts.title },
  headerActions: { flexDirection: "row", gap: 10 },
  actionHeaderBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },

  segmentControl: { flexDirection: "row", backgroundColor: theme.colors.surface, borderRadius: 20, padding: 6, marginBottom: 16, borderWidth: 1, borderColor: "#222" },
  segmentBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  segmentBtnActive: { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 5 },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: theme.colors.primary, fontWeight: "900" },

  searchSortContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, height: 50, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 15, marginLeft: 10, fontFamily: theme.fonts.body, height: '100%' },
  sortBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: theme.colors.border },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "#444", alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { color: "#FFF", fontSize: 20, fontFamily: theme.fonts.title, marginBottom: 20, textAlign: 'center' },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  sortOptionText: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '600' },
  sortOptionTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
  sheetBtnClose: { marginTop: 25, backgroundColor: theme.colors.surfaceLight, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  sheetBtnCloseText: { color: "#FFF", fontSize: 16, fontWeight: 'bold' },

  secondaryFilterContainer: { flexDirection: 'row', gap: 10, marginBottom: 20, paddingHorizontal: 2 },
  secondaryFilterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.borderLight },
  secondaryFilterChipActive: { backgroundColor: "rgba(255, 107, 0, 0.15)", borderColor: theme.colors.primary },
  secondaryFilterText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700" },
  secondaryFilterTextActive: { color: theme.colors.primary, fontWeight: "900" },

  alunoCard: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.borderLight },
  alunoCardNovo: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  alunoCardAtivo: { borderColor: "rgba(0, 230, 118, 0.3)", backgroundColor: "rgba(0, 230, 118, 0.03)" },
  alunoCardInativo: { borderColor: "rgba(255, 59, 48, 0.4)", backgroundColor: "rgba(255, 59, 48, 0.08)" },

  cardAvatarContainer: { position: "relative" },
  alunoAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border },
  avatarInativo: { opacity: 0.8, borderWidth: 1, borderColor: "rgba(255, 59, 48, 0.4)" },
  notificationDot: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.danger, borderWidth: 3, borderColor: theme.colors.surface },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.success, borderWidth: 3, borderColor: theme.colors.surface },

  cardInfo: { flex: 1, marginLeft: 16 },
  alunoNome: { color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.2 },
  textInativo: { color: "rgba(255, 255, 255, 0.8)" },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 },

  infoRowBiometria: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  biometriaItem: { flexDirection: "row", alignItems: "center" },
  infoTextBiometria: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4, fontWeight: "600" },
  biometriaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.borderLight, marginHorizontal: 8 },

  tagsContainer: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  tagObjetivo: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  tagObjetivoInativo: { borderColor: "rgba(255, 59, 48, 0.3)", backgroundColor: "rgba(255, 59, 48, 0.1)" },
  tagText: { color: theme.colors.textBody, fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  tagModalidade: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,107,0,0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  tagModalidadeText: { color: theme.colors.primary, fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  tagSemContrato: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 215, 0, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 215, 0, 0.3)" },
  tagSemContratoText: { color: "#FFD700", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },

  tagStatusPrimary: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  tagStatusTextPrimary: { color: theme.colors.backgroundPure, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  tagStatusNeutral: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.borderLight },
  tagStatusTextNeutral: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  tagStatusDanger: { backgroundColor: "rgba(255, 59, 48, 0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255, 59, 48, 0.4)" },
  tagStatusTextDanger: { color: theme.colors.danger, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },

  cardActionArea: { justifyContent: "center", alignItems: "center", marginLeft: 10 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  actionIconPrimary: { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  actionIconSecondary: { backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.borderLight },
  actionIconInativo: { backgroundColor: "rgba(255, 59, 48, 0.15)", borderWidth: 1, borderColor: "rgba(255, 59, 48, 0.3)" },

  emptyState: { alignItems: "center", marginTop: 40, padding: 20 },
  emptyIconBg: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.colors.surface, justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: theme.colors.borderLight },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
});