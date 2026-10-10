import React from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { useFinalizacaoTreino } from "./useWorkoutCompletion";

export function WorkoutCompletion({ route, navigation }: any) {
  const {
    treinoNome, tempoTotal, volumeTotal, prsBatidos, voltarAoInicio
  } = useFinalizacaoTreino(navigation, route);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" translucent={false} />
      
      <View style={{ flex: 1 }}>
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

          <View style={{ marginTop: 40, alignItems: 'center', paddingHorizontal: 20 }}>
            <Ionicons name="flame" size={32} color="#FF6B00" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
              Excelente trabalho!
            </Text>
            <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Os dados de carga, repetições e o seu feedback já foram sincronizados com o painel do seu treinador.
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <LinearGradient colors={["transparent", "#050505"]} style={styles.footerGradient} />
          <TouchableOpacity 
            style={[styles.btnSalvar, { backgroundColor: '#00E676' }]} 
            activeOpacity={0.9} 
            onPress={voltarAoInicio}
          >
            <Text style={[styles.btnSalvarText, { color: '#000' }]}>VOLTAR AO INÍCIO</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}