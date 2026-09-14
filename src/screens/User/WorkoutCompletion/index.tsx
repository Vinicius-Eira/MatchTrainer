import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./WorkoutCompletionStyles";
import { useFinalizacaoTreino } from "./useWorkoutCompletion";

export default function WorkoutCompletion({ route, navigation }: any) {
  const {
    treinoNome, tempoTotal, volumeTotal, prsBatidos,
    esforco, setEsforco, niveisEsforco,
    observacao, setObservacao,
    salvando, finalizarESalvar
  } = useFinalizacaoTreino(navigation, route);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
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
              <MaterialCommunityIcons name="weight-kilogram" size={24} color="#0A84FF" />
              <Text style={styles.statValue}>{volumeTotal}</Text>
              <Text style={styles.statLabel}>Volume Total</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statBox}>
              <FontAwesome5 name="trophy" size={20} color="#FFD700" style={{ marginBottom: 4 }} />
              <Text style={styles.statValue}>{prsBatidos}</Text>
              <Text style={styles.statLabel}>Novos PRs</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Como foi o treino?</Text>
          
          <View style={styles.esforcoGrid}>
            {niveisEsforco.map((nivel) => {
              const selecionado = esforco === nivel.id;
              return (
                <TouchableOpacity 
                  key={nivel.id} 
                  style={[styles.esforcoBtn, selecionado && { borderColor: nivel.cor, backgroundColor: `${nivel.cor}15` }]}
                  activeOpacity={0.8}
                  onPress={() => setEsforco(nivel.id)}
                >
                  <Ionicons name={nivel.icon as any} size={24} color={selecionado ? nivel.cor : "#555"} />
                  <Text style={[styles.esforcoLabel, selecionado && { color: nivel.cor }]}>{nivel.label}</Text>
                  <Text style={styles.esforcoSub}>{nivel.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Observações (Opcional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Sentiu alguma dor? Faltou energia?"
              placeholderTextColor="#555"
              multiline
              maxLength={200}
              value={observacao}
              onChangeText={setObservacao}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient colors={["transparent", "#050505"]} style={styles.footerGradient} />
          <TouchableOpacity 
            style={[styles.btnSalvar, esforco === 0 && styles.btnSalvarDisabled]} 
            activeOpacity={0.9} 
            onPress={finalizarESalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.btnSalvarText}>SALVAR NO HISTÓRICO</Text>
                <Ionicons name="save" size={18} color="#000" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}