import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./ProgressStyles";
import { useProgress } from "./useProgress";

export default function Progress({ route, navigation }: any) {
  const { conexaoId } = route?.params || {};
  const { loading, mensagemPersonal, composicaoCorporal, resumoTreinos, recordes, historico, abrirEvolucaoExercicio, voltar } = useProgress(navigation, conexaoId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EVOLUÇÃO</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* RECADO DO PERSONAL SEMPRE VISÍVEL */}
          <View style={styles.coachCardWrapper}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={styles.absoluteFill} />
            <View style={styles.coachHeader}>
                <View style={styles.coachTitleRow}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#FF6B00" />
                    <Text style={styles.coachTitle}>Recado do Personal</Text>
                </View>
                <Text style={styles.coachDate}>{mensagemPersonal.data}</Text>
            </View>
            <Text style={[styles.coachMessage, !mensagemPersonal.temRecado && { color: "#888", fontStyle: "normal" }]}>
                {mensagemPersonal.texto}
            </Text>
          </View>

          {/* COMPOSIÇÃO CORPORAL */}
          <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Composição Corporal</Text>
                  <Text style={styles.sectionHint}>Ref: {composicaoCorporal.dataAvaliacao}</Text>
              </View>
              
              <View style={styles.bioGrid}>
                  {composicaoCorporal.metricas.map((metrica: any, index: number) => (
                      <View key={index} style={styles.bioCard}>
                          <Text style={styles.bioLabel}>{metrica.nome}</Text>
                          <Text style={styles.bioValue}>{metrica.atual}</Text>
                          <View style={[styles.bioDiffBadge, metrica.evolucaoBoa ? styles.bioDiffGood : styles.bioDiffNeutral]}>
                              <Ionicons 
                                  name={String(metrica.diferenca).includes('-') ? "arrow-down" : (metrica.diferenca === "-" ? "remove" : "arrow-up")} 
                                  size={10} 
                                  color={metrica.evolucaoBoa ? "#00E676" : "#888"} 
                              />
                              <Text style={[styles.bioDiffText, metrica.evolucaoBoa && { color: "#00E676" }]}>
                                  {metrica.diferenca}
                              </Text>
                          </View>
                      </View>
                  ))}
              </View>
          </View>

          {/* RESUMO DE TREINOS */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo de Treinos</Text>
              <View style={styles.resumoGrid}>
                  <View style={styles.resumoItem}>
                      <Text style={styles.resumoValor}>{resumoTreinos.concluidos}</Text>
                      <Text style={styles.resumoLabel}>Treinos Feitos</Text>
                  </View>
                  <View style={styles.resumoDivider} />
                  <View style={styles.resumoItem}>
                      <Text style={styles.resumoValor}>{resumoTreinos.volume}<Text style={styles.resumoUnidade}> kg</Text></Text>
                      <Text style={styles.resumoLabel}>Volume Total</Text>
                  </View>
                  <View style={styles.resumoDivider} />
                  <View style={styles.resumoItem}>
                      <Text style={styles.resumoValor}>{resumoTreinos.tempo}</Text>
                      <Text style={styles.resumoLabel}>Tempo Total</Text>
                  </View>
              </View>
          </View>

          {/* RECORDES (PR) COM EMPTY STATE */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recordes (PR)</Text>
              <View style={styles.listContainer}>
                  {recordes.length > 0 ? (
                      recordes.map((pr: any) => (
                          <TouchableOpacity key={pr.id} style={styles.prCard} activeOpacity={0.8} onPress={() => abrirEvolucaoExercicio(pr.exercicio)}>
                              <View style={styles.prInfo}>
                                  <Text style={styles.prName}>{pr.exercicio}</Text>
                                  <Text style={styles.prDate}>{pr.data}</Text>
                              </View>
                              <View style={styles.prWeightBadge}>
                                  <Text style={styles.prWeightText}>{pr.carga}</Text>
                              </View>
                          </TouchableOpacity>
                      ))
                  ) : (
                      <View style={{ padding: 20, backgroundColor: "#0A0A0A", borderRadius: 12, borderWidth: 1, borderColor: "#151515", alignItems: "center" }}>
                          <FontAwesome5 name="medal" size={28} color="#333" style={{ marginBottom: 10 }} />
                          <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                              Nenhum recorde alcançado ainda.{'\n'}Continue treinando pesado para registrar suas marcas!
                          </Text>
                      </View>
                  )}
              </View>
          </View>

          {/* ÚLTIMOS TREINOS COM EMPTY STATE */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Últimos Treinos</Text>
              <View style={styles.listContainer}>
                  {historico.length > 0 ? (
                      historico.map((hist: any) => (
                          <View key={hist.id} style={styles.historyCard}>
                              <View style={styles.historyHeader}>
                                  <Text style={styles.historyTitle}>{hist.treino}</Text>
                                  <Text style={styles.historyDate}>{hist.data}</Text>
                              </View>
                              <View style={styles.historyMetricsRow}>
                                  <View style={styles.historyMetric}>
                                      <Ionicons name="time-outline" size={14} color="#888" />
                                      <Text style={styles.historyMetricText}>{hist.duracao}</Text>
                                  </View>
                                  <View style={styles.historyMetric}>
                                      <MaterialCommunityIcons name="weight-kilogram" size={14} color="#888" />
                                      <Text style={styles.historyMetricText}>{hist.volume}</Text>
                                  </View>
                              </View>
                          </View>
                      ))
                  ) : (
                      <View style={{ padding: 20, backgroundColor: "#0A0A0A", borderRadius: 12, borderWidth: 1, borderColor: "#151515", alignItems: "center" }}>
                          <Ionicons name="barbell-outline" size={32} color="#333" style={{ marginBottom: 10 }} />
                          <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                              Você ainda não possui treinos concluídos.{'\n'}Seu histórico aparecerá aqui.
                          </Text>
                      </View>
                  )}
              </View>
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}