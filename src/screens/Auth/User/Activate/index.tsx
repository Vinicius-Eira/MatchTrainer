import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
} from "react-native";

import { theme } from "../../../../theme/theme";
import { styles } from "./styles";
import { useAtivarConta } from "./useAtivarConta";

export function AtivarConvite({ navigation }: any) {
  const {
    email,
    setEmail,
    codigo,
    setCodigo,
    senha,
    setSenha,
    loading,
    mostrarSenha,
    setMostrarSenha,
    inputFocado,
    setInputFocado,
    modalVisible,
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