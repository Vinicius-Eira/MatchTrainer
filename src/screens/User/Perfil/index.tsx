import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../theme/theme";
import { PrivacyModal } from "./Modal";
import { styles } from "./styles";
import { usePerfilAluno } from "./usePerfilAluno";

const OPCOES_GENERO = ["Masculino", "Feminino", "Outro"];

export function PerfilAluno({ navigation }: any) {
  const { state, actions } = usePerfilAluno(navigation);
  const webOutline = Platform.OS === "web" ? { outlineStyle: "none" as any } : {};

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
        {navigation.canGoBack() ? (
          <TouchableOpacity style={styles.btnVoltar} onPress={actions.voltarSeguro} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>MEU PERFIL</Text>
        <TouchableOpacity style={styles.btnSair} onPress={actions.logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={actions.escolherFoto} style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient colors={[theme.colors.primary, "rgba(255, 107, 0, 0.2)"]} style={styles.avatarRing}>
              <Image
                source={{ uri: state.fotoUri || "https://via.placeholder.com/150" }}
                style={styles.avatarImage}
              />
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
              <Ionicons
                name="person-outline"
                size={20}
                color={state.inputFocado === "nome" ? theme.colors.primary : "#FF6B00"}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, webOutline]}
                value={state.nome}
                onChangeText={(texto: string) => actions.setNome(actions.formatarNome(texto))}
                placeholderTextColor="#666"
                placeholder="Como quer ser chamado?"
                onFocus={() => actions.setInputFocado("nome")}
                onBlur={() => actions.setInputFocado(null)}
                keyboardAppearance="dark"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Seu Gênero</Text>
            <View style={styles.chipsRow}>
              {OPCOES_GENERO.map((op) => {
                const ativo = state.genero === op;
                return (
                  <TouchableOpacity
                    key={op}
                    style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => actions.setGenero(op)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>{op}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Nascimento</Text>
              <View style={[styles.inputContainer, state.inputFocado === "nasc" && styles.inputContainerFocused]}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={state.inputFocado === "nasc" ? theme.colors.primary : "#FF6B00"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputHalf, webOutline]}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={state.dataNascimento}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#666"
                  onChangeText={actions.formatarData}
                  onFocus={() => actions.setInputFocado("nasc")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={[styles.inputContainer, state.inputFocado === "whats" && styles.inputContainerFocused]}>
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={18}
                  color={state.inputFocado === "whats" ? theme.colors.primary : "#FF6B00"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputHalf, webOutline]}
                  keyboardType="number-pad"
                  value={state.telefone}
                  onChangeText={actions.formatarWhatsApp}
                  placeholder="(00) 00000"
                  placeholderTextColor="#666"
                  onFocus={() => actions.setInputFocado("whats")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
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

          <TouchableOpacity
            style={styles.btnLocationPremium}
            onPress={actions.buscarLocalizacao}
            disabled={state.buscandoLocal}
            activeOpacity={0.8}
          >
            {state.buscandoLocal ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <MaterialCommunityIcons name="map-marker-radius" size={20} color={theme.colors.primary} />
                <Text style={styles.btnLocationText}>Sincronizar Localização Atual</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Cidade</Text>
              <View style={[styles.inputContainer, state.inputFocado === "cidade" && styles.inputContainerFocused]}>
                <TextInput
                  style={[styles.inputLocation, webOutline]}
                  value={state.cidade}
                  onChangeText={actions.setCidade}
                  placeholder="Sua cidade"
                  placeholderTextColor="#666"
                  onFocus={() => actions.setInputFocado("cidade")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Bairro</Text>
              <View style={[styles.inputContainer, state.inputFocado === "bairro" && styles.inputContainerFocused]}>
                <TextInput
                  style={[styles.inputLocation, webOutline]}
                  value={state.bairro}
                  onChangeText={actions.setBairro}
                  placeholder="Seu bairro"
                  placeholderTextColor="#666"
                  onFocus={() => actions.setInputFocado("bairro")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
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
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={18}
                  color={state.inputFocado === "peso" ? theme.colors.primary : "#FF6B00"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputHalf, webOutline]}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  value={state.peso}
                  onChangeText={actions.formatarPeso}
                  placeholder="Ex: 80.5"
                  placeholderTextColor="#666"
                  onFocus={() => actions.setInputFocado("peso")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Altura (cm)</Text>
              <View style={[styles.inputContainer, state.inputFocado === "altura" && styles.inputContainerFocused]}>
                <MaterialCommunityIcons
                  name="human-male-height"
                  size={18}
                  color={state.inputFocado === "altura" ? theme.colors.primary : "#FF6B00"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputHalf, webOutline]}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={state.altura}
                  onChangeText={actions.formatarAltura}
                  placeholder="Ex: 180"
                  placeholderTextColor="#666"
                  onFocus={() => actions.setInputFocado("altura")}
                  onBlur={() => actions.setInputFocado(null)}
                  keyboardAppearance="dark"
                />
              </View>
            </View>
          </View>

          <View style={styles.targetWeightBox}>
            <View style={styles.targetIconBox}>
              <Ionicons name="flag" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.targetTitle}>Sua Meta de Peso (kg)</Text>
              <TextInput
                style={[styles.targetInput, webOutline]}
                placeholder="Ex: 70.0"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                maxLength={5}
                value={state.metaPeso}
                onChangeText={actions.formatarMetaPeso}
                keyboardAppearance="dark"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.actionCard} onPress={actions.abrirRaioX} activeOpacity={0.8}>
          <View style={styles.actionIconBox}>
            <Ionicons
              name={state.temPersonal ? "lock-closed" : "analytics"}
              size={20}
              color={state.temPersonal ? "#FF3B30" : theme.colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Meu Raio-X de Treino</Text>
            <Text style={styles.actionDesc}>
              {state.temPersonal
                ? "Preferências de Match blindadas (Contrato Ativo)"
                : "Veja as diretrizes do seu perfil comportamental"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>

        {!state.temPersonal && (
          <TouchableOpacity style={styles.actionCard} onPress={actions.abrirEditarPreferencias} activeOpacity={0.8}>
            <View style={styles.actionIconBox}>
              <Ionicons name="options-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Ajustar Preferências do Match</Text>
              <Text style={styles.actionDesc}>Atualize objetivos, horários, modalidade ou estilo de treinador.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionCard} onPress={actions.abrirPrivacidade} activeOpacity={0.8}>
          <View style={styles.actionIconBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#00E676" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Privacidade e Dados (LGPD)</Text>
            <Text style={styles.actionDesc}>Gerencie consentimento de saúde e veja quem tem acesso ao seu perfil.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSalvar} onPress={actions.handleSalvar} disabled={state.salvando} activeOpacity={0.85}>
          <LinearGradient colors={["#FF8C00", "#FF5500"]} style={styles.btnGradient}>
            {state.salvando ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text style={styles.btnSalvarText}>Atualizar Perfil</Text>
                <Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <PrivacyModal
        visible={state.modalPrivacidadeVisivel}
        onClose={actions.fecharPrivacidade}
        carregando={state.carregandoPrivacidade}
        consentimentoSaudeAtivo={state.consentimentoSaudeAtivo}
        consentimentos={state.consentimentos}
        personalsComAcesso={state.personalsComAcesso}
        revogandoSaude={state.revogandoSaude}
        onRevogarSaude={actions.confirmarRevogarSaude}
        onAbrirTermos={actions.abrirTermos}
      />
    </KeyboardAvoidingView>
  );
}