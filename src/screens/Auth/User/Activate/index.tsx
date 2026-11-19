import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { theme } from "../../../../theme/theme";
import { styles } from "./styles";
import { useAtivarConta } from "./useAtivarConta";

export function AtivarConvite({ navigation }: any) {
  const {
    modo,
    setModo,
    emailLogado,
    email,
    setEmail,
    codigo,
    handleCodigoChange,
    senha,
    setSenha,
    loading,
    mostrarSenha,
    setMostrarSenha,
    inputFocado,
    setInputFocado,
    modalVisible,
    precisaOnboarding,
    handleTrocarConta,
    handleAtivarConta,
    handleProsseguir,
  } = useAtivarConta(navigation);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#FFF" style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ativar Convite</Text>
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
                {emailLogado
                  ? "Digite o código de convite enviado pelo seu treinador para revisar e assinar sua proposta."
                  : "Use o e-mail autorizado e o código temporário enviado pelo seu treinador para vincular sua conta."}
              </Text>
            </View>

            {!emailLogado && (
              <View style={extraStyles.modeToggleContainer}>
                <TouchableOpacity
                  style={[extraStyles.modeBtn, modo === "novo" && extraStyles.modeBtnActive]}
                  onPress={() => setModo("novo")}
                  activeOpacity={0.8}
                >
                  <Text style={[extraStyles.modeText, modo === "novo" && extraStyles.modeTextActive]}>
                    Sou Novo (Criar Conta)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[extraStyles.modeBtn, modo === "existente" && extraStyles.modeBtnActive]}
                  onPress={() => setModo("existente")}
                  activeOpacity={0.8}
                >
                  <Text style={[extraStyles.modeText, modo === "existente" && extraStyles.modeTextActive]}>
                    Já Tenho Conta
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {emailLogado && (
              <View style={extraStyles.loggedBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={extraStyles.loggedLabel}>CONTA CONECTADA</Text>
                  <Text style={extraStyles.loggedEmail} numberOfLines={1}>
                    {emailLogado}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleTrocarConta} style={extraStyles.btnTrocarConta}>
                  <Text style={extraStyles.btnTrocarContaText}>Trocar</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.form}>
              {!emailLogado && (
                <View style={[styles.inputBox, inputFocado === "email" && styles.inputBoxFocused]}>
                  <View style={styles.inputIconWrapper}>
                    <Ionicons name="mail" size={16} color={theme.colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                    placeholder="E-mail informado ao Personal"
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
              )}

              <View style={[styles.inputBox, inputFocado === "codigo" && styles.inputBoxFocused]}>
                <View style={styles.inputIconWrapper}>
                  <MaterialCommunityIcons name="ticket-confirmation" size={16} color={theme.colors.primary} />
                </View>
                <TextInput
                  style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                  placeholder="Código de convite (ex: A7K9-M2P4)"
                  placeholderTextColor="#666"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={9}
                  value={codigo}
                  onChangeText={handleCodigoChange}
                  onFocus={() => setInputFocado("codigo")}
                  onBlur={() => setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>

              {!emailLogado && (
                <View style={[styles.inputBox, inputFocado === "senha" && styles.inputBoxFocused]}>
                  <View style={styles.inputIconWrapper}>
                    <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]}
                    placeholder={modo === "novo" ? "Crie sua senha pessoal (mín. 6)" : "Digite a senha da sua conta"}
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
              )}

              <TouchableOpacity style={[styles.btnOutline, loading && { opacity: 0.7 }]} onPress={handleAtivarConta} disabled={loading} activeOpacity={0.8}>
                <LinearGradient colors={["rgba(255, 107, 0, 0.1)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="lock-open-variant-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.btnOutlineText}>
                      {emailLogado ? "Validar Convite" : modo === "novo" ? "Criar Conta e Validar Convite" : "Entrar e Validar Convite"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoWrapperContainer}>
              <Text style={styles.infoSectionTitle}>Como funciona a ativação</Text>

              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  O código é uma <Text style={styles.infoTextBold}>credencial temporária de uso único</Text> vinculada ao seu e-mail.
                </Text>
              </View>

              <View style={styles.infoItemCard}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.infoText}>
                  Após validar, você <Text style={styles.infoTextBold}>revisa e assina a proposta</Text> antes de iniciar os treinos.
                </Text>
              </View>

              <View style={styles.infoItemCard}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(0, 230, 118, 0.1)", borderColor: "rgba(0, 230, 118, 0.2)" }]}>
                  <Ionicons name="key-outline" size={18} color="#00E676" />
                </View>
                <Text style={styles.infoText}>
                  Sua senha continua sendo <Text style={styles.infoTextBold}>pessoal e exclusiva</Text> para entrar no MatchTrainer.
                </Text>
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

            <Text style={styles.modalTitle}>Convite Validado!</Text>
            <Text style={styles.modalSubtitle}>Sua conta foi vinculada ao convite do seu treinador com sucesso.</Text>

            <View style={styles.modalHighlightBox}>
              <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.modalHighlightText}>
                {precisaOnboarding ? (
                  <>
                    Agora complete seu <Text style={{ color: "#FFF", fontWeight: "bold" }}>perfil rápido</Text> para revisar e assinar seu contrato.
                  </>
                ) : (
                  <>
                    Falta apenas <Text style={{ color: "#FFF", fontWeight: "bold" }}>revisar e assinar seu contrato</Text> para liberar seus treinos.
                  </>
                )}
              </Text>
            </View>

            <TouchableOpacity style={styles.modalBtnActionOutline} activeOpacity={0.8} onPress={handleProsseguir}>
              <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "rgba(255, 107, 0, 0.02)"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.modalBtnTextOutline}>{precisaOnboarding ? "Completar Perfil" : "Ver Minha Proposta"}</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const extraStyles = StyleSheet.create({
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#111116",
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#23232D",
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeBtnActive: {
    backgroundColor: "rgba(255, 107, 0, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.55)",
  },
  modeText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
  },
  modeTextActive: {
    color: "#FF6B00",
    fontWeight: "900",
  },
  loggedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 230, 118, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.35)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 10,
  },
  loggedLabel: {
    color: "#00E676",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  loggedEmail: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
    marginTop: 2,
  },
  btnTrocarConta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  btnTrocarContaText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
});