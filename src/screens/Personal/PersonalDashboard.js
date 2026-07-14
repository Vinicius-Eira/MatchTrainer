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
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

export default function PersonalDashboard({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("em_contato");
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
    });
    return unsubscribe;
  }, [navigation]);

  const carregarDados = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const [perfilRes, conexoesRes, mediaRes, ativosRes, inativosRes] = await Promise.all([
        supabase
          .from("personals")
          .select("*")
          .eq("id", session.user.id)
          .single(),

        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .in("status", ["pendente", "em_contato", "lead", "aguardando_personal", "aceito_personal"])
          .order("criado_em", { ascending: false }),

        supabase.rpc("get_media_avaliacoes", { p_id: session.user.id }),

        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .eq("status", "aluno_ativo")
          .order("criado_em", { ascending: false }),

        supabase
          .from("conexoes")
          .select("*, usuarios(*)")
          .eq("personal_id", session.user.id)
          .eq("status", "inativo")
          .order("criado_em", { ascending: false }),
      ]);

      if (conexoesRes.error) {
        Alert.alert("Erro no Banco", "Falha ao buscar alunos. Verifique o console.");
      }

      if (!perfilRes.error) setPersonal(perfilRes.data);

      const dataLeads = conexoesRes.data || [];
      const dataAtivos = ativosRes.data || [];
      const dataInativos = inativosRes.data || [];

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
    if (activeTab === "em_contato") return emContato;
    if (activeTab === "aluno_ativo") return ativos;
    if (activeTab === "inativo") return inativos;
    return [];
  };

  const renderAlunoCard = ({ item }) => {
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
            source={{
              uri: userData?.foto_url || "https://via.placeholder.com/150",
            }}
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
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={12}
                  color={isInativo ? theme.colors.danger : theme.colors.textSecondary}
                />
                <Text style={[styles.infoTextBiometria, isInativo && styles.textInativo]}>{pesoStr}</Text>
              </View>
              <View style={[styles.biometriaDivider, isInativo && { backgroundColor: "rgba(255, 59, 48, 0.2)" }]} />
              <View style={styles.biometriaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={isInativo ? theme.colors.danger : theme.colors.textSecondary}
                />
                <Text style={[styles.infoTextBiometria, isInativo && styles.textInativo]}>{freqStr}/sem</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {userData?.cidade || "Local não informado"}
              </Text>
            </View>
          )}

          <View style={styles.tagsContainer}>
            <View style={[styles.tagObjetivo, isInativo && styles.tagObjetivoInativo]}>
              <FontAwesome5
                name="fire"
                size={10}
                color={isInativo ? theme.colors.danger : theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tagText, isInativo && { color: theme.colors.danger }]}>
                {userData?.objetivo_principal || prefs?.objetivo || "Não definido"}
              </Text>
            </View>

            {(status === "pendente" || status === "aguardando_personal") && (
              <View style={styles.tagStatusPrimary}>
                <Text style={styles.tagStatusTextPrimary}>Nova Solicitação</Text>
              </View>
            )}

            {status === "aceito_personal" && (
              <View style={styles.tagStatusWarning}>
                <Text style={styles.tagStatusTextWarning}>Aguardando Aluno</Text>
              </View>
            )}

            {(status === "em_contato" || status === "lead") && (
              <View style={styles.tagStatusNeutral}>
                <Text style={styles.tagStatusTextNeutral}>Em Negociação</Text>
              </View>
            )}

            {status === "aluno_ativo" && (
              <View style={styles.tagStatusSuccess}>
                <Text style={styles.tagStatusTextSuccess}>Treino Ativo</Text>
              </View>
            )}

            {status === "inativo" && (
              <View style={styles.tagStatusDanger}>
                <Text style={styles.tagStatusTextDanger}>Ciclo Encerrado</Text>
              </View>
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
              <Ionicons name="barbell-outline" size={16} color={theme.colors.text} />
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

  if (loading && !personal)
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionHeaderBtn} onPress={() => navigation.navigate("MeusAlunos")}>
              <Ionicons name="list" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionHeaderBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("AdicionarAluno")}
            >
              <Ionicons name="person-add" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("em_contato")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>
              Novos {emContato.length > 0 && `(${emContato.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("aluno_ativo")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>
              Ativos {ativos.length > 0 && `(${ativos.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "inativo" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("inativo")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "inativo" && styles.segmentTextActive]}>
              Inativos
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={getListaAtiva()}
          keyExtractor={(item) => item.id}
          renderItem={renderAlunoCard}
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
              <Text style={styles.emptyTitle}>Nenhum registro aqui</Text>
              <Text style={styles.emptyText}>
                {activeTab === "em_contato"
                  ? "Sua vitrine está online! Quando novos alunos se interessarem pelo seu perfil, eles aparecerão aqui."
                  : activeTab === "aluno_ativo"
                  ? "Você ainda não possui alunos ativos. Adicione um aluno clicando no botão '+' acima."
                  : "Os alunos com ciclos finalizados ou pausados ficarão salvos aqui no seu histórico."}
              </Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },

  headerBackground: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 70,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  personalName: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.title,
    letterSpacing: 0.5,
  },

  headerActionsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnLogout: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  settingsBtn: { position: "relative" },
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  settingsOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },

  statsWrapper: { paddingHorizontal: 20, marginTop: -45, zIndex: 10 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: "rgba(255, 107, 0, 0.4)",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  iconWrapperNeutral: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconWrapperPrimary: {
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconWrapperAlert: {
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    marginHorizontal: 2,
    marginVertical: 10,
  },

  scrollContent: { padding: 20, paddingBottom: 80 },

  crmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.fonts.title,
  },
  headerActions: { flexDirection: "row", gap: 10 },
  actionHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  segmentControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#222",
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentBtnActive: { 
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  segmentTextActive: { 
    color: theme.colors.primary,
    fontWeight: "900",
  },

  alunoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  alunoCardNovo: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  alunoCardAtivo: {
    borderColor: "rgba(0, 230, 118, 0.3)",
    backgroundColor: "rgba(0, 230, 118, 0.03)",
  },
  alunoCardInativo: {
    borderColor: "rgba(255, 59, 48, 0.4)",
    backgroundColor: "rgba(255, 59, 48, 0.08)",
  },

  cardAvatarContainer: { position: "relative" },
  alunoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarInativo: {
    opacity: 0.8,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.danger,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },

  cardInfo: { flex: 1, marginLeft: 16 },
  alunoNome: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  textInativo: {
    color: "rgba(255, 255, 255, 0.8)",
  },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 },

  infoRowBiometria: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  biometriaItem: { flexDirection: "row", alignItems: "center" },
  infoTextBiometria: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  biometriaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: 8,
  },

  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  tagObjetivo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagObjetivoInativo: {
    borderColor: "rgba(255, 59, 48, 0.3)",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  tagText: {
    color: theme.colors.textBody,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  tagStatusPrimary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagStatusTextPrimary: {
    color: theme.colors.backgroundPure,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  tagStatusWarning: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  tagStatusTextWarning: {
    color: theme.colors.warning,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  tagStatusNeutral: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  tagStatusTextNeutral: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  tagStatusSuccess: {
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  tagStatusTextSuccess: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  tagStatusDanger: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.4)",
  },
  tagStatusTextDanger: {
    color: theme.colors.danger,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  cardActionArea: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconPrimary: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconSecondary: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  actionIconInativo: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },

  emptyState: { alignItems: "center", marginTop: 40, padding: 20 },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});