import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, ActivityIndicator, ScrollView, StatusBar, Dimensions,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const { width } = Dimensions.get("window");

export default function PersonalDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState("em_contato");
  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState(null);
  
  const [emContato, setEmContato] = useState([]);
  const [ativos, setAtivos] = useState([]);
  
  const [notaMedia, setNotaMedia] = useState(0);
  const [naoLidas, setNaoLidas] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => { carregarDados(); });
    return unsubscribe;
  }, [navigation]);

  const carregarDados = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const [perfilRes, conexoesRes, mediaRes] = await Promise.all([
        supabase.from("personals").select("*").eq("id", session.user.id).single(),
        supabase.from("conexoes").select("*, usuarios(*)").eq("personal_id", session.user.id).in("status", ["pendente", "em_contato", "lead", "aceito_personal", "aluno_ativo"]),
        supabase.rpc("get_media_avaliacoes", { p_id: session.user.id }),
      ]);

      if (!perfilRes.error) setPersonal(perfilRes.data);

      const data = conexoesRes.data || [];
      
      const contagemNaoLidas = {};
      await Promise.all(data.map(async (c) => {
        const { count } = await supabase
          .from('mensagens')
          .select('id', { count: 'exact', head: true })
          .eq('conexao_id', c.id).eq('lida', false).neq('remetente_id', session.user.id);
        contagemNaoLidas[c.id] = count || 0;
      }));
      setNaoLidas(contagemNaoLidas);

      setEmContato(data.filter((c) => ["pendente", "em_contato", "lead", "aceito_personal"].includes(c.status)));
      
      setAtivos(data.filter((c) => c.status === "aluno_ativo"));
      
      setNotaMedia(mediaRes.data || 0);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderAlunoCard = ({ item }) => {
    const temMensagemNaoLida = naoLidas[item.id] > 0;
    const status = item.status;
    const isNovo = status === "pendente"; 
    const isAtivo = status === "aluno_ativo";

    const prefs = item.usuarios?.preferencias || {};
    const pesoStr = item.usuarios?.peso ? `${item.usuarios.peso}kg` : '--';
    const freqStr = prefs.frequencia ? prefs.frequencia.split('-')[0] + 'x' : '--';

    return (
      <TouchableOpacity 
        style={[styles.alunoCard, isNovo && styles.alunoCardNovo, isAtivo && styles.alunoCardAtivo]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("VisaoAluno", { 
          conexaoId: item.id, 
          aluno: item.usuarios, 
          statusAtual: status,
          personalInfo: personal 
        })}
      >
        <View style={styles.cardAvatarContainer}>
          <Image source={{ uri: item.usuarios?.foto_url || 'https://via.placeholder.com/150' }} style={styles.alunoAvatar} />
          
          {temMensagemNaoLida ? (
            <View style={styles.notificationDot} />
          ) : isAtivo ? (
            <View style={styles.onlineDot} />
          ) : null}
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.alunoNome} numberOfLines={1}>{item.usuarios?.nome || 'Novo Aluno'}</Text>
          
          {isAtivo ? (
            <View style={styles.infoRowBiometria}>
              <View style={styles.biometriaItem}>
                <MaterialCommunityIcons name="scale-bathroom" size={12} color={theme.colors.textSecondary} />
                <Text style={styles.infoTextBiometria}>{pesoStr}</Text>
              </View>
              <View style={styles.biometriaDivider} />
              <View style={styles.biometriaItem}>
                <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                <Text style={styles.infoTextBiometria}>{freqStr}/sem</Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.usuarios?.cidade || 'Local não informado'}
              </Text>
            </View>
          )}

          <View style={styles.tagsContainer}>
            <View style={styles.tagObjetivo}>
              <FontAwesome5 name="fire" size={10} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tagText}>{item.usuarios?.preferencias?.objetivo || 'Não definido'}</Text>
            </View>

            {status === "pendente" && (
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
          </View>
        </View>

        <View style={styles.cardActionArea}>
          <View style={[styles.actionIcon, isNovo ? styles.actionIconPrimary : styles.actionIconSecondary]}>
            {isNovo ? (
              <Ionicons name="person-add" size={16} color={theme.colors.backgroundPure} />
            ) : (
              <Ionicons name="chatbubbles" size={16} color={theme.colors.text} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !personal) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />
      
      <LinearGradient colors={[theme.colors.surfaceLight, theme.colors.background]} style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>PAINEL DO TREINADOR</Text>
            <Text style={styles.personalName}>Olá, {personal?.nome?.split(' ')[0] || "Professor"}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("PersonalSetup")} activeOpacity={0.7}>
            <Image source={{ uri: personal?.foto_url || "https://via.placeholder.com/150" }} style={styles.headerAvatar} />
            <View style={styles.settingsOverlay}><Ionicons name="pencil" size={12} color={theme.colors.backgroundPure} /></View>
          </TouchableOpacity>
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
              <MaterialCommunityIcons name="bell-ring" size={22} color={emContato.length > 0 ? theme.colors.danger : theme.colors.textSecondary} />
            </View>
            <Text style={styles.statValue}>{emContato.length}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <Ionicons name="people-circle-outline" size={28} color={theme.colors.textMuted} />
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]} 
            onPress={() => setActiveTab("em_contato")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>
              Novos Leads {emContato.length > 0 && `(${emContato.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]} 
            onPress={() => setActiveTab("aluno_ativo")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>
              Meus Alunos {ativos.length > 0 && `(${ativos.length})`}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === "em_contato" ? emContato : ativos}
          keyExtractor={(item) => item.id}
          renderItem={renderAlunoCard}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name={activeTab === "em_contato" ? "search-outline" : "barbell-outline"} size={36} color={theme.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum registro aqui</Text>
              <Text style={styles.emptyText}>
                {activeTab === "em_contato" 
                  ? "Sua vitrine está online! Quando novos alunos se interessarem pelo seu perfil, eles aparecerão aqui." 
                  : "Você ainda não possui alunos ativos. Feche negócios na aba de 'Novos Leads'."}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },
  
  headerBackground: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingBottom: 70, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: theme.colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 4 },
  personalName: { color: theme.colors.text, fontSize: 28, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  
  settingsBtn: { position: 'relative' },
  headerAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: theme.colors.border },
  settingsOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.surface },
  
  statsWrapper: { paddingHorizontal: 20, marginTop: -45, zIndex: 10 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: theme.colors.surface, borderRadius: 24, paddingVertical: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: theme.colors.borderLight, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  statItem: { flex: 1, alignItems: "center" },
  iconWrapperNeutral: { backgroundColor: theme.colors.surfaceLight, padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperPrimary: { backgroundColor: theme.colors.primaryLight, padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperAlert: { backgroundColor: 'rgba(255,59,48,0.1)', padding: 8, borderRadius: 12, marginBottom: 8 },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: theme.colors.border, marginHorizontal: 2, marginVertical: 10 },

  scrollContent: { padding: 20, paddingBottom: 80 },
  
  crmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 15 },
  sectionTitle: { color: theme.colors.text, fontSize: 22, fontFamily: theme.fonts.title },

  segmentControl: { flexDirection: "row", backgroundColor: theme.colors.surface, borderRadius: 20, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: theme.colors.border },
  segmentBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  segmentBtnActive: { backgroundColor: theme.colors.borderLight },
  segmentText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: theme.colors.text },

  alunoCard: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.surface, padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.borderLight },
  alunoCardNovo: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  alunoCardAtivo: { borderColor: 'rgba(0, 230, 118, 0.3)', backgroundColor: 'rgba(0, 230, 118, 0.03)' },
  
  cardAvatarContainer: { position: "relative" },
  alunoAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.border },
  notificationDot: { position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.danger, borderWidth: 3, borderColor: theme.colors.surface },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.success, borderWidth: 3, borderColor: theme.colors.surface },
  
  cardInfo: { flex: 1, marginLeft: 16 },
  alunoNome: { color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.2 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 },

  infoRowBiometria: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  biometriaItem: { flexDirection: 'row', alignItems: 'center' },
  infoTextBiometria: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4, fontWeight: '600' },
  biometriaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.borderLight, marginHorizontal: 8 },

  tagsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tagObjetivo: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border },
  tagText: { color: theme.colors.textBody, fontSize: 10, fontWeight: "bold", textTransform: 'uppercase' },
  
  tagStatusPrimary: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  tagStatusTextPrimary: { color: theme.colors.backgroundPure, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },

  tagStatusWarning: { backgroundColor: 'rgba(255, 215, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.4)' },
  tagStatusTextWarning: { color: theme.colors.warning, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },

  tagStatusNeutral: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.borderLight },
  tagStatusTextNeutral: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: "800", textTransform: "uppercase" },

  tagStatusSuccess: { backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  tagStatusTextSuccess: { color: theme.colors.success, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },

  cardActionArea: { justifyContent: "center", alignItems: "center", marginLeft: 10 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  actionIconPrimary: { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  actionIconSecondary: { backgroundColor: theme.colors.surfaceLight, borderWidth: 1, borderColor: theme.colors.borderLight },

  emptyState: { alignItems: "center", marginTop: 40, padding: 20 },
  emptyIconBg: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: theme.colors.borderLight },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }
});