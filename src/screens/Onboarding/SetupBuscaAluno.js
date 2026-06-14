import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

const OBJETIVOS = [
  { id: "emagrecimento", titulo: "Emagrecimento", icone: "flame-outline" },
  { id: "hipertrofia", titulo: "Ganho de Massa", icone: "barbell-outline" },
  { id: "condicionamento", titulo: "Condicionamento", icone: "fitness-outline" },
  { id: "saude", titulo: "Saúde e Qualidade de Vida", icone: "heart-outline" },
  { id: "reabilitacao", titulo: "Reabilitação / Postura", icone: "body-outline" },
];

const NIVEIS = [
  { id: "Iniciante", desc: "Nunca treinei ou treino há pouco tempo" },
  { id: "Intermediário", desc: "Treino regularmente (6+ meses)" },
  { id: "Avançado", desc: "Treino pesado há anos" }
];

const FREQUENCIAS = ["1 a 2x por semana", "3 a 4x por semana", "Todos os dias"];

export default function SetupBuscaAluno({ navigation }) {
  const [objetivoSelecionado, setObjetivoSelecionado] = useState("");
  const [nivelSelecionado, setNivelSelecionado] = useState("");
  const [frequenciaSelecionada, setFrequenciaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinalizar = async () => {
    if (!objetivoSelecionado || !nivelSelecionado || !frequenciaSelecionada) {
      return Alert.alert('Atenção', 'Por favor, responda a todas as perguntas para continuarmos.');
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('usuarios').update({
        objetivo: objetivoSelecionado,
        nivel_experiencia: nivelSelecionado,
        frequencia_treino: frequenciaSelecionada
      }).eq('id', user.id);

      if (error) throw error;
      
      navigation.reset({ index: 0, routes: [{ name: 'UsuarioTabs' }] });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionTitle = (title, step) => (
    <View style={styles.sectionHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{step}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passo 2 de 2: Seu Treino</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { textAlign: "center" }]}>
          O que você busca?
        </Text>
        <Text style={[styles.subtitle, { textAlign: "center" }]}>
          Isso nos ajuda a recomendar os treinadores com a especialidade certa
          para o seu perfil.
        </Text>

        {renderSectionTitle("Qual seu objetivo principal?", "1")}
        <View style={styles.optionsContainer}>
          {OBJETIVOS.map((obj) => {
            const isActive = objetivoSelecionado === obj.titulo;
            return (
              <TouchableOpacity
                key={obj.id}
                style={[styles.optionCard, isActive && styles.optionCardActive]}
                onPress={() => setObjetivoSelecionado(obj.titulo)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                  <Ionicons
                    name={obj.icone}
                    size={24}
                    color={isActive ? "#000" : theme.colors.primary}
                  />
                </View>
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {obj.titulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {renderSectionTitle("Qual seu nível de experiência?", "2")}
        <View style={styles.cardsContainer}>
          {NIVEIS.map(n => {
            const isActive = nivelSelecionado === n.id;
            return (
              <TouchableOpacity 
                key={n.id} 
                style={[styles.levelCard, isActive && styles.levelCardActive]} 
                onPress={() => setNivelSelecionado(n.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.levelTitle, isActive && styles.levelTitleActive]}>{n.id}</Text>
                <Text style={styles.levelDesc}>{n.desc}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {renderSectionTitle("Quantos dias pretende treinar?", "3")}
        <View style={styles.chipsContainer}>
          {FREQUENCIAS.map(freq => {
            const isActive = frequenciaSelecionada === freq;
            return (
              <TouchableOpacity 
                key={freq} 
                style={[styles.chip, isActive && styles.chipActive]} 
                onPress={() => setFrequenciaSelecionada(freq)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{freq}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity
          style={[styles.btnFinalizar, loading && { opacity: 0.7 }]}
          onPress={handleFinalizar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.btnFinalizarText}>
              Finalizar e Encontrar Personal
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justify: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 15,
  },
  btnVoltar: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  content: { padding: 20, paddingBottom: 50 },
  title: {
    color: "#FFF",
    fontSize: 28,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 30,
  },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  stepBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  optionsContainer: { gap: 12, marginBottom: 30 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 16,
    padding: 16,
  },
  optionCardActive: {
    backgroundColor: "rgba(255,107,0,0.1)",
    borderColor: theme.colors.primary,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconBoxActive: { backgroundColor: theme.colors.primary },
  optionText: { flex: 1, color: "#DDD", fontSize: 16, fontWeight: "600" },
  optionTextActive: { color: theme.colors.primary },

  cardsContainer: { gap: 12, marginBottom: 30 },
  levelCard: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#2A2A2A', padding: 16, borderRadius: 16 },
  levelCardActive: { backgroundColor: 'rgba(255,107,0,0.1)', borderColor: theme.colors.primary },
  levelTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  levelTitleActive: { color: theme.colors.primary },
  levelDesc: { color: '#888', fontSize: 13 },

  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  chip: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#2A2A2A', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20 },
  chipActive: { backgroundColor: 'rgba(255,107,0,0.1)', borderColor: theme.colors.primary },
  chipText: { color: '#AAA', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: theme.colors.primary },

  btnFinalizar: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  btnFinalizarText: { color: "#000", fontSize: 16, fontWeight: "bold" },
});