import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { useFinalizacaoTreino } from "./useWorkoutCompletion";

export function WorkoutCompletion({ route, navigation }: any) {
  const {
    treinoNome, tempoTotal, volumeTotal, prsBatidos, salvando,
    intensidade, setIntensidade, feedback, setFeedback, finalizarESalvar
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

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="timer-outline" size={24} color="#FF6B00" />
              <Text style={styles.statValue}>{tempoTotal}</Text>
              <Text style={styles.statLabel}>Duração</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <FontAwesome5 name="weight-hanging" size={20} color="#0A84FF" />
              <Text style={styles.statValue}>{volumeTotal}</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <FontAwesome5 name="trophy" size={20} color="#FFD700" style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{prsBatidos}</Text>
              <Text style={styles.statLabel}>Novos PRs</Text>
            </View>
          </View>

          {/* NOVA ÁREA DE FEEDBACK (MFIT STYLE) */}
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
                                  selecionado && { backgroundColor: opcao.cor, borderColor: opcao.cor, shadowColor: opcao.cor, elevation: 4, shadowOpacity: 0.4, shadowOffset: {width: 0, height: 4}, shadowRadius: 8 }
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
                      )
                  })}
              </View>

              <Text style={styles.sectionTitle}>Deixe um comentário (Opcional)</Text>
              <TextInput
                  style={styles.feedbackInput}
                  placeholder="Ex: Treino muito bom, mas tive dificuldade no supino..."
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