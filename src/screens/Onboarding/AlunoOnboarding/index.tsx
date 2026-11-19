import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../theme/theme";

import { useMiniOnboarding } from "./useMiniOnboarding";
import { styles } from "./styles";

export function MiniOnboarding({ route, navigation }: any) {
  const { state, actions } = useMiniOnboarding(route, navigation);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      <View style={styles.glowTop} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.btnBack, state.step === 1 && { opacity: 0 }]}
          onPress={() => state.step > 1 && actions.setStep(state.step - 1)}
          disabled={state.step === 1}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.progressWrapper}>
          <Text style={styles.stepText}>
            ETAPA {state.step} DE {state.totalPassos}
          </Text>
          <View style={styles.progressContainer}>
            <LinearGradient
              colors={[theme.colors.primary, "#FF8C00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${(state.step / state.totalPassos) * 100}%` }]}
            />
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {state.step === 1 && (
          <View style={styles.stepContainerCenter}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              {state.personalInfo?.foto_url ? (
                <Image source={{ uri: state.personalInfo.foto_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#333" />
                </View>
              )}
              <View style={styles.badgeSuccess}>
                <Ionicons name="checkmark-sharp" size={16} color="#000" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Conexão <Text style={styles.titleHighlight}>Estabelecida</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Você acaba de se conectar ao time do treinador{" "}
              <Text style={styles.highlight}>{state.personalInfo?.nome?.split(" ")[0] || "Personal"}</Text>.
            </Text>

            <View style={styles.photoSection}>
              <Text style={styles.featuresTitle}>Sua Foto de Perfil (Opcional)</Text>
              <TouchableOpacity style={styles.photoBtn} onPress={actions.handlePickImage} activeOpacity={0.8}>
                {state.fotoAluno ? (
                  <Image source={{ uri: state.fotoAluno }} style={styles.photoSelected} />
                ) : (
                  <View style={styles.photoPlaceholderUI}>
                    <Ionicons name="camera" size={28} color="#888" />
                  </View>
                )}
                <Text style={styles.photoBtnText}>{state.fotoAluno ? "Alterar Foto" : "Selecionar Foto"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Rápido e direto ao ponto</Text>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="body" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Dados Básicos e Contato</Text>
                  <Text style={styles.featureItemDesc}>Informações essenciais para sua ficha e comunicação rápida.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Segurança e Saúde</Text>
                  <Text style={styles.featureItemDesc}>Confirme se há alguma dor, lesão ou restrição médica.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureItemTitle}>Revisão do Contrato</Text>
                  <Text style={styles.featureItemDesc}>Confira os valores e termos do seu treinador para liberar os treinos.</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {state.step === 2 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>
              Dados e <Text style={styles.titleHighlight}>Contato</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Apenas o essencial para sua ficha de acompanhamento com seu Personal.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Onde você mora?</Text>
              <View style={[styles.inputBox, state.inputFocado === "cidade" && styles.inputBoxFocused]}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={state.inputFocado === "cidade" ? theme.colors.primary : "#666"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: São Paulo, SP"
                  placeholderTextColor="#555"
                  autoCapitalize="words"
                  value={state.cidade}
                  onChangeText={actions.setCidade}
                  onFocus={() => actions.setInputFocado("cidade")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nascimento</Text>
                <View style={[styles.inputBox, state.inputFocado === "nasc" && styles.inputBoxFocused]}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={state.inputFocado === "nasc" ? theme.colors.primary : "#666"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={10}
                    value={state.dataNascimento}
                    onChangeText={actions.formatarData}
                    onFocus={() => actions.setInputFocado("nasc")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>WhatsApp</Text>
                <View style={[styles.inputBox, state.inputFocado === "whats" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons
                    name="whatsapp"
                    size={18}
                    color={state.inputFocado === "whats" ? theme.colors.primary : "#666"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="(00) 00000"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={state.telefone}
                    onChangeText={actions.formatarWhatsApp}
                    onFocus={() => actions.setInputFocado("whats")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.label}>Biometria Atual</Text>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={[styles.inputBox, state.inputFocado === "altura" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons
                    name="human-male-height"
                    size={20}
                    color={state.inputFocado === "altura" ? theme.colors.primary : "#666"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Altura"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={3}
                    value={state.altura}
                    onChangeText={actions.formatarAltura}
                    onFocus={() => actions.setInputFocado("altura")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>cm</Text>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={[styles.inputBox, state.inputFocado === "peso" && styles.inputBoxFocused]}>
                  <MaterialCommunityIcons
                    name="scale-bathroom"
                    size={20}
                    color={state.inputFocado === "peso" ? theme.colors.primary : "#666"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Peso"
                    placeholderTextColor="#555"
                    keyboardType="decimal-pad"
                    maxLength={6}
                    value={state.peso}
                    onChangeText={actions.formatarPeso}
                    onFocus={() => actions.setInputFocado("peso")}
                    onBlur={() => actions.setInputFocado(null)}
                    keyboardAppearance="dark"
                  />
                  <Text style={styles.suffix}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {state.step === 3 && (
          <View style={styles.stepContainerTop}>
            <Text style={styles.sectionTitle}>
              Atenção à <Text style={styles.titleHighlight}>Saúde</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              Confirme se existe alguma limitação ou observação médica importante antes de iniciar seus treinos.
            </Text>

            <Text style={[styles.label, { textAlign: "center", marginBottom: 15 }]}>
              Possui dores crônicas, lesões ou restrição médica?
            </Text>

            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[styles.yesNoBtn, state.temRestricao === false && styles.yesNoBtnGreen]}
                onPress={() => {
                  actions.setTemRestricao(false);
                  actions.setDetalhes("");
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={state.temRestricao === false ? "#00E676" : "#444"}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.yesNoText, state.temRestricao === false && { color: "#00E676" }]}>
                  Não, nenhuma restrição
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.yesNoBtn, state.temRestricao === true && styles.yesNoBtnRed]}
                onPress={() => actions.setTemRestricao(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="alert-circle"
                  size={28}
                  color={state.temRestricao === true ? "#FF3B30" : "#444"}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.yesNoText, state.temRestricao === true && { color: "#FF3B30" }]}>
                  Sim, possuo restrição
                </Text>
              </TouchableOpacity>
            </View>

            {state.temRestricao && (
              <View style={styles.detalhesArea}>
                <Text style={styles.label}>Detalhe sua condição:</Text>
                <View style={styles.textAreaBox}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Ex: Condromalácia patelar no joelho esquerdo, dor na lombar..."
                    placeholderTextColor="#555"
                    multiline
                    keyboardAppearance="dark"
                    value={state.detalhes}
                    onChangeText={actions.setDetalhes}
                  />
                </View>
              </View>
            )}

            {state.temRestricao === false && (
              <View style={[styles.tipCard, { borderColor: "#00E676", backgroundColor: "rgba(0, 230, 118, 0.05)" }]}>
                <View style={[styles.tipIconBox, { backgroundColor: "rgba(0, 230, 118, 0.15)" }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#00E676" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tipTitle, { color: "#00E676" }]}>Tudo Certo!</Text>
                  <Text style={styles.tipDesc}>
                    Perfeito. Agora vamos para a revisão e assinatura da sua proposta comercial.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[footerBtnStyles.btnTransparentNeon, state.loading && { opacity: 0.7 }]}
          onPress={state.step === state.totalPassos ? actions.handleFinalizar : actions.handleNext}
          disabled={state.loading}
          activeOpacity={0.82}
        >
          {state.loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Text style={footerBtnStyles.btnTransparentNeonText}>
                {state.step === state.totalPassos ? "Ver Minha Proposta" : "Avançar Etapa"}
              </Text>
              <Ionicons name="arrow-forward" size={21} color={theme.colors.primary} style={{ marginLeft: 10 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const footerBtnStyles = StyleSheet.create({
  btnTransparentNeon: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255, 107, 0, 0.08)",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  btnTransparentNeonText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});