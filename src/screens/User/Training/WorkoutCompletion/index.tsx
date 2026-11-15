import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { useFinalizacaoTreino } from "./useWorkoutCompletion";

export function WorkoutCompletion({ route, navigation }: any) {
  const {
    treinoNome,
    tempoTotal,
    seriesResumo,
    maiorCargaTreino,
    resumoExercicios,
    salvando,
    intensidade,
    setIntensidade,
    feedback,
    setFeedback,
    finalizarESalvar
  } = useFinalizacaoTreino(navigation, route);

  const opcoesIntensidade = [
    { label: "Leve", cor: "#4ADE80", icon: "emoticon-happy-outline" },
    { label: "Moderado", cor: "#FBBF24", icon: "emoticon-neutral-outline" },
    { label: "Intenso", cor: "#F97316", icon: "emoticon-sad-outline" },
    { label: "Máximo", cor: "#EF4444", icon: "emoticon-dead-outline" }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.successHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-done" size={40} color="#00E676" />
            </View>
            <Text style={styles.title}>TREINO CONCLUÍDO</Text>
            <Text style={styles.subtitle}>{treinoNome}</Text>
          </View>

          {/* PAINEL DE ESTATÍSTICAS ÚTEIS PARA O ALUNO */}
          <View style={styles.statsContainer}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.08)", "transparent"]} style={styles.statsGradient} />
            
            <View style={styles.statBox}>
              <Ionicons name="timer-outline" size={22} color="#FF6B00" style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{tempoTotal}</Text>
              <Text style={styles.statLabel}>Duração</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <Ionicons name="checkmark-done-circle-outline" size={22} color="#00E676" style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{seriesResumo}</Text>
              <Text style={styles.statLabel}>Séries Feitas</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="dumbbell" size={22} color="#FF6B00" style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{maiorCargaTreino}</Text>
              <Text style={styles.statLabel}>Maior Carga</Text>
            </View>
          </View>

          {/* RESUMO DAS CARGAS & ANOTAÇÕES REGISTRADAS NA SESSÃO */}
          {resumoExercicios && resumoExercicios.length > 0 && (
            <View style={styles.summarySection}>
              <View style={styles.summaryHeaderRow}>
                <Ionicons name="barbell-outline" size={18} color="#FF6B00" style={{ marginRight: 8 }} />
                <Text style={styles.summarySectionTitle}>Resumo de Cargas & Anotações</Text>
              </View>

              <View style={styles.summaryCard}>
                {resumoExercicios.map((item: any, idx: number) => (
                  <View 
                    key={item.id || idx} 
                    style={[
                      styles.summaryItemRow, 
                      idx === resumoExercicios.length - 1 && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }
                    ]}
                  >
                    <View style={styles.summaryItemTop}>
                      <Text style={styles.summaryExName} numberOfLines={1}>{item.nome}</Text>
                      <View style={styles.summaryLoadBadge}>
                        <Text style={styles.summaryLoadBadgeText}>
                          {item.maiorCarga > 0 ? `Máx: ${item.maiorCarga} kg` : `${item.seriesFeitas} séries`}
                        </Text>
                      </View>
                    </View>

                    {item.cargasPorSerieTexto ? (
                      <Text style={styles.summarySeriesDetail}>{item.cargasPorSerieTexto}</Text>
                    ) : null}

                    {item.observacaoAluno ? (
                      <View style={styles.savedNotePill}>
                        <Ionicons name="bookmark" size={12} color="#00E676" style={{ marginRight: 6, marginTop: 1 }} />
                        <Text style={styles.savedNoteText} numberOfLines={2}>
                          Anotação salva: {item.observacaoAluno}
                        </Text>
                      </View>
                    ) : null}

                    {item.relatoDor ? (
                      <View style={styles.painSavedPill}>
                        <Ionicons name="warning" size={12} color="#EF4444" style={{ marginRight: 6 }} />
                        <Text style={styles.painSavedText}>Relato de desconforto enviado ao Personal</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* SEÇÃO MANTIDA 100%: COMO FOI O SEU TREINO + COMENTÁRIO */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>Como foi o seu treino?</Text>
            <Text style={styles.sectionSubtitle}>Selecione a intensidade percebida</Text>

            <View style={styles.intensityRow}>
              {opcoesIntensidade.map((opcao) => {
                const selecionado = intensidade === opcao.label;
                return (
                  <TouchableOpacity 
                    key={opcao.label} 
                    activeOpacity={0.7}
                    style={[
                      styles.intensityBtn, 
                      selecionado && { 
                        backgroundColor: opcao.cor, 
                        borderColor: opcao.cor, 
                        shadowColor: opcao.cor, 
                        elevation: 4, 
                        shadowOpacity: 0.4, 
                        shadowOffset: { width: 0, height: 4 }, 
                        shadowRadius: 8 
                      }
                    ]}
                    onPress={() => setIntensidade(opcao.label)}
                  >
                    <MaterialCommunityIcons 
                      name={opcao.icon as any} 
                      size={26} 
                      color={selecionado ? "#000" : opcao.cor} 
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.intensityText, selecionado && { color: "#000", fontWeight: "900" }]}>
                      {opcao.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Deixe um comentário (Opcional)</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Ex: Treino muito bom, consegui aumentar a carga no supino..."
              placeholderTextColor="#666"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              textAlignVertical="top"
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient colors={["transparent", "#050505"]} style={styles.footerGradient} />
          <TouchableOpacity 
            style={[styles.btnSalvar, salvando && { opacity: 0.7 }]} 
            activeOpacity={0.9} 
            onPress={finalizarESalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.btnSalvarText}>ENVIAR E FINALIZAR</Text>
                <Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}