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
  StatusBar,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";

export default function AtivarConvite({ navigation }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [inputFocado, setInputFocado] = useState(null);

  const handleAtivarConta = async () => {
    if (!email || !codigo || !senha) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    if (senha.length < 6) {
      return Alert.alert("Atenção", "Sua senha deve ter no mínimo 6 caracteres.");
    }

    setLoading(true);

    try {
      const { data: convite, error: fetchError } = await supabase
        .from("convites_alunos")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .eq("codigo_convite", codigo.trim())
        .eq("status", "pendente")
        .single();

      if (fetchError || !convite) {
        throw new Error("Convite não encontrado ou já utilizado.");
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: insertError } = await supabase.from('usuarios').insert([
          {
            id: authData.user.id,
            email: email.trim().toLowerCase(),
            nome: convite.nome,
            tipo: "cliente",
            criado_pelo_personal: true,
            personal_id: convite.personal_id,
            tipo_acompanhamento: convite.tipo_acompanhamento,
            objetivo_principal: convite.objetivo_principal,
            setup_completo: true,
            data_vinculo_personal: new Date().toISOString() 
          }
        ]);

        if (insertError) throw insertError;

        const { error: erroPlano } = await supabase.from('planos').insert([
          {
            personal_id: convite.personal_id,
            aluno_id: authData.user.id,
            modalidade: convite.tipo_acompanhamento,
            valor_mensal: convite.valor_mensalidade || 0,
            dia_vencimento: convite.dia_vencimento || 10,
            frequencia: convite.frequencia_pagamento || 'mensal',
            status: 'ativo'
          }
        ]);

        if (erroPlano) throw erroPlano;
      }

      await supabase
        .from("convites_alunos")
        .update({ status: "aceito" })
        .eq("id", convite.id);

      Alert.alert(
        "Conta Ativada! 🎉",
        "Seu perfil e plano foram vinculados com sucesso. Bem-vindo ao time!",
        [{ text: "Entrar", onPress: () => navigation.navigate("ClienteLogin") }] 
      );

    } catch (error) {
      Alert.alert("Ops!", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView 
        intensity={Platform.OS === 'ios' ? 80 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.headerGlass}
      >
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ativar Acesso VIP</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContent}>
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient
                  colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]}
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons
                    name="star-shooting"
                    size={38}
                    color={theme.colors.primary}
                  />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>Você foi <Text style={styles.titleHighlight}>convidado!</Text></Text>
              <Text style={styles.subtitle}>
                Insira o e-mail cadastrado pelo seu Personal, o código fornecido e crie sua senha de acesso.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputBox, inputFocado === "email" && styles.inputBoxFocused]}>
                <View style={styles.inputIconWrapper}>
                  <Ionicons name="mail" size={16} color={theme.colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Seu e-mail"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setInputFocado("email")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              <View style={[styles.inputBox, inputFocado === "codigo" && styles.inputBoxFocused]}>
                <View style={styles.inputIconWrapper}>
                  <MaterialCommunityIcons name="ticket-confirmation" size={16} color={theme.colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                  onFocus={() => setInputFocado("codigo")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              <View style={[styles.inputBox, inputFocado === "senha" && styles.inputBoxFocused]}>
                <View style={styles.inputIconWrapper}>
                  <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Crie sua senha de acesso"
                  placeholderTextColor="#666"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setInputFocado("senha")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye-off" : "eye"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={handleAtivarConta}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.btnGradient}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="lock-open-variant" size={20} color="#000" style={{ marginRight: 8 }} />
                      <Text style={styles.btnPrimaryText}>Desbloquear Meu Acesso</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.infoWrapperContainer}>
              <Text style={styles.infoSectionTitle}>O que acontece agora?</Text>
              
              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="flash" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Seu perfil será <Text style={styles.infoTextBold}>vinculado instantaneamente</Text> ao seu personal trainer.
                </Text>
              </View>

              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="barbell" size={16} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Você terá acesso aos seus <Text style={styles.infoTextBold}>treinos e planilhas</Text> sem precisar configurar nada.
                </Text>
              </View>
              
              <View style={styles.infoItemCard}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.2)" }]}>
                  <Ionicons name="shield-checkmark" size={16} color="#00E676" />
                </View>
                <Text style={styles.infoText}>
                  Esta senha será a sua credencial <Text style={styles.infoTextBold}>única e segura</Text> para os próximos acessos.
                </Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000000", position: "relative" },

  glowTopLeft: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
    blurRadius: 60,
  },
  glowBottomRight: {
    position: "absolute",
    bottom: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary,
    opacity: 0.1,
    blurRadius: 80,
  },

  headerGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  btnVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontFamily: theme.fonts.title,
    fontSize: 16,
    color: "#FFF",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, padding: 24, paddingTop: Platform.OS === "ios" ? 130 : 110, paddingBottom: 40 },

  headerTextContainer: { alignItems: "center", marginBottom: 35 },
  iconWrapper: {
    position: "relative",
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    blurRadius: 20,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.5)",
  },

  title: {
    fontFamily: theme.fonts.title,
    fontSize: 34,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 40,
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: "#AAA",
    marginTop: 10,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  form: { width: "100%", marginBottom: 30 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    paddingLeft: 12,
    marginBottom: 16,
    height: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  inputBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255, 107, 0, 0.05)",
  },
  inputIconWrapper: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    backgroundColor: "rgba(255, 107, 0, 0.1)", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: "rgba(255, 107, 0, 0.2)" 
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontFamily: theme.fonts.body,
    height: "100%",
    backgroundColor: "transparent",
  },
  eyeIcon: { paddingHorizontal: 16, height: "100%", justifyContent: "center" },

  btnPrimary: {
    marginTop: 15, 
    borderRadius: 20, 
    shadowColor: theme.colors.primary, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 16, 
    elevation: 10
  },
  btnGradient: { 
    flexDirection: "row", 
    height: 64, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  btnPrimaryText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  infoWrapperContainer: {
    marginTop: "auto",
  },
  infoSectionTitle: {
    color: "#FFF",
    fontFamily: theme.fonts.title,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  infoItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222"
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },
  infoText: {
    flex: 1,
    color: "#888",
    fontSize: 13,
    lineHeight: 20,
  },
  infoTextBold: {
    color: "#DDD",
    fontWeight: "bold",
  }
});