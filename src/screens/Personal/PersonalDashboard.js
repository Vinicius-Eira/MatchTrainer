import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, ActivityIndicator, ScrollView, StatusBar, Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
        supabase.from("conexoes").select("*, usuarios(*)").eq("personal_id", session.user.id).in("status", ["em_contato", "lead", "aluno_ativo"]),
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

      setEmContato(data.filter((c) => c.status === "em_contato" || c.status === "lead"));
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
    const isNovo = activeTab === "em_contato";

    return (
      <TouchableOpacity 
        style={[styles.alunoCard, isNovo && styles.alunoCardNovo]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("VisaoAluno", { 
          conexaoId: item.id, 
          aluno: item.usuarios, 
          statusAtual: item.status,
          personalInfo: personal 
        })}
      >
        <View style={styles.cardAvatarContainer}>
          <Image source={{ uri: item.usuarios?.foto_url || 'https://via.placeholder.com/150' }} style={styles.alunoAvatar} />
          {temMensagemNaoLida && <View style={styles.notificationDot} />}
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.alunoNome} numberOfLines={1}>{item.usuarios?.nome || 'Novo Aluno'}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={12} color="#888" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.usuarios?.cidade || 'Local não informado'}
            </Text>
          </View>

          <View style={styles.tagsContainer}>
            <View style={styles.tagObjetivo}>
              <Ionicons name="flame" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.tagText}>{item.usuarios?.objetivo || 'Não definido'}</Text>
            </View>
            
            {item.usuarios?.nivel_experiencia && !isNovo && (
              <View style={styles.tagSecundaria}>
                <Ionicons name="barbell-outline" size={12} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.tagTextSecundaria}>{item.usuarios.nivel_experiencia}</Text>
              </View>
            )}

            {isNovo && (
              <View style={styles.tagStatus}>
                <Text style={styles.tagStatusText}>Nova Solicitação</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardActionArea}>
          <View style={[styles.actionIcon, isNovo && styles.actionIconPrimary]}>
            {isNovo ? (
              <Ionicons name="person-add" size={16} color="#000" />
            ) : (
              <Ionicons name="chatbubbles" size={16} color={theme.colors.primary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !personal) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />
      
      <LinearGradient colors={['#1F1F1F', '#070707']} style={styles.headerBackground}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>PAINEL DE CONTROLE</Text>
            <Text style={styles.personalName}>Olá, {personal?.nome?.split(' ')[0] || "Treinador"}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate("PersonalSetup")} activeOpacity={0.7}>
            <Image source={{ uri: personal?.foto_url || "https://via.placeholder.com/150" }} style={styles.headerAvatar} />
            <View style={styles.settingsOverlay}><Ionicons name="pencil" size={12} color="#000" /></View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsWrapper}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.iconWrapperNeutral}>
              <MaterialCommunityIcons name="account-group" size={22} color="#AAA" />
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
              <MaterialCommunityIcons name="bell-ring" size={22} color={emContato.length > 0 ? "#FF3B30" : "#AAA"} />
            </View>
            <Text style={styles.statValue}>{emContato.length}</Text>
            <Text style={styles.statLabel}>Aguardando</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.crmHeader}>
          <Text style={styles.sectionTitle}>Gestão de Alunos</Text>
          <Ionicons name="people-circle-outline" size={28} color="#555" />
        </View>

        <View style={styles.segmentControl}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === "em_contato" && styles.segmentBtnActive]} 
            onPress={() => setActiveTab("em_contato")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "em_contato" && styles.segmentTextActive]}>
              Solicitações {emContato.length > 0 && `(${emContato.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === "aluno_ativo" && styles.segmentBtnActive]} 
            onPress={() => setActiveTab("aluno_ativo")}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === "aluno_ativo" && styles.segmentTextActive]}>
              Alunos Ativos
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
                <Ionicons name="search-outline" size={36} color="#555" />
              </View>
              <Text style={styles.emptyTitle}>Nenhum registro aqui</Text>
              <Text style={styles.emptyText}>Quando novos alunos entrarem em contato, eles aparecerão nesta lista.</Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#070707" },
  
  headerBackground: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 70, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: theme.colors.primary, fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 4 },
  personalName: { color: "#FFF", fontSize: 28, fontFamily: theme.fonts.title, letterSpacing: 0.5 },
  
  settingsBtn: { position: 'relative' },
  headerAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#333' },
  settingsOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F' },
  
  statsWrapper: { paddingHorizontal: 20, marginTop: -45, zIndex: 10 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#121212", borderRadius: 24, paddingVertical: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#262626', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  statItem: { flex: 1, alignItems: "center" },
  iconWrapperNeutral: { backgroundColor: '#1A1A1A', padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperPrimary: { backgroundColor: 'rgba(255,107,0,0.1)', padding: 8, borderRadius: 12, marginBottom: 8 },
  iconWrapperAlert: { backgroundColor: 'rgba(255,59,48,0.1)', padding: 8, borderRadius: 12, marginBottom: 8 },
  statValue: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#888", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginTop: 2, letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: "#222", marginHorizontal: 2, marginVertical: 10 },

  scrollContent: { padding: 20, paddingBottom: 80 },
  
  crmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 15 },
  sectionTitle: { color: "#FFF", fontSize: 22, fontFamily: theme.fonts.title },

  segmentControl: { flexDirection: "row", backgroundColor: "#121212", borderRadius: 20, padding: 6, marginBottom: 24, borderWidth: 1, borderColor: "#222" },
  segmentBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#222" },
  segmentText: { color: "#888", fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: "#FFF" },

  alunoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: "#222" },
  alunoCardNovo: { borderColor: theme.colors.primary, backgroundColor: 'rgba(255,107,0,0.03)' },
  
  cardAvatarContainer: { position: "relative" },
  alunoAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A1A1A' },
  notificationDot: { position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: "#FF3B30", borderWidth: 3, borderColor: "#121212" },
  
  cardInfo: { flex: 1, marginLeft: 16 },
  alunoNome: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginBottom: 4, letterSpacing: 0.2 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { color: '#888', fontSize: 12, marginLeft: 4 },

  tagsContainer: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tagObjetivo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  tagText: { color: '#CCC', fontSize: 11, fontWeight: "bold" },
  
  tagSecundaria: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  tagTextSecundaria: { color: '#888', fontSize: 11, fontWeight: "600" },

  tagStatus: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  tagStatusText: { color: '#000', fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

  cardActionArea: { justifyContent: "center", alignItems: "center", marginLeft: 10 },
  actionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  actionIconPrimary: { backgroundColor: theme.colors.primary },

  emptyState: { alignItems: "center", marginTop: 40, padding: 20 },
  emptyIconBg: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#222' },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  emptyText: { color: "#666", fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }
});