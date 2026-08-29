import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
  RefreshControl
} from "react-native";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../../services/supabase";
import { theme } from "../../../../theme/theme";
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive";

export default function ListaTreinosAluno({ route, navigation }) {
  const { alunoId, alunoNome } = route.params;
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarTreinos = async () => {
    try {
      const { data, error } = await supabase
        .from("training_programs")
        .select("*")
        .eq("student_id", alunoId)
        .eq("is_template", false)
        .neq("status", "arquivado") 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTreinos(data || []);
    } catch (error) {
      console.log("Erro ao buscar treinos:", error);
      Alert.alert("Erro", "Não foi possível carregar as fichas deste aluno.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = navigation.addListener("focus", () => {
      carregarTreinos();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarTreinos();
  };

  const arquivarTreino = (id) => {
    Alert.alert(
      "Arquivar Ficha",
      "Deseja remover esta ficha da lista principal? Ela ficará salva no Histórico do aluno.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Arquivar", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from("training_programs")
              .update({ status: "arquivado" })
              .eq("id", id);
            
            if (error) {
              Alert.alert("Erro", "Falha ao arquivar a ficha.");
              setLoading(false);
            } else {
              carregarTreinos();
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const dataCriacao = item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "--";

    return (
      <TouchableOpacity 
        style={styles.cardTreino} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate("WorkoutCreator", { programIdToEdit: item.id, alunoId, alunoNome })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBg}>
            <FontAwesome5 name="clipboard-list" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.treinoTitle} numberOfLines={1}>{item.name || "Ficha de Treino"}</Text>
            <Text style={styles.treinoObjective} numberOfLines={1}>
              {item.objective ? `Foco: ${item.objective}` : "Treinamento Geral"}
            </Text>
          </View>
          <View style={styles.btnEditarIcon}>
            <Feather name="edit-2" size={18} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.dateWrapper}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.treinoDate}>Criado em {dataCriacao}</Text>
          </View>

          <TouchableOpacity 
            style={styles.btnArquivar} 
            activeOpacity={0.7}
            onPress={() => arquivarTreino(item.id)}
          >
            <Feather name="archive" size={14} color={theme.colors.primary} />
            <Text style={styles.btnArquivarText}>Arquivar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Gradiente super suave para não ofuscar o restante da tela */}
      <LinearGradient 
        colors={["rgba(255,107,0,0.04)", theme.colors.background, theme.colors.background]} 
        style={StyleSheet.absoluteFillObject} 
      />

      <BlurView intensity={Platform.OS === "ios" ? 70 : 100} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTextCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{alunoNome?.split(' ')[0]}</Text>
          <Text style={styles.headerSubtitle}>Fichas de Treino</Text>
        </View>
        
        <View style={{ width: scale(40) }} /> 
      </BlurView>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="documents-outline" size={40} color={theme.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma ficha ativa</Text>
              <Text style={styles.emptyText}>
                O aluno {alunoNome?.split(' ')[0]} não possui treinos em andamento no momento.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB - Floating Action Button Premium */}
      <View style={styles.floatingActionBar}>
        <TouchableOpacity 
          style={styles.btnPrimary} 
          onPress={() => navigation.navigate("WorkoutCreator", { alunoId, alunoNome })}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={24} color="#000" />
          <Text style={styles.btnPrimaryText}>Montar Nova Ficha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: scale(20), paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(50), paddingBottom: verticalScale(15), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  iconButton: { width: scale(40), height: scale(40), borderRadius: moderateScale(20), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  headerTextCenter: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: scale(10) },
  headerTitle: { color: theme.colors.text, fontSize: moderateScale(18), fontWeight: "900", letterSpacing: 0.5 },
  headerSubtitle: { color: theme.colors.primary, fontSize: moderateScale(10), fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.5, marginTop: verticalScale(2) },
  
  listContent: { padding: scale(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(120) },
  
  cardTreino: { 
    backgroundColor: "#18181B", 
    borderRadius: moderateScale(16), 
    padding: scale(16), 
    marginBottom: verticalScale(16), 
    borderWidth: 1, 
    borderColor: "rgba(255, 107, 0, 0.4)", 
    shadowColor: theme.colors.primary, 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5 
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconBg: { width: scale(48), height: scale(48), borderRadius: moderateScale(14), backgroundColor: "rgba(255,107,0,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  cardInfo: { flex: 1, marginLeft: scale(12), paddingRight: scale(10) },
  treinoTitle: { color: theme.colors.text, fontSize: moderateScale(16), fontWeight: "900", marginBottom: verticalScale(2) },
  treinoObjective: { color: theme.colors.textSecondary, fontSize: moderateScale(13), fontWeight: "500" },
  btnEditarIcon: { width: scale(36), height: scale(36), borderRadius: moderateScale(12), backgroundColor: "rgba(255,107,0,0.08)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  
  cardDivider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.06)", marginVertical: verticalScale(14) },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateWrapper: { flexDirection: "row", alignItems: "center", gap: scale(6) },
  treinoDate: { color: theme.colors.textSecondary, fontSize: moderateScale(11), fontWeight: "600" },
  
  btnArquivar: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: scale(6), 
    paddingHorizontal: scale(12), 
    paddingVertical: verticalScale(6), 
    borderRadius: moderateScale(8), 
    backgroundColor: "rgba(255,107,0,0.1)", 
    borderWidth: 1, 
    borderColor: "rgba(255, 107, 0, 0.4)" 
  },
  btnArquivarText: { color: theme.colors.primary, fontSize: moderateScale(11), fontWeight: "900", textTransform: "uppercase" },

  emptyState: { alignItems: "center", marginTop: verticalScale(80) },
  emptyIconBg: { width: scale(88), height: scale(88), borderRadius: moderateScale(44), backgroundColor: theme.colors.surface, justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20), borderWidth: 1, borderColor: theme.colors.borderLight },
  emptyTitle: { color: theme.colors.text, fontSize: moderateScale(20), fontWeight: "bold", marginBottom: verticalScale(10) },
  emptyText: { color: theme.colors.textSecondary, fontSize: moderateScale(14), textAlign: "center", paddingHorizontal: scale(20), lineHeight: moderateScale(22) },
  
  floatingActionBar: { position: "absolute", bottom: Platform.OS === "ios" ? verticalScale(35) : verticalScale(25), left: scale(20), right: scale(20), backgroundColor: "#000", borderRadius: moderateScale(20), padding: scale(10), borderWidth: 1, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  btnPrimary: { flexDirection: "row", backgroundColor: theme.colors.primary, height: verticalScale(56), borderRadius: moderateScale(14), justifyContent: "center", alignItems: "center", gap: scale(10) },
  btnPrimaryText: { color: "#000", fontSize: moderateScale(16), fontWeight: "900", textTransform: "uppercase" },
});