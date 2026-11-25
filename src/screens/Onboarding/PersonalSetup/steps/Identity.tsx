import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { EXIGIR_CEDULA_CREF_NO_SETUP, validarFormatoCref } from "../../../../services/crefVerificacao";
import { theme } from "../../../../theme/theme";
import { moderateScale } from "../../../../utils/responsive";
import { OPCOES_GENERO } from "../constants";
import { styles } from "../styles";
import { ChipsSelector } from "./FormControls";

export function Identity({ state, actions }: { state: any; actions: any }) {
  const webOutline = Platform.OS === "web" ? { outlineStyle: "none" as any } : {};

  const checkCref = state.cref ? validarFormatoCref(state.cref) : null;
  const verif = state.crefVerificacao || { status: "nao_enviado", crefVerificado: false };
  const isAprovado = Boolean(verif.crefVerificado || verif.status === "aprovado");
  const isEmAnalise = !isAprovado && verif.status === "em_analise";
  const isRejeitado = !isAprovado && verif.status === "rejeitado";

  const statusBadge = isAprovado
    ? { label: "Verificado", cor: "#00E676", bg: "rgba(0, 230, 118, 0.12)", border: "rgba(0, 230, 118, 0.45)" }
    : isEmAnalise
      ? { label: "Em Análise", cor: "#FFD700", bg: "rgba(255, 215, 0, 0.12)", border: "rgba(255, 215, 0, 0.4)" }
      : isRejeitado
        ? { label: "Ajuste Necessário", cor: "#FF3B30", bg: "rgba(255, 59, 48, 0.12)", border: "rgba(255, 59, 48, 0.45)" }
        : {
            label: EXIGIR_CEDULA_CREF_NO_SETUP ? "Obrigatório" : "Pendente",
            cor: theme.colors.primary,
            bg: "rgba(255, 107, 0, 0.12)",
            border: "rgba(255, 107, 0, 0.4)",
          };

  const abrirModalUploadCref = () => {
    const validacao = validarFormatoCref(state.cref || "");
    if (!validacao.valido) {
      actions.mostrarFeedback(
        "error",
        "CREF Inválido",
        validacao.erro || "Digite seu CREF no formato oficial 000000-G/SP antes de enviar a cédula.",
        "VALIDAÇÃO CREF"
      );
      return;
    }
    if (state.crefDisponivel === false) {
      actions.mostrarFeedback(
        "error",
        "CREF Já Cadastrado",
        "Este número já está vinculado a outra conta.",
        "CREF DUPLICADO"
      );
      return;
    }
    actions.setModalUploadCrefVisivel(true);
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.mainTitle}>
          Sua <Text style={styles.titleHighlight}>Identidade.</Text>
        </Text>
        <Text style={styles.subTitle}>Os dados essenciais para o seu perfil profissional e segurança dos alunos.</Text>
      </View>

      <View style={styles.photoSection}>
        <TouchableOpacity onPress={actions.selecionarFotoPrincipal} style={styles.avatarContainer} activeOpacity={0.8}>
          {state.fotoUri ? (
            <Image source={{ uri: state.fotoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={moderateScale(46)} color="#888" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={moderateScale(16)} color="#000" />
          </View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Toque para adicionar ou trocar sua foto de perfil</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Nome Público *</Text>
        <View style={[styles.inputBox, state.inputFocado === "nome" && styles.inputBoxFocused]}>
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="Ex: Personal João Silva"
            placeholderTextColor="#666"
            value={state.nome}
            onChangeText={(t) => actions.setNome(actions.formatarNome(t))}
            onFocus={() => actions.setInputFocado("nome")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Seu Gênero *</Text>
        <ChipsSelector opcoes={OPCOES_GENERO} value={state.genero} onSelect={actions.setGenero} isSingle />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>CREF Profissional *</Text>
        <View
          style={[
            styles.inputBox,
            state.inputFocado === "cref" && styles.inputBoxFocused,
            state.crefDisponivel === false && { borderColor: "#FF3B30" },
          ]}
        >
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="000000-G/SP"
            placeholderTextColor="#666"
            autoCapitalize="characters"
            maxLength={11}
            value={state.cref}
            onChangeText={actions.handleAlterarCref}
            onFocus={() => actions.setInputFocado("cref")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
          {checkCref?.valido && state.crefDisponivel !== false ? (
            <Ionicons name="checkmark-circle" size={20} color="#00E676" />
          ) : state.crefDisponivel === false ? (
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
          ) : null}
        </View>

        {state.cref?.length > 0 && checkCref && !checkCref.valido ? (
          <View style={styles.crefFeedbackRow}>
            <Ionicons name="information-circle-outline" size={14} color="#FFD700" />
            <Text style={[styles.crefFeedbackText, { color: "#FFD700" }]}>{checkCref.erro}</Text>
          </View>
        ) : state.crefDisponivel === false ? (
          <View style={styles.crefFeedbackRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#FF3B30" />
            <Text style={[styles.crefFeedbackText, { color: "#FF3B30" }]}>
              Este CREF já está vinculado a outra conta.
            </Text>
          </View>
        ) : null}

        <View style={[styles.crefCard, isAprovado && styles.crefCardVerified]}>
          <View style={styles.crefCardHeader}>
            <View
              style={[
                styles.crefIconBox,
                isAprovado && {
                  backgroundColor: "rgba(0, 230, 118, 0.14)",
                  borderColor: "rgba(0, 230, 118, 0.45)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isAprovado ? "check-decagram" : "shield-account-outline"}
                size={20}
                color={isAprovado ? "#00E676" : theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.crefCardTitle}>Selo CREF Verificado</Text>
            </View>
            <View
              style={[
                styles.crefStatusBadge,
                { backgroundColor: statusBadge.bg, borderColor: statusBadge.border },
              ]}
            >
              <Text style={[styles.crefStatusBadgeText, { color: statusBadge.cor }]}>{statusBadge.label}</Text>
            </View>
          </View>

          <Text style={styles.crefCardDesc}>
            {isAprovado
              ? "Sua cédula profissional foi validada. O selo de confiança já aparece para os alunos no Match e no seu perfil."
              : verif.motivo ||
                "Envie uma foto da sua cédula do CREF ou o PDF do CREF Digital para ativar o selo verde de profissional verificado."}
          </Text>

          {!isAprovado ? (
            <>
              <TouchableOpacity
                style={[styles.btnVerificarCref, state.verificandoCrefIA && { opacity: 0.65 }]}
                onPress={abrirModalUploadCref}
                disabled={state.verificandoCrefIA}
                activeOpacity={0.85}
              >
                {state.verificandoCrefIA ? (
                  <>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.btnVerificarCrefText}>Validando Cédula...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.btnVerificarCrefText}>
                      {isRejeitado || isEmAnalise ? "Reenviar Cédula CREF" : "Enviar Cédula CREF"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.crefOptionalNote}>
                Armazenamento privado e criptografado • Seu documento nunca aparece para alunos.
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>WhatsApp *</Text>
        <View style={[styles.inputBox, state.inputFocado === "wpp" && styles.inputBoxFocused]}>
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="(00) 00000-0000"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={state.telefone}
            onChangeText={actions.formatarWhatsApp}
            onFocus={() => actions.setInputFocado("wpp")}
            onBlur={() => actions.setInputFocado(null)}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Localização de Atendimento *</Text>
        <TouchableOpacity
          style={styles.btnGpsRadar}
          onPress={actions.obterLocalizacaoAtual}
          disabled={state.buscandoLocalizacao}
          activeOpacity={0.8}
        >
          {state.buscandoLocalizacao ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              <MaterialCommunityIcons name="radar" size={moderateScale(20)} color={theme.colors.primary} />
              <Text style={styles.btnGpsRadarText}>Sincronizar Radar GPS</Text>
            </>
          )}
        </TouchableOpacity>
        {state.cidade || state.bairro ? (
          <View style={styles.locationResultRow}>
            <Ionicons name="location" size={14} color="#00E676" />
            <Text style={styles.locationResultText}>
              {state.cidade}
              {state.bairro ? `, ${state.bairro}` : ""}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Redes Sociais (Opcional)</Text>
        <View style={[styles.inputBox, { marginBottom: 10 }]}>
          <Ionicons name="logo-instagram" size={18} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="instagram (sem @)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={state.instagram}
            onChangeText={actions.setInstagram}
            keyboardAppearance="dark"
          />
        </View>
        <View style={styles.inputBox}>
          <FontAwesome5 name="tiktok" size={16} color="#888" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputPremium, webOutline]}
            placeholder="tiktok (sem @)"
            placeholderTextColor="#666"
            autoCapitalize="none"
            value={state.tiktok}
            onChangeText={actions.setTiktok}
            keyboardAppearance="dark"
          />
        </View>
      </View>

      <Modal
        visible={Boolean(state.modalUploadCrefVisivel)}
        transparent
        animationType="slide"
        onRequestClose={() => actions.setModalUploadCrefVisivel(false)}
      >
        <View style={styles.crefSheetOverlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => actions.setModalUploadCrefVisivel(false)}
          />
          <View style={styles.crefSheetBox}>
            <View style={styles.crefSheetHandle} />
            <Text style={styles.crefSheetTitle}>Validar Cédula CREF</Text>
            <Text style={styles.crefSheetSub}>
              Envie a frente da sua carteirinha física ou o PDF do CREF Digital. O arquivo fica privado e nunca aparece
              para os alunos.
            </Text>

            <TouchableOpacity style={styles.crefOptionBtn} onPress={actions.handleCrefCamera} activeOpacity={0.8}>
              <View style={styles.crefIconBox}>
                <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.crefOptionTitle}>Fotografar Cédula</Text>
                <Text style={styles.crefOptionDesc}>Tire uma foto nítida em local iluminado</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.crefOptionBtn} onPress={actions.handleCrefGaleria} activeOpacity={0.8}>
              <View style={styles.crefIconBox}>
                <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.crefOptionTitle}>Escolher da Galeria</Text>
                <Text style={styles.crefOptionDesc}>Imagem JPG, PNG ou print do CREF Digital</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.crefOptionBtn} onPress={actions.handleCrefPdf} activeOpacity={0.8}>
              <View style={styles.crefIconBox}>
                <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.crefOptionTitle}>Importar PDF (CREF Digital)</Text>
                <Text style={styles.crefOptionDesc}>Documento oficial baixado do app CONFEF</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.crefSheetCancel}
              onPress={() => actions.setModalUploadCrefVisivel(false)}
              activeOpacity={0.75}
            >
              <Text style={styles.crefSheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}