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
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../../../services/supabase";
import { theme } from "../../../../theme/theme"; // Mantido para outras props se precisar
import { scale, verticalScale, moderateScale } from "../../../../utils/responsive";

const MATCH_COLORS = {
  primary: '#FF5100',
  primaryGlow: 'rgba(255, 81, 0, 0.15)',
  surface: '#161619',
  surfaceDark: '#0D0D0F',
  border: '#2A2A32',
  borderLight: '#3A3A42',
  text: '#FFFFFF',
  textMuted: '#A0A0A5',
  textDim: '#555555',
  danger: '#FF3B30',
  dangerGlow: 'rgba(255, 59, 48, 0.1)'
};

interface Treino {
  id: string;
  name: string;
  objective: string;
  created_at: string;
  status: string;
}

interface ListaTreinosAlunoProps {
  route: {
    params: {
      alunoId: string;
      alunoNome: string;
    };
  };
  navigation: any;
}

export default function ListaTreinosAluno({ route, navigation }: ListaTreinosAlunoProps) {
  const { alunoId, alunoNome } = route.params;
  const [treinos, setTreinos] = useState<Treino[]>([]);
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
  }, [navigation, alunoId]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarTreinos();
  };

  const arquivarTreino = (id: string) => {
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
            <MaterialCommunityIcons name="dumbbell" size={22} color={MATCH_COLORS.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.treinoTitle} numberOfLines={1}>{item.name || "Ficha de Treino"}</Text>
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
            <Text style={styles.treinoDate}>{dataCriacao}</Text>
          </View>

          <TouchableOpacity 
            style={styles.btnArquivar} 
            activeOpacity={0.6}
            onPress={() => arquivarTreino(item.id)}
          >
            <Feather name="archive" size={14} color={MATCH_COLORS.textMuted} />
            <Text style={styles.btnArquivarText}>Arquivar</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerSubtitle}>GERENCIAR ALUNO</Text>
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
                <MaterialCommunityIcons name="text-box-remove-outline" size={38} color={MATCH_COLORS.textDim} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma Ficha Ativa</Text>
              <Text style={styles.emptyText}>
                O campo está livre. Crie o primeiro planejamento para iniciar a evolução do aluno.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.floatingContainer}>
        <TouchableOpacity 
          style={styles.btnPrimary} 
          onPress={() => navigation.navigate("WorkoutCreator", { alunoId, alunoNome })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[MATCH_COLORS.primary, '#E64900']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnGradient}
          >
            <Feather name="plus" size={22} color="#000" />
            <Text style={styles.btnPrimaryText}>CRIAR NOVA FICHA</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: MATCH_COLORS.surfaceDark 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: scale(20), 
    paddingTop: Platform.OS === "ios" ? verticalScale(60) : verticalScale(50), 
    paddingBottom: verticalScale(16), 
    borderBottomWidth: 1, 
    borderColor: MATCH_COLORS.border,
    backgroundColor: 'rgba(13, 13, 15, 0.85)'
  },
  iconButton: { 
    width: scale(40), 
    height: scale(40), 
    borderRadius: moderateScale(12), 
    backgroundColor: MATCH_COLORS.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.border 
  },
  headerTextCenter: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1, 
    paddingHorizontal: scale(10) 
  },
  headerSubtitle: { 
    color: MATCH_COLORS.primary, 
    fontSize: moderateScale(10), 
    fontWeight: "800", 
    textTransform: "uppercase", 
    letterSpacing: 1.5, 
    marginBottom: verticalScale(2) 
  },
  headerTitle: { 
    color: MATCH_COLORS.text, 
    fontSize: moderateScale(16), 
    fontWeight: "800", 
    letterSpacing: 0.5 
  },
  
  listContent: { 
    padding: scale(20), 
    paddingTop: verticalScale(24), 
    paddingBottom: verticalScale(140) 
  },
  
  cardTreino: { 
    backgroundColor: MATCH_COLORS.surface, 
    borderRadius: moderateScale(20), 
    padding: scale(20), 
    marginBottom: verticalScale(16), 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  iconGlowBox: { 
    width: scale(48), 
    height: scale(48), 
    borderRadius: moderateScale(14), 
    backgroundColor: MATCH_COLORS.primaryGlow, 
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 81, 0, 0.3)'
  },
  cardInfo: { 
    flex: 1, 
    marginLeft: scale(16), 
    paddingRight: scale(10) 
  },
  treinoTitle: { 
    color: MATCH_COLORS.text, 
    fontSize: moderateScale(16), 
    fontWeight: "900", 
    marginBottom: verticalScale(4),
    letterSpacing: 0.3
  },
  treinoObjective: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(11), 
    fontWeight: "700",
    letterSpacing: 0.5
  },
  btnEditarIcon: { 
    width: scale(32), 
    height: scale(32), 
    justifyContent: "center", 
    alignItems: "flex-end" 
  },
  
  cardDivider: { 
    height: 1, 
    backgroundColor: MATCH_COLORS.border, 
    marginVertical: verticalScale(16) 
  },
  
  cardFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  dateWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: scale(8) 
  },
  treinoDate: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(12), 
    fontWeight: "600" 
  },
  
  btnArquivar: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: scale(6), 
    paddingHorizontal: scale(14), 
    paddingVertical: verticalScale(8), 
    borderRadius: moderateScale(12), 
    backgroundColor: MATCH_COLORS.surfaceDark, 
    borderWidth: 1,
    borderColor: MATCH_COLORS.border
  },
  btnArquivarText: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(12), 
    fontWeight: "700" 
  },

  emptyState: { 
    alignItems: "center", 
    marginTop: verticalScale(80) 
  },
  emptyIconBg: { 
    width: scale(72), 
    height: scale(72), 
    borderRadius: moderateScale(24), 
    backgroundColor: MATCH_COLORS.surface, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: verticalScale(20), 
    borderWidth: 1, 
    borderColor: MATCH_COLORS.borderLight 
  },
  emptyTitle: { 
    color: MATCH_COLORS.text, 
    fontSize: moderateScale(18), 
    fontWeight: "900", 
    marginBottom: verticalScale(8) 
  },
  emptyText: { 
    color: MATCH_COLORS.textMuted, 
    fontSize: moderateScale(14), 
    textAlign: "center", 
    paddingHorizontal: scale(30), 
    lineHeight: moderateScale(22) 
  },
  
  floatingContainer: { 
    position: "absolute", 
    bottom: Platform.OS === "ios" ? verticalScale(40) : verticalScale(30), 
    left: scale(20), 
    right: scale(20), 
    shadowColor: MATCH_COLORS.primary, 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 10 
  },
  btnPrimary: { 
    borderRadius: moderateScale(16), 
    overflow: 'hidden' 
  },
  btnGradient: { 
    flexDirection: "row", 
    height: verticalScale(56), 
    justifyContent: "center", 
    alignItems: "center", 
    gap: scale(8) 
  },
  btnPrimaryText: { 
    color: "#000", 
    fontSize: moderateScale(14), 
    fontWeight: "900", 
    textTransform: "uppercase", 
    letterSpacing: 0.8 
  },
});