import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../../theme/theme";
import { moderateScale, scale, verticalScale } from "../../../utils/responsive";
import { usePerfilAluno } from "./usePerfilAluno";

export default function PerfilAluno({ navigation }: any) {
  const { state, actions } = usePerfilAluno(navigation);

  if (state.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#020202" translucent />

      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEU PERFIL</Text>
        <TouchableOpacity style={styles.btnSair} onPress={actions.logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={actions.escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, "rgba(255, 107, 0, 0.2)"]} style={styles.avatarRing}>
              <Image source={{ uri: state.fotoUri || "https://via.placeholder.com/150" }} style={styles.avatarImage} />
            </LinearGradient>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userNameDisplay}>{state.nome || "Seu Nome"}</Text>
        </View>

        <View style={styles.cardGeral}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconHeaderWrapper}>
              <Ionicons name="person" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderTitle}>Identificação</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={[styles.inputContainer, state.inputFocado === "nome" && styles.inputContainerFocused]}>
              <Ionicons name="person-outline" size={20} color={state.inputFocado === "nome" ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
              <TextInput style={[styles.input, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} value={state.nome} onChangeText={(texto: string) => actions.setNome(actions.formatarNome(texto))} placeholderTextColor="#666" placeholder="Como quer ser chamado?" onFocus={() => actions.setInputFocado("nome")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Nascimento</Text>
              <View style={[styles.inputContainer, state.inputFocado === "nasc" && styles.inputContainerFocused]}>
                <Ionicons name="calendar-outline" size={18} color={state.inputFocado === "nasc" ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput style={[styles.inputHalf, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="number-pad" maxLength={10} value={state.dataNascimento} placeholder="DD/MM/AAAA" placeholderTextColor="#666" onChangeText={actions.formatarData} onFocus={() => actions.setInputFocado("nasc")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={[styles.inputContainer, state.inputFocado === "whats" && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="whatsapp" size={18} color={state.inputFocado === "whats" ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput style={[styles.inputHalf, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="number-pad" value={state.telefone} onChangeText={actions.formatarWhatsApp} placeholder="(00) 00000" placeholderTextColor="#666" onFocus={() => actions.setInputFocado("whats")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconHeaderWrapper}>
              <MaterialCommunityIcons name="radar" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderTitle}>Radar GPS</Text>
          </View>

          <TouchableOpacity style={styles.btnLocationPremium} onPress={actions.buscarLocalizacao} disabled={state.buscandoLocal} activeOpacity={0.8}>
            {state.buscandoLocal ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <><MaterialCommunityIcons name="map-marker-radius" size={20} color={theme.colors.primary} /><Text style={styles.btnLocationText}>Sincronizar Localização Atual</Text></>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Cidade</Text>
              <View style={[styles.inputContainer, state.inputFocado === "cidade" && styles.inputContainerFocused]}>
                <TextInput style={[styles.inputLocation, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} value={state.cidade} onChangeText={actions.setCidade} placeholder="Sua cidade" placeholderTextColor="#666" onFocus={() => actions.setInputFocado("cidade")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Bairro</Text>
              <View style={[styles.inputContainer, state.inputFocado === "bairro" && styles.inputContainerFocused]}>
                <TextInput style={[styles.inputLocation, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} value={state.bairro} onChangeText={actions.setBairro} placeholder="Seu bairro" placeholderTextColor="#666" onFocus={() => actions.setInputFocado("bairro")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardHeaderBox}>
            <View style={styles.iconHeaderWrapper}>
              <Ionicons name="body" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardHeaderTitle}>Biometria Básica</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Peso (kg)</Text>
              <View style={[styles.inputContainer, state.inputFocado === "peso" && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="scale-bathroom" size={18} color={state.inputFocado === "peso" ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput style={[styles.inputHalf, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="decimal-pad" maxLength={6} value={state.peso} onChangeText={actions.formatarPeso} placeholder="Ex: 80,5" placeholderTextColor="#666" onFocus={() => actions.setInputFocado("peso")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Altura (cm)</Text>
              <View style={[styles.inputContainer, state.inputFocado === "altura" && styles.inputContainerFocused]}>
                <MaterialCommunityIcons name="human-male-height" size={18} color={state.inputFocado === "altura" ? theme.colors.primary : "#FF5500"} style={styles.inputIcon} />
                <TextInput style={[styles.inputHalf, Platform.OS === "web" ? { outlineStyle: "none" as any } : {}]} keyboardType="number-pad" maxLength={3} value={state.altura} onChangeText={actions.formatarAltura} placeholder="Ex: 180" placeholderTextColor="#666" onFocus={() => actions.setInputFocado("altura")} onBlur={() => actions.setInputFocado(null)} keyboardAppearance="dark" />
              </View>
            </View>
          </View>

          <View style={styles.targetWeightBox}>
            <View style={styles.targetIconBox}>
              <Ionicons name="flag" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.targetTitle}>Sua Meta de Peso (kg)</Text>
              <TextInput style={[styles.targetInput, Platform.OS === 'web' && { outlineStyle: "none" as any }]} placeholder="Ex: 70.0" placeholderTextColor="#555" keyboardType="decimal-pad" maxLength={5} value={state.metaPeso} onChangeText={actions.formatarMetaPeso} keyboardAppearance="dark" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btnRaioX} onPress={actions.abrirRaioX} activeOpacity={0.8}>
          <View style={styles.btnRaioXIconBox}>
            <Ionicons name={state.temPersonal ? "lock-closed" : "analytics"} size={20} color={state.temPersonal ? "#FF3B30" : theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.btnRaioXTitle}>Meu Raio-X de Treino</Text>
            <Text style={styles.btnRaioXDesc}>
              {state.temPersonal 
                ? "Preferências de Match blindadas (Contrato Ativo)" 
                : "Veja as diretrizes do seu perfil comportamental"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSalvar} onPress={actions.handleSalvar} disabled={state.salvando} activeOpacity={0.85}>
          <LinearGradient colors={["#FF8C00", "#FF5500"]} style={styles.btnGradient}>
            {state.salvando ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <><Text style={styles.btnSalvarText}>Atualizar Perfil</Text><Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginLeft: 8 }} /></>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202", position: "relative" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#020202" },

  glowTopLeft: { position: "absolute", top: verticalScale(-80), left: scale(-80), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: theme.colors.primary, opacity: 0.12},
  glowBottomRight: { position: "absolute", bottom: verticalScale(-80), right: scale(-80), width: scale(350), height: scale(350), borderRadius: scale(175), backgroundColor: theme.colors.primary, opacity: 0.08},

  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(40), paddingBottom: verticalScale(15), paddingHorizontal: scale(20), borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  btnVoltar: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  btnSair: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: "rgba(255,59,48,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,59,48,0.2)" },
  headerTitle: { color: theme.colors.primary, fontSize: moderateScale(13), fontWeight: "900", letterSpacing: 1.5 },

  content: { padding: scale(24), paddingTop: Platform.OS === "ios" ? verticalScale(120) : verticalScale(100), paddingBottom: verticalScale(60) },

  photoSection: { alignItems: "center", marginBottom: verticalScale(25), marginTop: verticalScale(10) },
  avatarContainer: { position: "relative", shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  avatarRing: { padding: scale(3), borderRadius: moderateScale(60) },
  avatarImage: { width: scale(110), height: scale(110), borderRadius: moderateScale(55), borderWidth: 3, borderColor: "#020202", backgroundColor: "#111" },
  cameraBadge: { position: "absolute", bottom: verticalScale(0), right: scale(0), backgroundColor: theme.colors.primary, width: scale(34), height: scale(34), borderRadius: moderateScale(17), justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#020202" },
  userNameDisplay: { color: "#FFF", fontSize: moderateScale(22), fontFamily: theme.fonts.title, marginTop: verticalScale(12), letterSpacing: 0.5 },
  userSubtitle: { color: "#888", fontSize: moderateScale(13), marginTop: verticalScale(2) },

  cardGeral: { backgroundColor: "#0A0A0A", borderWidth: 1, borderColor: "#1A1A1A", borderRadius: moderateScale(24), padding: scale(20), marginBottom: verticalScale(20) },
  cardHeaderBox: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(20) },
  iconHeaderWrapper: { width: scale(32), height: scale(32), borderRadius: moderateScale(10), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(10), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.2)" },
  cardHeaderTitle: { color: "#FFF", fontSize: moderateScale(16), fontFamily: theme.fonts.title, letterSpacing: 0.3 },

  formGroup: { marginBottom: verticalScale(18) },
  row: { flexDirection: "row" },
  label: { color: "#888", fontSize: moderateScale(11), fontWeight: "800", marginBottom: verticalScale(8), marginLeft: scale(4), textTransform: "uppercase", letterSpacing: 1 },

  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderWidth: 1, borderColor: "#222", borderRadius: moderateScale(16), overflow: "hidden", height: verticalScale(55) },
  inputContainerFocused: { borderColor: theme.colors.primary, backgroundColor: "rgba(255, 107, 0, 0.05)" },
  inputIcon: { marginLeft: scale(16), marginRight: scale(10) },
  input: { flex: 1, color: "#FFF", fontSize: moderateScale(15), paddingRight: scale(16), fontFamily: theme.fonts.body },
  inputLocation: { flex: 1, color: "#FFF", fontSize: moderateScale(15), paddingHorizontal: scale(16), fontFamily: theme.fonts.body },
  inputHalf: { flex: 1, color: "#FFF", fontSize: moderateScale(15), paddingRight: scale(10), fontFamily: theme.fonts.body },

  btnLocationPremium: { backgroundColor: "rgba(255, 107, 0, 0.05)", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: verticalScale(14), borderRadius: moderateScale(16), marginBottom: verticalScale(20), borderWidth: 1, borderColor: "rgba(255, 107, 0, 0.3)" },
  btnLocationText: { color: theme.colors.primary, fontSize: moderateScale(14), fontWeight: "900", marginLeft: scale(8) },
  
  divider: { height: 1, backgroundColor: "#1A1A1A", marginVertical: verticalScale(15), marginHorizontal: scale(-20) },

  targetWeightBox: { flexDirection: "row", backgroundColor: "#121212", borderRadius: moderateScale(16), padding: scale(16), borderWidth: 1, borderColor: "#222", alignItems: "center", marginTop: verticalScale(10) },
  targetIconBox: { width: scale(40), height: scale(40), borderRadius: moderateScale(10), backgroundColor: "rgba(255, 107, 0, 0.1)", justifyContent: "center", alignItems: "center", marginRight: scale(16), borderWidth: 1, borderColor: "rgba(255,107,0,0.2)" },
  targetTitle: { color: "#888", fontSize: moderateScale(11), fontWeight: "800", marginBottom: verticalScale(4), textTransform: "uppercase", letterSpacing: 1 },
  targetInput: { color: "#FFF", fontSize: moderateScale(18), fontWeight: "900", backgroundColor: "transparent" },

  btnRaioX: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", padding: scale(16), borderRadius: moderateScale(20), borderWidth: 1, borderColor: "#222", marginBottom: verticalScale(20) },
  btnRaioXIconBox: { width: scale(44), height: scale(44), borderRadius: moderateScale(12), backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center", marginRight: scale(14) },
  btnRaioXTitle: { color: "#FFF", fontSize: moderateScale(15), fontWeight: "bold", marginBottom: verticalScale(4) },
  btnRaioXDesc: { color: "#888", fontSize: moderateScale(12), lineHeight: moderateScale(16) },

  btnSalvar: { borderRadius: moderateScale(18), shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  btnGradient: { flexDirection: "row", height: verticalScale(60), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center" },
  btnSalvarText: { color: "#000", fontSize: moderateScale(15), fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
});