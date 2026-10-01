import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, RefreshControl, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./workoutPreviewStyles";
import { useWorkoutPreview } from "./useWorkoutPreview";

export default function WorkoutPreview({ route, navigation }: any) {
  const { loading, refreshing, onRefresh, treino, exercicios, iniciarTreino, voltar } = useWorkoutPreview(navigation, route);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!treino) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TREINO DE HOJE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
      >
        
        <View style={styles.heroSection}>
          <View style={styles.badgeTreinoHoje}>
            <FontAwesome5 name="fire-alt" size={12} color="#FF6B00" />
            <Text style={styles.badgeTreinoHojeText}>FOCO DO DIA</Text>
          </View>
          
          <Text style={styles.treinoTitle}>{treino.nome}</Text>
          
          <View style={styles.treinoObjetivoBox}>
            <MaterialCommunityIcons name="target" size={16} color="#AAA" />
            <Text style={styles.treinoObjetivo}>{treino.objetivo}</Text>
          </View>

          {treino.observacao_geral && (
            <View style={styles.obsGeralBox}>
              <Text style={styles.obsGeralText}>{treino.observacao_geral}</Text>
            </View>
          )}
          
          <View style={styles.macroStatsContainer}>
            <View style={styles.macroStat}>
              <Text style={styles.macroStatValue}>{exercicios.length}</Text>
              <Text style={styles.macroStatLabel}>Exercícios</Text>
            </View>
            <View style={styles.macroStatDivider} />
            <View style={styles.macroStat}>
              <Text style={styles.macroStatValue}>{treino.total_series}</Text>
              <Text style={styles.macroStatLabel}>Séries</Text>
            </View>
            <View style={styles.macroStatDivider} />
            <View style={styles.macroStat}>
              <Text style={styles.macroStatValue}>{treino.duracao}</Text>
              <Text style={styles.macroStatLabel}>Estimado</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Plano de Execução</Text>
        
        <View style={styles.listaContainer}>
          {exercicios.map((ex, index) => (
            <View key={ex.id} style={styles.exercicioCard}>
              
              <View style={styles.exercicioRow}>
                <View style={styles.videoContainer}>
                  {ex.imagem_url ? (
                    <Image source={{ uri: ex.imagem_url }} style={styles.videoThumbnail} />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <MaterialCommunityIcons name="weight-lifter" size={32} color="#444" />
                    </View>
                  )}
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 3 }} />
                  </View>
                </View>

                <View style={styles.exercicioMainInfo}>
                  <View>
                    <Text style={styles.exercicioNome} numberOfLines={2}>{ex.nome}</Text>
                    {ex.grupo_muscular && (
                      <Text style={styles.grupoMuscularText}>{ex.grupo_muscular}</Text>
                    )}
                  </View>

                  <View style={styles.premiumMetricsBlock}>
                    <View style={styles.premiumMetricRow}>
                      <Text style={styles.premiumMetricLabel}>Séries / Reps</Text>
                      <Text style={styles.premiumMetricValue}>{ex.series} <Text style={styles.metricSubText}>×</Text> {ex.reps_alvo}</Text>
                    </View>

                    <View style={styles.premiumMetricRowHighlight}>
                      <Text style={styles.premiumMetricLabelDestaque}>Carga Alvo</Text>
                      <Text style={styles.premiumMetricValueDestaque}>{ex.carga_alvo || '--'}</Text>
                    </View>

                    <View style={styles.premiumMetricRow}>
                      <Text style={styles.premiumMetricLabel}>Descanso</Text>
                      <Text style={styles.premiumMetricValue}>{ex.descanso}<Text style={styles.metricSubText}>s</Text></Text>
                    </View>
                  </View>
                </View>
              </View>

              {ex.observacao ? (
                <View style={styles.trainerNoteBox}>
                  <View style={styles.trainerNoteIcon}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trainerNoteTitle}>Observação do Personal</Text>
                    <Text style={styles.trainerNoteText}>{ex.observacao}</Text>
                  </View>
                </View>
              ) : null}

            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footerFixo}>
        <LinearGradient colors={["transparent", "rgba(5,5,5,0.9)", "#050505"]} style={styles.footerGradient} />
        <TouchableOpacity style={styles.btnIniciar} activeOpacity={0.9} onPress={iniciarTreino}>
          <Text style={styles.btnIniciarText}>INICIAR TREINO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}