import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";
import { theme } from "../../theme/theme";

export default function AdicionarAluno({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("consultoria"); 
  const [objetivo, setObjetivo] = useState("hipertrofia"); 
  const [mensalidade, setMensalidade] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputFocado, setInputFocado] = useState(null);

  const handleAdicionarAluno = async () => {
    if (!nome || !email) {
      return Alert.alert("Atenção", "Nome e E-mail são obrigatórios.");
    }

      let diaInt = null;
    if (vencimento) {
      diaInt = parseInt(vencimento);
      if (isNaN(diaInt) || diaInt < 1 || diaInt > 31) {
        return Alert.alert("Atenção", "Insira um dia de vencimento válido (1 a 31).");
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão do profissional não encontrada.");

      const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: insertError } = await supabase
        .from('convites_alunos')
        .insert([
          {
            email: email.trim().toLowerCase(),
            codigo_convite: codigoGerado,
            personal_id: user.id,
            nome: nome.trim(),
            tipo_acompanhamento: tipo,
            objetivo_principal: objetivo,
            valor_mensalidade: parseFloat(mensalidade) || 0,
            dia_vencimento: diaInt,
            status: 'pendente'
          }
        ]);

      if (insertError) throw insertError;

      Alert.alert(
        "Convite Gerado! 🎉",
        `O aluno foi pré-cadastrado na sua lista.\n\nCódigo de Acesso: ${codigoGerado}\n\nEnvie este código e o e-mail cadastrado para o aluno ativar a conta no aplicativo.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      Alert.alert("Erro ao salvar", error.message || "Não foi possível cadastrar o aluno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Aluno</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Dados de Acesso</Text>
          
          <View style={[styles.inputContainer, inputFocado === "nome" && styles.inputFocused]}>
            <Ionicons name="person-outline" size={20} color={inputFocado === "nome" ? theme.colors.primary : theme.colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo do aluno"
              placeholderTextColor={theme.colors.textMuted}
              value={nome}
              onChangeText={setNome}
              onFocus={() => setInputFocado("nome")}
              onBlur={() => setInputFocado(null)}
            />
          </View>

          <View style={[styles.inputContainer, inputFocado === "email" && styles.inputFocused]}>
            <Ionicons name="mail-outline" size={20} color={inputFocado === "email" ? theme.colors.primary : theme.colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail do aluno"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setInputFocado("email")}
              onBlur={() => setInputFocado(null)}
            />
          </View>

          <Text style={styles.sectionTitle}>Modalidade de Treino</Text>
          <View style={styles.selectorRow}>
            {["consultoria", "presencial", "apenas_personal"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.selectorButton, tipo === item && styles.selectorButtonActive]}
                onPress={() => setTipo(item)}
              >
                <Text style={[styles.selectorText, tipo === item && styles.selectorTextActive]}>
                  {item === "consultoria" ? "Consultoria" : item === "presencial" ? "Presencial" : "Só Personal"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Objetivo Principal</Text>
          <View style={styles.selectorGrid}>
            {["hipertrofia", "emagrecimento", "saude", "performance"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.gridButton, objetivo === item && styles.gridButtonActive]}
                onPress={() => setObjetivo(item)}
              >
                <Text style={[styles.selectorText, objetivo === item && styles.selectorTextActive]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Acordo Financeiro (Opcional)</Text>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }, inputFocado === "valor" && styles.inputFocused]}>
              <MaterialCommunityIcons name="currency-brl" size={20} color={inputFocado === "valor" ? theme.colors.primary : theme.colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Valor (R$)"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={mensalidade}
                onChangeText={setMensalidade}
                onFocus={() => setInputFocado("valor")}
                onBlur={() => setInputFocado(null)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }, inputFocado === "vencimento" && styles.inputFocused]}>
              <Ionicons name="calendar-outline" size={20} color={inputFocado === "vencimento" ? theme.colors.primary : theme.colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Dia Venc. (1-31)"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                maxLength={2}
                value={vencimento}
                onChangeText={setVencimento}
                onFocus={() => setInputFocado("vencimento")}
                onBlur={() => setInputFocado(null)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnSalvar, loading && { opacity: 0.7 }]}
            onPress={handleAdicionarAluno}
            disabled={loading}
          >
            <Text style={styles.btnSalvarText}>
              {loading ? "Gerando Convite..." : "Gerar Convite de Acesso"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  btnVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: 20, color: theme.colors.text, fontWeight: "bold" },
  scrollContent: { padding: 24, paddingBottom: 50 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 16,
    height: 60,
    marginBottom: 14,
  },
  inputFocused: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  icon: { marginRight: 12 },
  input: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 16, height: "100%" },
  selectorRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  selectorButton: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectorButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  selectorText: { color: theme.colors.textSecondary, fontWeight: "700", fontSize: 13 },
  selectorTextActive: { color: "#000", fontWeight: "900" },
  selectorGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridButton: {
    width: "48%",
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gridButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },
  btnSalvar: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  btnSalvarText: { color: "#000", fontSize: 16, fontWeight: "900", textTransform: "uppercase" },
});