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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { supabase } from "../../../../services/supabase";
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive";

const MATCH_COLORS = {
  primary: '#FF5100',
  surface: '#161619',
  surfaceDark: '#0D0D0F',
  border: '#2A2A32',
  borderLight: '#3A3A42',
  text: '#FFFFFF',
  textMuted: '#A0A0A5',
  textDim: '#555555',
  danger: '#FF3B30',
  dangerGlow: 'rgba(255, 59, 48, 0.1)',
  success: '#00E676',
  successGlow: 'rgba(0, 230, 118, 0.1)'
};

interface Treino {
  id: string;
  name: string;
  objective: string;
  created_at: string;
  status: string;
}

export default function HistoricoTreinosAluno({ route, navigation }: any) {
  const { alunoId, alunoNome } = route.params;
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from("training_programs")
        .select("*")
        .eq("student_id", alunoId)
        .eq("status", "arquivado")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTreinos(data || []);
    } catch (error) {
      console.log("Erro ao buscar histórico:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico de fichas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = navigation.addListener("focus", () => {
      carregarHistorico();
    });
    return unsubscribe;
  }, [navigation, alunoId]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarHistorico();
  };

  const restaurarTreino = (id: string) => {
    Alert.alert(
      "Restaurar Ficha",
      "Deseja voltar esta ficha para a lista de treinos ativos do aluno?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Restaurar", 
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from("training_programs")
              .update({ status: "ativo" }) 
              .eq("id", id);
            
            if (error) {
              Alert.alert("Erro", "Falha ao restaurar a ficha.");
              setLoading(false);
            } else {
              Alert.alert("Sucesso", "Ficha restaurada para os treinos ativos.");
              carregarHistorico();
            }
          } 
        }
      ]
    );
  };

  const deletarDefinitivamente = (id: string) => {
    Alert.alert(
      "Excluir Permanentemente",
      "Tem certeza? Esta ação apagará a ficha do banco de dados definitivamente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from("training_programs")
              .delete()
              .eq("id", id);
            
            if (error) {
              Alert.alert("Erro", "Falha ao excluir a ficha.");
              setLoading(false);
            } else {
              carregarHistorico();
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Treino }) => {
    const dataCriacao = item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "--";

    return (
      <TouchableOpacity 
        style={styles.cardTreino} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate("WorkoutCreator", { programIdToEdit: item.id, alunoId, alunoNome })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconGlowBox}>
            <Feather name="archive" size={20} color={MATCH_COLORS.textMuted} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.treinoTitle} numberOfLines={1}>{item.name || "Ficha Arquivada"}</Text>
            <Text style={styles.treinoObjective} numberOfLines={1}>
              {item.objective ? item.objective.toUpperCase() : "TREINAMENTO GERAL"}
            </Text>
          </View>
          <View style={styles.btnEditarIcon}>
            <Feather name="chevron-right" size={20} color={MATCH_COLORS.textDim} />
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.dateWrapper}>
            <Feather name="calendar" size={14} color={MATCH_COLORS.textMuted} />
            <Text style={styles.treinoDate}>Arquivada de: {dataCriacao}</Text>
          </View>

          <View style={styles.footerActions}>
            <TouchableOpacity 
              style={styles.btnRestaurar} 
              activeOpacity={0.6}
              onPress={() => restaurarTreino(item.id)}
            >
              <Feather name="refresh-ccw" size={14} color={MATCH_COLORS.success} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnDeletar} 
              activeOpacity={0.6}
              onPress={() => deletarDefinitivamente(item.id)}
            >
              <Feather name="trash-2" size={16} color={MATCH_COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: MATCH_COLORS.surfaceDark }]} />

      <BlurView intensity={Platform.OS === "ios" ? 40 : 100} tint="dark" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={MATCH_COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTextCenter}>
          <Text style={styles.headerSubtitle}>HISTÓRICO ARQUIVADO</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{alunoNome}</Text>
        </View>
        
        <View style={{ width: scale(40) }} /> 
      </BlurView>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={MATCH_COLORS.primary} />
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
              tintColor={MATCH_COLORS.primary}
              colors={[MATCH_COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Feather name="inbox" size={38} color={MATCH_COLORS.textDim} />
              </View>
              <Text style={styles.emptyTitle}>Arquivo Vazio</Text>
              <Text style={styles.emptyText}>
                Nenhuma ficha foi arquivada para este aluno ainda.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MATCH_COLORS.surfaceDark },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: scale(20), paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(50), paddingBottom: verticalScale(16), borderBottomWidth: 1, borderColor: MATCH_COLORS.border, backgroundColor: 'rgba(13, 13, 15, 0.85)' },
  iconButton: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: MATCH_COLORS.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: MATCH_COLORS.border },
  headerTextCenter: { alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: scale(10) },
  headerSubtitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(10), fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: verticalScale(2) },
  headerTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(16), fontWeight: "800", letterSpacing: 0.5 },
  listContent: { padding: scale(20), paddingTop: verticalScale(24), paddingBottom: verticalScale(40) },
  
  cardTreino: { backgroundColor: MATCH_COLORS.surface, borderRadius: moderateScale(20), padding: scale(20), marginBottom: verticalScale(16), borderWidth: 1, borderColor: MATCH_COLORS.border, borderStyle: 'dashed' },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconGlowBox: { width: scale(48), height: scale(48), borderRadius: moderateScale(14), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: MATCH_COLORS.borderLight },
  cardInfo: { flex: 1, marginLeft: scale(16), paddingRight: scale(10) },
  treinoTitle: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(16), fontWeight: "900", marginBottom: verticalScale(4), letterSpacing: 0.3 },
  treinoObjective: { color: MATCH_COLORS.textDim, fontSize: moderateScale(11), fontWeight: "700", letterSpacing: 0.5 },
  btnEditarIcon: { width: scale(32), height: scale(32), justifyContent: "center", alignItems: "flex-end" },
  cardDivider: { height: 1, backgroundColor: MATCH_COLORS.border, marginVertical: verticalScale(16) },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateWrapper: { flexDirection: "row", alignItems: "center", gap: scale(8) },
  treinoDate: { color: MATCH_COLORS.textDim, fontSize: moderateScale(12), fontWeight: "600" },
  
  footerActions: { flexDirection: "row", gap: scale(8) },
  btnRestaurar: { justifyContent: "center", alignItems: "center", paddingHorizontal: scale(14), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), backgroundColor: MATCH_COLORS.successGlow, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  btnDeletar: { justifyContent: "center", alignItems: "center", paddingHorizontal: scale(14), paddingVertical: verticalScale(8), borderRadius: moderateScale(12), backgroundColor: MATCH_COLORS.dangerGlow, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },

  emptyState: { alignItems: "center", marginTop: verticalScale(80) },
  emptyIconBg: { width: scale(72), height: scale(72), borderRadius: moderateScale(24), backgroundColor: MATCH_COLORS.surface, justifyContent: "center", alignItems: "center", marginBottom: verticalScale(20), borderWidth: 1, borderColor: MATCH_COLORS.borderLight },
  emptyTitle: { color: MATCH_COLORS.text, fontSize: moderateScale(18), fontWeight: "900", marginBottom: verticalScale(8) },
  emptyText: { color: MATCH_COLORS.textMuted, fontSize: moderateScale(14), textAlign: "center", paddingHorizontal: scale(30), lineHeight: moderateScale(22) },
});