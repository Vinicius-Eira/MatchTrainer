import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

export default function MeusAlunos({ navigation }) {
  const [alunosAtivos, setAlunosAtivos] = useState([]);
  const [convitesPendentes, setConvitesPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("ativos"); // 'ativos' ou 'pendentes'
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos', 'consultoria', 'presencial'
  const [ordemAZ, setOrdemAZ] = useState(true); // true = A-Z, false = Z-A

  useFocusEffect(
    useCallback(() => {
      buscarAlunos();
    }, [])
  );

  const buscarAlunos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: ativos } = await supabase
        .from("usuarios")
        .select("id, nome, tipo_acompanhamento, objetivo_principal, dia_vencimento")
        .eq("personal_id", user.id)
        .eq("tipo", "cliente");

      const { data: pendentes } = await supabase
        .from("convites_alunos")
        .select("id, nome, codigo_convite, tipo_acompanhamento")
        .eq("personal_id", user.id)
        .eq("status", "pendente");

      setAlunosAtivos(ativos || []);
      setConvitesPendentes(pendentes || []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const processarFiltros = () => {
    let base = abaAtiva === "ativos" ? alunosAtivos : convitesPendentes;

    if (busca) {
      base = base.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()));
    }

    if (filtroTipo !== "todos") {
      base = base.filter((a) => a.tipo_acompanhamento === filtroTipo);
    }

    base.sort((a, b) => {
      return ordemAZ 
        ? a.nome.localeCompare(b.nome) 
        : b.nome.localeCompare(a.nome);
    });

    return base;
  };

  const alunosFiltrados = processarFiltros();

  const renderCardAluno = (aluno, isPendente) => (
    <TouchableOpacity
      key={aluno.id}
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        if (!isPendente) {
          console.log("Abrir aluno:", aluno.id);
        }
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{aluno.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.alunoNome}>{aluno.nome}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {aluno.tipo_acompanhamento === 'consultoria' ? 'Consultoria' : 'Presencial'}
              </Text>
            </View>
            {!isPendente && aluno.dia_vencimento && (
              <View style={[styles.tag, { backgroundColor: 'rgba(255, 107, 0, 0.1)' }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                  Vence dia {aluno.dia_vencimento}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {isPendente && (
        <View style={styles.pendenteFooter}>
          <Text style={styles.pendenteTexto}>Aguardando ativação</Text>
          <View style={styles.codigoBox}>
            <Text style={styles.codigoText}>Cód: {aluno.codigo_convite}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CRM Alunos</Text>
        <TouchableOpacity
          style={styles.btnAdd}
          onPress={() => navigation.navigate("AdicionarAluno")}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pelo nome..."
          placeholderTextColor={theme.colors.textMuted}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity 
            style={styles.filterPill} 
            onPress={() => setOrdemAZ(!ordemAZ)}
          >
            <MaterialCommunityIcons name={ordemAZ ? "sort-alphabetical-ascending" : "sort-alphabetical-descending"} size={16} color={theme.colors.primary} />
            <Text style={styles.filterPillText}>{ordemAZ ? "A-Z" : "Z-A"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filtroTipo === "todos" && styles.filterPillActive]} 
            onPress={() => setFiltroTipo("todos")}
          >
            <Text style={[styles.filterPillText, filtroTipo === "todos" && styles.filterPillTextActive]}>Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filtroTipo === "consultoria" && styles.filterPillActive]} 
            onPress={() => setFiltroTipo("consultoria")}
          >
            <Text style={[styles.filterPillText, filtroTipo === "consultoria" && styles.filterPillTextActive]}>Consultoria</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, filtroTipo === "presencial" && styles.filterPillActive]} 
            onPress={() => setFiltroTipo("presencial")}
          >
            <Text style={[styles.filterPillText, filtroTipo === "presencial" && styles.filterPillTextActive]}>Presencial</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === "ativos" && styles.tabActive]}
          onPress={() => setAbaAtiva("ativos")}
        >
          <Text style={[styles.tabText, abaAtiva === "ativos" && styles.tabTextActive]}>
            Ativos ({alunosAtivos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, abaAtiva === "pendentes" && styles.tabActive]}
          onPress={() => setAbaAtiva("pendentes")}
        >
          <Text style={[styles.tabText, abaAtiva === "pendentes" && styles.tabTextActive]}>
            Pendentes ({convitesPendentes.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : alunosFiltrados.length > 0 ? (
          alunosFiltrados.map((aluno) => renderCardAluno(aluno, abaAtiva === "pendentes"))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptySubtitle}>
              Não encontramos alunos com esses filtros. Tente limpar a busca.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  btnVoltar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 20, color: theme.colors.text, fontWeight: "bold" },
  btnAdd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 16 },
  
  filterScroll: { paddingHorizontal: 24, paddingVertical: 16, gap: 10, alignItems: 'center' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  filterPillText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700", marginLeft: 4 },
  filterPillTextActive: { color: theme.colors.primary, fontWeight: "900" },

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: theme.colors.background },
  tabText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 14 },
  tabTextActive: { color: theme.colors.primary, fontWeight: "bold" },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: theme.colors.text, fontSize: 20, fontWeight: "bold" },
  infoContainer: { flex: 1, marginLeft: 16 },
  alunoNome: { color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  pendenteFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  pendenteTexto: { color: theme.colors.textSecondary, fontSize: 13 },
  codigoBox: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  codigoText: { color: theme.colors.primary, fontWeight: "bold", fontSize: 13 },
  
  emptyState: { alignItems: "center", marginTop: 40 },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", paddingHorizontal: 20, lineHeight: 22 },
});