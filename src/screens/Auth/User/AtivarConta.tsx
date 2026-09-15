import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { supabase } from "../../../services/supabase";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";

export default function AtivarConvite({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [inputFocado, setInputFocado] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [conexaoIdNavegacao, setConexaoIdNavegacao] = useState<string | null>(null);

  const handleAtivarConta = async () => {
    if (!email || !codigo || !senha) {
      return Alert.alert("Atenção", "Preencha todos os campos para continuar.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert("E-mail Inválido", "Por favor, digite um formato de e-mail válido.");
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
        throw new Error("Convite não encontrado ou já foi utilizado.");
      }

      let userId = null;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError) {
        if (authError.message.includes("already registered") || authError.status === 400) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: senha,
          });

          if (signInError) {
            throw new Error("Este e-mail já possui um cadastro. Por favor, digite a senha correta da sua conta para aceitar o convite.");
          }
          userId = signInData.user.id; 
        } else {
          throw authError; 
        }
      } else {
        userId = authData.user?.id; 
      }

      let novaConexaoId = null;

      if (userId) {
        const { error: insertError } = await supabase.from("usuarios").upsert({
          id: userId,
          email: email.trim().toLowerCase(),
          nome: convite.nome,
          preferencias: {
            setup_completo: true,
            criado_pelo_personal: true,
            personal_vinculado: convite.personal_id,
            tipo_acompanhamento: convite.tipo_acompanhamento,
            objetivo_principal: convite.objetivo_principal,
            data_vinculo: new Date().toISOString(),
          }
        });

        if (insertError) throw insertError;

        const { data: conexaoData, error: erroConexao } = await supabase
          .from("conexoes")
          .insert([
            {
              usuario_id: userId,
              personal_id: convite.personal_id,
              status: "aguardando_assinatura", 
            }
          ])
          .select("id")
          .single();

        if (erroConexao) throw erroConexao;
        novaConexaoId = conexaoData.id;

        const { error: erroPlano } = await supabase.from("planos").insert([
          {
            personal_id: convite.personal_id,
            aluno_id: userId,
            modalidade: convite.tipo_acompanhamento,
            valor_mensal: convite.valor_mensalidade || 0,
            dia_vencimento: convite.dia_vencimento || 10,
            frequencia: convite.frequencia_pagamento || "mensal",
            status: "aguardando_assinatura", 
          },
        ]);

        if (erroPlano) throw erroPlano;
      }

      await supabase.from("convites_alunos").update({ status: "aceito" }).eq("id", convite.id);

      setConexaoIdNavegacao(novaConexaoId);
      setModalVisible(true);

    } catch (error: any) {
      Alert.alert("Erro ao Ativar", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProsseguir = () => {
    setModalVisible(false);
    navigation.navigate("MiniOnboarding", { conexaoId: conexaoIdNavegacao });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acesso VIP</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.25)", "rgba(255, 107, 0, 0.05)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="star-shooting-outline" size={36} color={theme.colors.primary} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>
                Você foi <Text style={styles.titleHighlight}>convidado!</Text>
              </Text>
              <Text style={styles.subtitle}>
                Insira o código enviado pelo seu treinador e crie uma senha segura para desbloquear seu ambiente.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputBox, inputFocado === "email" && styles.inputBoxFocused]}>
                <View style={styles.inputIconWrapper}>
                  <Ionicons name="mail" size={16} color={theme.colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="E-mail cadastrado"
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
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
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
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Crie uma senha de acesso"
                  placeholderTextColor="#666"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setInputFocado("senha")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeIcon} activeOpacity={0.7}>
                  <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color="#FF5500" />
                </TouchableOpacity>
              </View>

              {/* BOTÃO OUTLINE NEON */}
              <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleAtivarConta} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="lock-open-variant-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.btnOutlineText}>Desbloquear Meu Acesso</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoWrapperContainer}>
              <Text style={styles.infoSectionTitle}>O que acontece agora?</Text>

              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}><Ionicons name="flash-outline" size={18} color={theme.colors.primary} /></View>
                <Text style={styles.infoText}>Seu perfil será <Text style={styles.infoTextBold}>vinculado instantaneamente</Text> ao seu personal trainer.</Text>
              </View>

              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}><Ionicons name="barbell-outline" size={18} color={theme.colors.primary} /></View>
                <Text style={styles.infoText}>Você terá acesso aos seus <Text style={styles.infoTextBold}>treinos e planilhas</Text> sem precisar configurar nada.</Text>
              </View>

              <View style={styles.infoItemCard}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.2)" }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#00E676" />
                </View>
                <Text style={styles.infoText}>Esta senha será a sua credencial <Text style={styles.infoTextBold}>única e segura</Text> para os próximos acessos.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalGlow} />
            
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconRing}>
                <Ionicons name="checkmark-done" size={40} color={theme.colors.primary} />
              </View>
            </View>

            <Text style={styles.modalTitle}>Acesso VIP Liberado!</Text>
            <Text style={styles.modalSubtitle}>Sua conta foi vinculada ao seu treinador com sucesso.</Text>

            <View style={styles.modalHighlightBox}>
              <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} style={{marginRight: 10}}/>
              <Text style={styles.modalHighlightText}>Faltam apenas <Text style={{color: '#FFF', fontWeight: 'bold'}}>3 perguntas rápidas</Text> para montarmos o seu perfil clínico.</Text>
            </View>

            <TouchableOpacity style={styles.modalBtnActionOutline} activeOpacity={0.8} onPress={handleProsseguir}>
              <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.modalBtnTextOutline}>Iniciar Jornada</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#020202", position: "relative" },

  glowTopLeft: { position: "absolute", top: verticalScale(-100), left: scale(-50), width: scale(250), height: scale(250), borderRadius: scale(125), backgroundColor: theme.colors.primary, opacity: 0.15},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-50), right: scale(-100), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.1},

  headerGlass: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.8)" : "transparent" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontFamily: theme.fonts.title, fontSize: moderateScale(15), color: "#FFF", letterSpacing: 1, textTransform: "uppercase" },

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, paddingHorizontal: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(110), paddingBottom: verticalScale(40) },

  headerTextContainer: { alignItems: "center", marginBottom: verticalScale(35) },
  iconWrapper: { position: "relative", marginBottom: verticalScale(20), justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: theme.colors.primary, opacity: 0.3},
  iconCircle: { width: scale(84), height: scale(84), borderRadius: scale(42), justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)", backgroundColor: "#0A0A0A" },

  title: { fontFamily: theme.fonts.title, fontSize: moderateScale(34), color: "#FFF", letterSpacing: -0.5, lineHeight: moderateScale(40), textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: moderateScale(14), color: "#888", marginTop: verticalScale(10), lineHeight: moderateScale(22), textAlign: "center", paddingHorizontal: scale(10) },

  form: { width: "100%", marginBottom: verticalScale(30) },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(16), borderWidth: 1, borderColor: "#1A1A1A", paddingLeft: scale(12), marginBottom: verticalScale(16), height: verticalScale(60) },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  inputIconWrapper: { width: scale(38), height: scale(38), borderRadius: moderateScale(10), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(12), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  eyeIcon: { paddingHorizontal: scale(16), height: "100%", justifyContent: "center" },

  // BOTÃO OUTLINE NEON
  btnOutline: { flexDirection: "row", marginTop: verticalScale(10), height: verticalScale(60), borderRadius: moderateScale(18), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  btnOutlineText: { color: theme.colors.primary, fontSize: moderateScale(16), fontWeight: "bold", letterSpacing: 0.5, textTransform: "uppercase" },

  infoWrapperContainer: { marginTop: "auto" },
  infoSectionTitle: { color: "#888", fontFamily: theme.fonts.title, fontSize: moderateScale(14), marginBottom: verticalScale(16), textAlign: "center", letterSpacing: 1, textTransform: "uppercase" },
  infoItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#0A0A0A", borderRadius: moderateScale(18), paddingHorizontal: scale(16), paddingVertical: verticalScale(16), marginBottom: verticalScale(12), borderWidth: 1, borderColor: "#1A1A1A" },
  infoIconBox: { width: scale(40), height: scale(40), borderRadius: moderateScale(12), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(14), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  infoText: { flex: 1, color: "#777", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  infoTextBold: { color: "#DDD", fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: scale(20) },
  modalContent: { width: "100%", backgroundColor: "#0A0A0A", borderRadius: moderateScale(28), padding: scale(28), borderWidth: 1, borderColor: "#1A1A1A", alignItems: "center", position: "relative", overflow: 'hidden' },
  modalGlow: { position: "absolute", top: -50, width: 200, height: 200, backgroundColor: theme.colors.primary, opacity: 0.1, borderRadius: 100},
  modalIconContainer: { marginBottom: verticalScale(20), marginTop: verticalScale(10) },
  modalIconRing: { width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: "rgba(255,107,0,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,107,0,0.3)" },
  modalTitle: { color: "#FFF", fontSize: moderateScale(24), fontFamily: theme.fonts.title, marginBottom: verticalScale(8), textAlign: "center" },
  modalSubtitle: { color: "#888", fontSize: moderateScale(14), textAlign: "center", marginBottom: verticalScale(20), paddingHorizontal: scale(10) },
  modalHighlightBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 107, 0, 0.05)', padding: scale(16), borderRadius: moderateScale(16), borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: verticalScale(25), width: '100%' },
  modalHighlightText: { flex: 1, color: "#AAA", fontSize: moderateScale(13), lineHeight: moderateScale(18) },
  
  // MODAL OUTLINE BUTTON
  modalBtnActionOutline: { flexDirection: "row", width: "100%", height: verticalScale(56), borderRadius: moderateScale(16), borderWidth: 1, borderColor: theme.colors.primary, justifyContent: "center", alignItems: "center", position: "relative" },
  modalBtnTextOutline: { color: theme.colors.primary, fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});