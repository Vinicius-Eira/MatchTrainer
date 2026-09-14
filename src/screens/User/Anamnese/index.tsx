import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./AnamneseStyles";
import { useAnamnese } from "./useAnamnese";

export default function Anamnese({ navigation }: any) {
  const { loading, temPendente, pendente, historico, abrirQuestionario, voltar } = useAnamnese(navigation);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={voltar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ANAMNESE & CHECK-IN</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ação Necessária</Text>
              
              {temPendente ? (
                  <View style={styles.pendingCard}>
                      <View style={styles.pendingHeader}>
                          <View style={styles.pendingTitleRow}>
                              <Ionicons name="alert-circle" size={20} color="#FF6B00" />
                              <Text style={styles.pendingTitle}>{pendente.titulo}</Text>
                          </View>
                          <View style={styles.badgeNew}>
                              <Text style={styles.badgeNewText}>NOVO</Text>
                          </View>
                      </View>
                      
                      <Text style={styles.pendingDesc}>{pendente.descricao}</Text>
                      
                      <View style={styles.pendingMetaRow}>
                          <Text style={styles.pendingMetaText}>
                              <Feather name="list" size={12} /> {pendente.qtdPerguntas} perguntas
                          </Text>
                          <Text style={styles.pendingMetaText}>Enviado {pendente.dataEnvio.toLowerCase()}</Text>
                      </View>

                      <TouchableOpacity 
                          style={styles.btnRespond} 
                          activeOpacity={0.8} 
                          onPress={() => abrirQuestionario(pendente.id, pendente.titulo)}
                      >
                          <Text style={styles.btnRespondText}>RESPONDER AGORA</Text>
                          <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                  </View>
              ) : (
                  <LinearGradient 
                      colors={["#0A0A0A", "#111111"]} 
                      style={{
                          padding: 24,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: "rgba(0, 230, 118, 0.2)",
                          alignItems: "center",
                          marginTop: 10,
                          shadowColor: "#00E676",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.1,
                          shadowRadius: 12,
                          elevation: 3
                      }}
                  >
                      <View style={{
                          width: 64, 
                          height: 64, 
                          borderRadius: 32, 
                          backgroundColor: "rgba(0, 230, 118, 0.1)", 
                          justifyContent: "center", 
                          alignItems: "center",
                          marginBottom: 16,
                          borderWidth: 1,
                          borderColor: "rgba(0, 230, 118, 0.3)"
                      }}>
                          <Ionicons name="checkmark-done" size={32} color="#00E676" />
                      </View>
                      <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "900", marginBottom: 8 }}>Tudo em dia!</Text>
                      <Text style={{ color: "#888", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                          Você não possui nenhum check-in pendente no momento.{'\n'}Foque nos seus treinos e dieta!
                      </Text>
                  </LinearGradient>
              )}
          </View>

          
          {historico.length > 0 && (
              <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Histórico de Respostas</Text>
                  
                  <View style={styles.historyList}>
                      {historico.map((item: any) => (
                          <View key={item.id} style={styles.historyCard}>
                              <View style={styles.historyIconBox}>
                                  <Ionicons name="document-text-outline" size={20} color="#888" />
                              </View>
                              
                              <View style={styles.historyInfo}>
                                  <Text style={styles.historyName}>{item.titulo}</Text>
                                  <Text style={styles.historyDate}>Respondido em {item.dataResposta}</Text>
                              </View>
                              
                              <View style={styles.historyStatusBadge}>
                                  <Ionicons name="checkmark" size={12} color="#00E676" />
                                  <Text style={styles.historyStatusText}>{item.status}</Text>
                              </View>
                          </View>
                      ))}
                  </View>
              </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}