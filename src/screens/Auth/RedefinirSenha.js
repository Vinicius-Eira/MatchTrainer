import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, ScrollView, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import * as Linking from 'expo-linking';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

const { height } = Dimensions.get("window");

export default function RedefinirSenha({ navigation }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validandoLink, setValidandoLink] = useState(true);

  const [focoSenha, setFocoSenha] = useState(false);
  const [focoConfirmar, setFocoConfirmar] = useState(false);

  useEffect(() => {
    const prepararSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setValidandoLink(false); 
          return;
        }

        const url = await Linking.getInitialURL();
        if (url && url.includes('access_token')) {
          await processarUrlToken(url);
        } else {
          setValidandoLink(false);
        }
      } catch (e) {
        console.log("Erro ao preparar sessão:", e);
        setValidandoLink(false);
      }
    };

    prepararSessao();
  }, []);

  const processarUrlToken = async (url) => {
    try {
      const queryString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
      if (!queryString) return;

      const pairs = queryString.split('&');
      let accessToken = null;
      let refreshToken = null;

      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key === 'access_token') accessToken = value;
        if (key === 'refresh_token') refreshToken = value;
      });

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }
    } catch (err) {
      console.log("Erro ao extrair tokens:", err);
    } finally {
      setValidandoLink(false);
    }
  };

  const handleAtualizarSenha = async () => {
    if (!novaSenha.trim() || !confirmarSenha.trim()) {
      return Alert.alert('Atenção', 'Preencha os dois campos de senha.');
    }

    if (novaSenha !== confirmarSenha) {
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    if (novaSenha.length < 6) {
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    }

    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Sua sessão de recuperação expirou ou não foi reconhecida. Por favor, clique no link do e-mail novamente.");
      }

      const { error } = await supabase.auth.updateUser({
        password: novaSenha.trim()
      });

      if (error) throw error;

      Alert.alert(
        'Senha Atualizada! 🔒', 
        'Sua nova credencial foi salva com sucesso.',
        [{ text: 'Fazer Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'ChoiceScreen' }] }) }]
      );
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (validandoLink) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#070707" />
        <View style={styles.glowTopLeft} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Autenticando link seguro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#070707" />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView 
        intensity={Platform.OS === 'ios' ? 70 : 100} 
        tint="dark" 
        experimentalBlurMethod="dimezisBlurView" 
        style={styles.headerGlass}
      >
        <TouchableOpacity 
          style={styles.btnVoltar} 
          onPress={() => navigation.navigate('ChoiceScreen')} 
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </BlurView>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContent}>
            
            {/* HEADER DA TELA */}
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient colors={["rgba(255, 107, 0, 0.2)", "rgba(255, 107, 0, 0.02)"]} style={styles.iconCircle}>
                  <MaterialCommunityIcons name="shield-key-outline" size={36} color={theme.colors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Nova <Text style={styles.titleHighlight}>Senha.</Text></Text>
              <Text style={styles.subtitle}>Crie uma credencial forte e única para proteger seus dados e treinos.</Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputBox, focoSenha && styles.inputBoxFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focoSenha ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Digite sua nova senha"
                  placeholderTextColor="#666"
                  secureTextEntry={!verSenha}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  onFocus={() => setFocoSenha(true)}
                  onBlur={() => setFocoSenha(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="newPassword"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setVerSenha(!verSenha)} activeOpacity={0.7}>
                  <Ionicons name={verSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputBox, focoConfirmar && styles.inputBoxFocused]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={focoConfirmar ? theme.colors.primary : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#666"
                  secureTextEntry={!verSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  onFocus={() => setFocoConfirmar(true)}
                  onBlur={() => setFocoConfirmar(false)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  textContentType="newPassword"
                />
              </View>

              <TouchableOpacity 
                style={[styles.btnPrimary, loading && { opacity: 0.7 }]} 
                onPress={handleAtualizarSenha} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.btnPrimaryText}>Salvar Nova Senha</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.trustBadgesContainer}>
              
              <View style={styles.securityCard}>
                <View style={styles.securityIconBox}>
                  <Ionicons name="finger-print" size={22} color={theme.colors.success} />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Criptografia de Ponta</Text>
                  <Text style={styles.securityDesc}>Sua senha é blindada e invisível no banco de dados. Nem nossa equipe tem acesso.</Text>
                </View>
              </View>

              <View style={styles.securityCard}>
                <View style={[styles.securityIconBox, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.2)" }]}>
                  <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Proteção Ativa</Text>
                  <Text style={styles.securityDesc}>Ao atualizar, qualquer sessão logada em celulares antigos será desconectada na hora.</Text>
                </View>
              </View>

              <View style={styles.securityCard}>
                <View style={[styles.securityIconBox, { backgroundColor: "rgba(0, 191, 255, 0.1)", borderColor: "rgba(0, 191, 255, 0.2)" }]}>
                  <Ionicons name="flash" size={22} color="#00BFFF" />
                </View>
                <View style={styles.securityTextContent}>
                  <Text style={styles.securityTitle}>Acesso Imediato</Text>
                  <Text style={styles.securityDesc}>Sua credencial é atualizada instantaneamente. Salve e retome seus treinos e rotinas.</Text>
                </View>
              </View>

            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#070707", position: "relative" },
  
  glowTopLeft: { position: "absolute", top: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: theme.colors.primary, opacity: 0.12, blurRadius: 60 },
  glowBottomRight: { position: "absolute", bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.08, blurRadius: 80 },
  
  loadingText: { color: "#888", marginTop: 20, fontSize: 16, fontFamily: theme.fonts.body, fontWeight: "600", letterSpacing: 0.5 },

  headerGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: Platform.OS === "android" ? "rgba(0,0,0,0.5)" : "transparent",
    overflow: "hidden",
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

  scrollContent: { flexGrow: 1 },
  innerContent: { flex: 1, padding: 24, paddingTop: Platform.OS === "ios" ? 130 : 110, paddingBottom: 40 },
  
  header: { alignItems: "center", marginBottom: 40 },
  iconWrapper: { position: "relative", marginBottom: 25, justifyContent: "center", alignItems: "center" },
  iconGlow: { position: "absolute", width: 70, height: 70, borderRadius: 35, backgroundColor: theme.colors.primary, opacity: 0.3, blurRadius: 20 },
  iconCircle: { width: 74, height: 74, borderRadius: 37, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.4)" },
  
  title: { fontFamily: theme.fonts.title, fontSize: 38, color: "#FFF", letterSpacing: -0.5, lineHeight: 44, textAlign: "center" },
  titleHighlight: { color: theme.colors.primary },
  subtitle: { fontFamily: theme.fonts.body, fontSize: 15, color: "#888", marginTop: 12, lineHeight: 22, textAlign: "center", paddingHorizontal: 10 },
  
  form: { width: "100%" },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 18, borderWidth: 1, borderColor: "#222", paddingLeft: 16, marginBottom: 16, height: 64 },
  inputBoxFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#FFF", fontSize: 16, fontFamily: theme.fonts.body, height: "100%", backgroundColor: "transparent" },
  eyeIcon: { paddingHorizontal: 16, height: "100%", justifyContent: "center" },
  
  btnPrimary: { backgroundColor: theme.colors.primary, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 10, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  btnPrimaryText: { color: "#000", fontSize: 16, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" },

  trustBadgesContainer: {
    marginTop: "auto", 
    paddingTop: 40,
    gap: 12,
  },
  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 18,
  },
  securityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.2)",
  },
  securityTextContent: { flex: 1 },
  securityTitle: { color: "#FFF", fontSize: 14, fontWeight: "800", marginBottom: 4, letterSpacing: 0.5 },
  securityDesc: { color: "#888", fontSize: 12, lineHeight: 18 },
});