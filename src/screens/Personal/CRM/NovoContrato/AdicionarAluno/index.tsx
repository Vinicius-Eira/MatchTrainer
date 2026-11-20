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
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "../../../../../theme/theme";
import { moderateScale } from "../../../../../utils/responsive";

import { useAdicionarAluno } from "./useAdicionarAluno";
import { ModalRevisaoIA } from "../components/ModalRevisaoIA";
import { conviteModalStyles, frequenciaList, styles } from "./styles";

const OPCOES_MODALIDADE_ALUNO = [
  { id: "Consultoria" as const, label: "Consultoria", icon: "phone-portrait-outline" as any },
  { id: "Presencial" as const, label: "Presencial", icon: "barbell-outline" as any },
];

export function AdicionarAluno({ route, navigation }: any) {
  const { state, actions } = useAdicionarAluno(route, navigation);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <BlurView intensity={Platform.OS === "ios" ? 60 : 100} tint="dark" style={styles.headerGlass}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close" size={moderateScale(20)} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{state.planoAtivo ? "Ajuste de Plano" : "Gerar Convite"}</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            <View style={styles.heroSection}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="file-document-edit-outline" size={moderateScale(32)} color={theme.colors.primary} />
              </View>

              <Text style={styles.title}>
                {state.planoAtivo ? "Atualizar " : "Cadastrar "}
                <Text style={styles.titleHighlight}>{state.planoAtivo ? "Valores." : "Lead."}</Text>
              </Text>
              <Text style={styles.subtitle}>
                {state.planoAtivo
                  ? "Modifique detalhadamente a sua proposta."
                  : "Configure a proposta. O aluno receberá um convite exclusivo (código) com todos os termos para assinar."}
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Identificação</Text>
            </View>

            <View style={styles.inputGroup}>
              <View
                style={[
                  styles.inputWrapper,
                  state.inputFocado === "nome" && styles.inputWrapperFocused,
                  state.leadInjetado && { opacity: 0.5 },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={moderateScale(18)}
                  color={state.inputFocado === "nome" ? theme.colors.primary : "rgba(255, 107, 0, 0.4)"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nome do aluno"
                  placeholderTextColor="#555"
                  value={state.nome}
                  onChangeText={actions.setNome}
                  onFocus={() => actions.setInputFocado("nome")}
                  onBlur={() => actions.setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  editable={!state.leadInjetado}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  state.inputFocado === "email" && styles.inputWrapperFocused,
                  state.leadInjetado && { opacity: 0.5 },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={moderateScale(18)}
                  color={state.inputFocado === "email" ? theme.colors.primary : "rgba(255, 107, 0, 0.4)"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail do aluno"
                  placeholderTextColor="#555"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={state.email}
                  onChangeText={actions.setEmail}
                  onFocus={() => actions.setInputFocado("email")}
                  onBlur={() => actions.setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                  editable={!state.leadInjetado}
                />
              </View>
            </View>

            {state.exibirSeletorModalidade && (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionDot} />
                  <Text style={styles.sectionTitle}>Modalidade do Aluno</Text>
                </View>

                <View style={styles.modalityContainer}>
                  {OPCOES_MODALIDADE_ALUNO.map((opcao) => {
                    const isSelected = state.modalidade === opcao.id;
                    const iconColor = isSelected ? theme.colors.primary : "rgba(255, 107, 0, 0.4)";

                    return (
                      <TouchableOpacity
                        key={opcao.id}
                        style={[styles.modalityCard, isSelected && styles.modalityCardActive]}
                        onPress={() => actions.setModalidade(opcao.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={opcao.icon} size={moderateScale(24)} color={iconColor} />
                        <Text style={[styles.modalityText, isSelected && styles.modalityTextActive]}>{opcao.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionDot, { backgroundColor: "#00E676", shadowColor: "#00E676" }]} />
                <Text style={styles.sectionTitle}>Fechamento Comercial</Text>
              </View>
              <TouchableOpacity onPress={actions.mostrarAjudaFinanceiro} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="information-circle-outline" size={moderateScale(22)} color="#00E676" />
              </TouchableOpacity>
            </View>

            <View style={styles.financeBox}>
              <View style={styles.financeHero}>
                <Text style={styles.financeLabelCenter}>Valor do Contrato</Text>
                <View style={styles.financeInputRow}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.hugeInput}
                    placeholder="0,00"
                    placeholderTextColor="#333"
                    keyboardType="numeric"
                    value={state.mensalidade}
                    onChangeText={actions.handleMoneyChange}
                    cursorColor="#00E676"
                    keyboardAppearance="dark"
                  />
                </View>
              </View>

              <Text style={styles.pillLabel}>Ciclo de Cobrança</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                {frequenciaList.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.pill, state.frequencia === item.id && styles.pillActive]}
                    onPress={() => actions.setFrequencia(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, state.frequencia === item.id && styles.pillTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.pillLabel, { marginTop: 10 }]}>Vencimento Base</Text>
              <View style={styles.chipsContainerWrap}>
                {["05", "10", "20"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.vencimentoChip, state.vencimento === item && styles.pillActive]}
                    onPress={() => actions.handleVencimentoSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, state.vencimento === item && styles.pillTextActive]}>Dia {item}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.vencimentoChip, state.vencimento === "Outro" && styles.pillActive]}
                  onPress={() => actions.handleVencimentoSelect("Outro")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, state.vencimento === "Outro" && styles.pillTextActive]}>Personalizar</Text>
                </TouchableOpacity>
              </View>

              {state.vencimento === "Outro" && (
                <View style={[styles.inputWrapper, { marginTop: 15, backgroundColor: "rgba(0,0,0,0.4)", borderColor: "rgba(0, 230, 118, 0.3)" }]}>
                  <Ionicons name="calendar" size={moderateScale(18)} color="#00E676" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o dia (1 a 31)"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    maxLength={2}
                    value={state.vencimentoOutro}
                    onChangeText={actions.setVencimentoOutro}
                    cursorColor="#00E676"
                    keyboardAppearance="dark"
                  />
                </View>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} />
              <Text style={styles.sectionTitle}>Termos Legais</Text>
            </View>

            <View style={styles.editorHeader}>
              <Text style={styles.editorHeaderDesc}>
                Opcional: adicione cláusulas personalizadas ou importe um PDF/imagem para compor o contrato oficial.
              </Text>
              <TouchableOpacity
                style={styles.btnImportar}
                onPress={() => actions.setModalUploadVisivel(true)}
                disabled={state.isProcessandoTexto}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload" size={14} color={theme.colors.primary} />
                <Text style={styles.btnImportarText}>Importar</Text>
              </TouchableOpacity>
            </View>

            {state.documentoAnexo && (
              <View
                style={{
                  backgroundColor: "rgba(0, 230, 118, 0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(0, 230, 118, 0.28)",
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: "rgba(0, 230, 118, 0.12)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={state.documentoAnexo.mimeType === "application/pdf" ? "document-text" : "image"}
                      size={20}
                      color="#00E676"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
                      {state.documentoAnexo.nomeArquivo}
                    </Text>
                    <Text style={{ color: "#8E8E93", fontSize: 11, marginTop: 2 }}>
                      Original preservado no armazenamento seguro
                    </Text>
                  </View>
                  <TouchableOpacity onPress={actions.handleRemoverDocumento} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                    onPress={actions.handleVisualizarDocumento}
                  >
                    <Ionicons name="eye-outline" size={14} color="#FFF" />
                    <Text style={{ color: "#FFF", fontSize: 11.5, fontWeight: "700" }}>Abrir Original</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: "rgba(255, 107, 0, 0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 107, 0, 0.35)",
                    }}
                    onPress={actions.handleAnalisarDocumentoAnexo}
                    disabled={state.isProcessandoTexto}
                  >
                    <FontAwesome5 name="magic" size={12} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, fontSize: 11.5, fontWeight: "700" }}>Ler com IA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {state.isProcessandoTexto ? (
              <View style={styles.iaProcessingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.iaProcessingTitle}>Processando com segurança...</Text>
                <Text style={styles.iaProcessingStatus}>{state.statusProcessamento}</Text>
              </View>
            ) : (
              <View style={[styles.editorContainer, state.inputFocado === "obs" && styles.editorContainerFocused]}>
                <TextInput
                  style={styles.editorInput}
                  placeholder="Escreva os termos aqui ou anexe um documento..."
                  placeholderTextColor="#444"
                  multiline
                  value={state.observacoes}
                  onChangeText={actions.setObservacoes}
                  onFocus={() => actions.setInputFocado("obs")}
                  onBlur={() => actions.setInputFocado(null)}
                  cursorColor={theme.colors.primary}
                  keyboardAppearance="dark"
                />
              </View>
            )}

            {!state.isProcessandoTexto && (
              <TouchableOpacity style={styles.btnMagicIA} onPress={actions.handleMelhorarTextoManual} activeOpacity={0.8}>
                <FontAwesome5 name="magic" size={moderateScale(14)} color={theme.colors.primary} />
                <Text style={styles.btnMagicIAText}>Estruturar com I.A.</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btnFinalizar, (state.loading || state.isProcessandoTexto) && { opacity: 0.7 }]}
              onPress={actions.handleAdicionarAluno}
              disabled={state.loading || state.isProcessandoTexto}
              activeOpacity={0.9}
            >
              {state.loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={moderateScale(20)} color={theme.colors.primary} />
                  <Text style={styles.btnFinalizarText}>{state.planoAtivo ? "Salvar Ajustes" : "Gerar Código Convite"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={state.modalUploadVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => actions.setModalUploadVisivel(false)}
      >
        <View style={styles.modalUploadOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => actions.setModalUploadVisivel(false)} activeOpacity={1} />
          <View style={styles.modalUploadSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Importar Documento</Text>
            <Text style={styles.sheetSubtitle}>
              O arquivo original será preservado com segurança (PDF até 10 MB, imagem até 5 MB).
            </Text>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handlePickDocument} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.3)" }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.uploadOptionTexts}>
                <Text style={styles.uploadOptionTitle}>Arquivo Digital (PDF)</Text>
                <Text style={styles.uploadOptionDesc}>Suporta várias páginas e PDF digitalizado.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handlePickImage} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.3)" }]}>
                <Ionicons name="images" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.uploadOptionTexts}>
                <Text style={styles.uploadOptionTitle}>Imagem da Galeria (Leitura IA)</Text>
                <Text style={styles.uploadOptionDesc}>A IA lê e organiza o conteúdo para sua revisão.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadOptionBtn} onPress={actions.handleTakePicture} activeOpacity={0.7}>
              <View style={[styles.uploadOptionIcon, { backgroundColor: "rgba(255, 107, 0, 0.1)", borderColor: "rgba(255, 107, 0, 0.3)" }]}>
                <Ionicons name="camera" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.uploadOptionTexts}>
                <Text style={styles.uploadOptionTitle}>Câmera (Leitura IA)</Text>
                <Text style={styles.uploadOptionDesc}>Fotografe o documento para leitura assistida.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetBtnClose} onPress={() => actions.setModalUploadVisivel(false)} activeOpacity={0.7}>
              <Text style={styles.sheetBtnCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ModalRevisaoIA
        visible={state.modalRevisaoIAVisivel}
        resultado={state.resultadoIA}
        onAplicarTexto={actions.handleAplicarTextoIA}
        onFechar={() => actions.setModalRevisaoIAVisivel(false)}
      />

      <Modal
        visible={state.modalConviteVisivel}
        transparent
        animationType="fade"
        onRequestClose={actions.handleFecharModalConvite}
      >
        <View style={conviteModalStyles.overlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={conviteModalStyles.card}>
            <View style={conviteModalStyles.iconRing}>
              <Ionicons name="checkmark-done" size={32} color={theme.colors.primary} />
            </View>

            <Text style={conviteModalStyles.tag}>CONVITE SEGURO GERADO</Text>
            <Text style={conviteModalStyles.title}>Tudo pronto para o aluno!</Text>
            <Text style={conviteModalStyles.subtitle}>
              Envie o código abaixo para o aluno informar na tela "Já tenho um Personal" usando o e-mail autorizado.
            </Text>

            <View style={conviteModalStyles.infoBox}>
              <View style={conviteModalStyles.infoRow}>
                <Text style={conviteModalStyles.infoLabel}>ALUNO</Text>
                <Text style={conviteModalStyles.infoValue} numberOfLines={1}>
                  {state.conviteGerado?.nome}
                </Text>
              </View>

              <View style={conviteModalStyles.divider} />

              <View style={conviteModalStyles.infoRow}>
                <Text style={conviteModalStyles.infoLabel}>E-MAIL AUTORIZADO</Text>
                <Text style={conviteModalStyles.infoValue} numberOfLines={1}>
                  {state.conviteGerado?.email}
                </Text>
              </View>

              <View style={conviteModalStyles.divider} />

              <View style={conviteModalStyles.infoRow}>
                <Text style={conviteModalStyles.infoLabel}>VALIDADE</Text>
                <Text style={[conviteModalStyles.infoValue, { color: "#00E676" }]}>
                  Até {state.conviteGerado?.expiraEm}
                </Text>
              </View>
            </View>

            <View style={conviteModalStyles.codeBox}>
              <Text style={conviteModalStyles.codeLabel}>CÓDIGO DE CONVITE (USO ÚNICO)</Text>
              <Text style={conviteModalStyles.codeText} selectable>
                {state.conviteGerado?.codigo}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                conviteModalStyles.btnCopiar,
                state.codigoCopiado && conviteModalStyles.btnCopiarSucesso,
              ]}
              onPress={actions.handleCopiarCodigo}
              activeOpacity={0.85}
            >
              <Ionicons
                name={state.codigoCopiado ? "checkmark-circle" : "copy-outline"}
                size={18}
                color={state.codigoCopiado ? "#00E676" : theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  conviteModalStyles.btnCopiarText,
                  state.codigoCopiado && { color: "#00E676" },
                ]}
              >
                {state.codigoCopiado ? "Código Copiado!" : "Copiar Convite"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={conviteModalStyles.btnConcluir}
              onPress={actions.handleFecharModalConvite}
              activeOpacity={0.75}
            >
              <Text style={conviteModalStyles.btnConcluirText}>Concluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}