import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../../services/supabase';
import { theme } from '../../theme/theme';

export default function EsqueciSenha({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [inputFocado, setInputFocado] = useState(false);

  const handleRecuperarSenha = async () => {
    if (!email.trim()) {
      return Alert.alert('Atenção', 'Por favor, digite seu e-mail cadastrado.');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'exp://192.168.15.26:8081/--/redefinir-senha',
      });

      if (error) throw error;
      
      setEnviado(true);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

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
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" style={{ marginLeft: -2 }} />
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
            
            <View style={styles.headerTextContainer}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconGlow} />
                <LinearGradient
                  colors={["rgba(255, 107, 0, 0.2)", "rgba(255, 107, 0, 0.02)"]}
                  style={styles.iconCircle}
                >
                  <MaterialCommunityIcons name="lock-reset" size={38} color={theme.colors.primary} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>
                Recuperar {"\n"}
                <Text style={styles.titleHighlight}>Senha.</Text>
              </Text>
            </View>

            {!enviado ? (
              <View style={styles.form}>
                <Text style={styles.subtitle}>
                  Não se preocupe! Digite o e-mail associado à sua conta e enviaremos um link seguro para você criar uma nova senha.
                </Text>

                <View style={[styles.inputBox, inputFocado && styles.inputBoxFocused]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={inputFocado ? theme.colors.primary : "#666"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, Platform.OS === "web" && { outlineStyle: "none" }]}
                    placeholder="Seu e-mail cadastrado"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setInputFocado(true)}
                    onBlur={() => setInputFocado(false)}
                    cursorColor={theme.colors.primary}
                    keyboardAppearance="dark"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.btnPrimary, loading && { opacity: 0.7 }]} 
                  onPress={handleRecuperarSenha} 
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Enviar Link de Recuperação</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.successBox}>
                <View style={styles.successIconWrapper}>
                  <View style={styles.successIconGlow} />
                  <Ionicons name="checkmark-circle" size={60} color={theme.colors.success} style={{ zIndex: 2 }} />
                </View>
                
                <Text style={styles.successTitle}>E-mail Enviado!</Text>
                <Text style={styles.successText}>
                  As instruções foram enviadas para {"\n"}
                  <Text style={styles.successEmailHighlight}>{email}</Text>{"\n\n"}
                  Verifique sua caixa de entrada e a pasta de spam.
                </Text>
                
                <TouchableOpacity 
                  style={styles.btnVoltarLogin} 
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnVoltarLoginText}>Voltar para o Login</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#070707", position: "relative" },

  glowTopLeft: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primary,
    opacity: 0.12,
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
    opacity: 0.08,
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
  innerContent: { padding: 24, paddingTop: Platform.OS === "ios" ? 140 : 120, paddingBottom: 40 },

  headerTextContainer: { alignItems: "center", marginBottom: 35 },
  iconWrapper: {
    position: "relative",
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    blurRadius: 20,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.4)",
  },

  title: {
    fontFamily: theme.fonts.title,
    fontSize: 38,
    color: "#FFF",
    letterSpacing: -0.5,
    lineHeight: 44,
    textAlign: "center",
  },
  titleHighlight: { color: theme.colors.primary },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: "#888",
    marginBottom: 35,
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  form: { width: "100%" },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#222",
    paddingLeft: 16,
    marginBottom: 25,
    height: 64,
  },
  inputBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(255, 107, 0, 0.05)",
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontFamily: theme.fonts.body,
    height: "100%",
    backgroundColor: "transparent",
  },

  btnPrimary: {
    backgroundColor: theme.colors.primary,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  successBox: {
    backgroundColor: "#121212",
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  successIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.success,
    opacity: 0.4,
    blurRadius: 15,
  },
  successTitle: {
    color: "#FFF",
    fontSize: 24,
    fontFamily: theme.fonts.title,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  successText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  successEmailHighlight: {
    color: "#FFF",
    fontWeight: "bold",
  },
  btnVoltarLogin: {
    backgroundColor: "rgba(255,255,255,0.05)",
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  btnVoltarLoginText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  }
});