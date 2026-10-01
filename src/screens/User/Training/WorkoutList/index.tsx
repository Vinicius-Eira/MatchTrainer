import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./WorkoutStyles";
import { useWorkoutList } from "./useWorkouts";

export default function WorkoutList({ route, navigation }: any) {
  const { conexaoId } = route.params || { conexaoId: "1" };
  const { loading, refreshing, onRefresh, treinos, openWorkoutList, voltar } = useWorkoutList(navigation, conexaoId);

  const treinoDeHoje = treinos.find(t => t.is_hoje);
  const outrosTreinos = treinos.filter(t => !t.is_hoje);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>MEUS TREINOS</Text>
          <Text style={styles.headerSubtitle}>Seu plano de treinamento</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
        >
          
          {!treinoDeHoje && outrosTreinos.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color="#333" />
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Nenhum treino prescrito</Text>
              <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                Seu personal ainda não disponibilizou sua ficha de treinamentos.
              </Text>
            </View>
          ) : null}

          {treinoDeHoje ? (
            <View style={styles.sectionContainer}>
              <TouchableOpacity style={styles.cardHoje} activeOpacity={0.9} onPress={() => openWorkoutList(treinoDeHoje.id)}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.0)"]} style={styles.cardGradientBg} />
                
                <View style={styles.cardHojeTop}>
                  <View style={styles.badgeHoje}>
                    <Ionicons name="flame" size={12} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.badgeHojeText}>TREINO DE HOJE</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDotGreen} />
                    <Text style={styles.statusPillText}>{treinoDeHoje.status}</Text>
                  </View>
                </View>

                <Text style={styles.cardTitleHoje}>{treinoDeHoje.nome}</Text>
                <Text style={styles.cardObjetivoHoje}>{treinoDeHoje.objetivo}</Text>

                <View style={styles.infoGridHoje}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="dumbbell" size={16} color="#FF6B00" />
                    <Text style={styles.infoText}>{treinoDeHoje.qtd_exercicios} exercícios</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="layers-outline" size={16} color="#FF6B00" />
                    <Text style={styles.infoText}>{treinoDeHoje.qtd_series} séries</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#FF6B00" />
                    <Text style={styles.infoText}>~ {treinoDeHoje.duracao_estimada}</Text>
                  </View>
                </View>

                <View style={styles.btnIniciarHoje}>
                  <Text style={styles.btnIniciarHojeText}>VER TREINO</Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {outrosTreinos.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Todos os Treinos</Text>
              
              {outrosTreinos.map((treino) => (
                <TouchableOpacity key={treino.id} style={styles.cardNormal} activeOpacity={0.8} onPress={() => openWorkoutList(treino.id)}>
                  
                  <View style={styles.cardNormalTop}>
                    <Text style={styles.cardNormalTitle}>{treino.nome}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FF6B00" />
                  </View>
                  
                  <Text style={styles.cardNormalObjetivo}>{treino.objetivo}</Text>
                  
                  <View style={styles.cardNormalStats}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{treino.qtd_exercicios}</Text>
                      <Text style={styles.statLabel}>Exer.</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{treino.qtd_series}</Text>
                      <Text style={styles.statLabel}>Séries</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{treino.duracao_estimada}</Text>
                      <Text style={styles.statLabel}>Tempo</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardNormalFooter}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={14} color="#666" style={{ marginRight: 6 }} />
                      <Text style={styles.footerLabel}>Última execução: <Text style={styles.footerValue}>{treino.ultima_execucao || "Nunca"}</Text></Text>
                    </View>
                  </View>

                </TouchableOpacity>
              ))}
            </View>
          ) : null}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}