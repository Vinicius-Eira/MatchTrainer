import React, { ComponentRef, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../../../theme/theme";
import { DIAS_SEMANA, FORMAS_PAGAMENTO, MESES_NOME, MOTIVOS_CONGELAMENTO, PdfPreset } from "../constants";
import { styles } from "../styles";
import { FeedbackTipo } from "../useRecebimentos";

const CORES_FEEDBACK: Record<
  FeedbackTipo,
  { cor: string; bg: string; border: string; icone: any; kicker: string }
> = {
  success: {
    cor: "#00E676",
    bg: "rgba(0, 230, 118, 0.12)",
    border: "rgba(0, 230, 118, 0.45)",
    icone: "checkmark-circle-outline",
    kicker: "SUCESSO",
  },
  error: {
    cor: "#FF3B30",
    bg: "rgba(255, 59, 48, 0.12)",
    border: "rgba(255, 59, 48, 0.45)",
    icone: "alert-circle-outline",
    kicker: "ERRO",
  },
  warning: {
    cor: "#FFD700",
    bg: "rgba(255, 215, 0, 0.12)",
    border: "rgba(255, 215, 0, 0.42)",
    icone: "warning-outline",
    kicker: "ATENÇÃO",
  },
  info: {
    cor: "#FF6B00",
    bg: "rgba(255, 107, 0, 0.12)",
    border: "rgba(255, 107, 0, 0.45)",
    icone: "information-circle-outline",
    kicker: "INFORMAÇÃO",
  },
};

export function RecebimentosModals({ v }: { v: any }) {
  const reciboRef = useRef<ComponentRef<typeof View>>(null);

  const renderizarGradeCalendario = (
    ano: number,
    mes: number,
    inicioSel: Date | null,
    fimSel: Date | null,
    onPressDia: (dia: number) => void
  ) => {
    const daysInMonth = new Date(ano, mes + 1, 0).getDate();
    const firstDay = new Date(ano, mes, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calDayBox} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(ano, mes, i);
      let isSelected = false;
      let isBetween = false;

      const isToday =
        currentDate.getDate() === v.hoje.getDate() &&
        currentDate.getMonth() === v.hoje.getMonth() &&
        currentDate.getFullYear() === v.hoje.getFullYear();

      if (inicioSel && fimSel) {
        const iniZero = new Date(inicioSel.getFullYear(), inicioSel.getMonth(), inicioSel.getDate()).getTime();
        const fimZero = new Date(fimSel.getFullYear(), fimSel.getMonth(), fimSel.getDate()).getTime();
        const curZero = currentDate.getTime();
        if (curZero >= iniZero && curZero <= fimZero) {
          isSelected = true;
          if (curZero > iniZero && curZero < fimZero) isBetween = true;
        }
      } else if (inicioSel) {
        if (
          currentDate.getDate() === inicioSel.getDate() &&
          currentDate.getMonth() === inicioSel.getMonth() &&
          currentDate.getFullYear() === inicioSel.getFullYear()
        ) {
          isSelected = true;
        }
      }

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calDayBox,
            isSelected && styles.calDayBoxSelected,
            isBetween && styles.calDayBoxBetween,
            isToday && !isSelected && styles.calDayBoxToday,
          ]}
          onPress={() => onPressDia(i)}
        >
          <Text
            style={[
              styles.calDayText,
              isSelected && styles.calDayTextSelected,
              isToday && !isSelected && { color: theme.colors.primary },
            ]}
          >
            {i}
          </Text>
          {isToday && !isSelected && <View style={styles.todayDot} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const visualFeedback = CORES_FEEDBACK[v.feedbackModal.tipo as FeedbackTipo] || CORES_FEEDBACK.info;

  return (
    <>
      <Modal visible={v.modalDataVisivel} animationType="fade" transparent>
        <View style={styles.modalDataOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalDataCard}>
            <View style={styles.modalDataHeader}>
              <TouchableOpacity onPress={() => v.setTempAno(v.tempAno - 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-back" size={22} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalDataAno}>{v.tempAno}</Text>
              <TouchableOpacity onPress={() => v.setTempAno(v.tempAno + 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-forward" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {MESES_NOME.map((mes, index) => {
                const isActive = v.tempMes === index;
                return (
                  <TouchableOpacity
                    key={mes}
                    style={[styles.modalDataMesBtn, isActive && styles.modalDataMesBtnAtivo]}
                    onPress={() => v.selecionarMesCalendario(index)}
                  >
                    <Text style={[styles.modalDataMesText, isActive && styles.modalDataMesTextAtivo]}>{mes}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.calWeekRow}>
              {DIAS_SEMANA.map((d, i) => (
                <Text key={i} style={styles.calWeekText}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={styles.calDaysGrid}>
              {renderizarGradeCalendario(v.tempAno, v.tempMes, v.tempInicio, v.tempFim, v.selecionarDiaCalendario)}
            </View>
            <Text style={{ color: "#71717A", fontSize: 11, textAlign: "center", marginTop: 14 }}>
              Toque em 1 dia específico ou selecione a data inicial e a data final.
            </Text>
            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              <TouchableOpacity style={[styles.modalDataCloseBtn, { flex: 1 }]} onPress={() => v.setModalDataVisivel(false)}>
                <Text style={styles.modalDataCloseText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mStyles.btnNeonOutline, { flex: 1, height: 48, marginTop: 0 }]}
                onPress={v.aplicarFiltroCalendario}
                activeOpacity={0.85}
              >
                <Text style={mStyles.btnNeonOutlineText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={v.modalPdfVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => !v.gerandoPdf && v.setModalPdfVisivel(false)}
      >
        <View style={styles.modalDataOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalPdfCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.pdfModalSubTag}>EXTRATO FINANCEIRO</Text>
                <Text style={styles.modalTitle}>Exportar Relatório (PDF)</Text>
              </View>
              <TouchableOpacity
                onPress={() => v.setModalPdfVisivel(false)}
                disabled={v.gerandoPdf}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.pdfPresetRow}>
              {[
                { id: "hoje", label: "Hoje" },
                { id: "ultimos_7", label: "7 Dias" },
                { id: "mes_atual", label: "Mês Atual" },
                { id: "personalizado", label: "Período" },
              ].map((opt) => {
                const active = v.pdfPreset === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.pdfPresetChip, active && styles.pdfPresetChipActive]}
                    onPress={() => v.selecionarPresetPdf(opt.id as PdfPreset)}
                  >
                    <Text style={[styles.pdfPresetChipText, active && styles.pdfPresetChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.pdfRangeSummary}>
              <View style={styles.pdfRangeBox}>
                <Text style={styles.pdfRangeLabel}>DATA INICIAL</Text>
                <Text style={styles.pdfRangeValue}>{v.formatDDMMYYYY(v.pdfInicio)}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#FF6B00" />
              <View style={styles.pdfRangeBox}>
                <Text style={styles.pdfRangeLabel}>DATA FINAL</Text>
                <Text style={styles.pdfRangeValue}>{v.formatDDMMYYYY(v.pdfFim || v.pdfInicio)}</Text>
              </View>
            </View>

            <View style={styles.modalDataHeader}>
              <TouchableOpacity onPress={() => v.setPdfAno(v.pdfAno - 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-back" size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalDataAno}>{v.pdfAno}</Text>
              <TouchableOpacity onPress={() => v.setPdfAno(v.pdfAno + 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {MESES_NOME.map((mes, index) => {
                const isActive = v.pdfMes === index;
                return (
                  <TouchableOpacity
                    key={mes}
                    style={[styles.modalDataMesBtn, isActive && styles.modalDataMesBtnAtivo]}
                    onPress={() => v.selecionarMesPdf(index)}
                  >
                    <Text style={[styles.modalDataMesText, isActive && styles.modalDataMesTextAtivo]}>{mes}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.calWeekRow}>
              {DIAS_SEMANA.map((d, i) => (
                <Text key={i} style={styles.calWeekText}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={styles.calDaysGrid}>
              {renderizarGradeCalendario(v.pdfAno, v.pdfMes, v.pdfInicio, v.pdfFim, v.selecionarDiaPdf)}
            </View>

            <TouchableOpacity
              style={[mStyles.btnNeonOutline, v.gerandoPdf && { opacity: 0.65 }]}
              onPress={v.exportarPdfPeriodo}
              disabled={v.gerandoPdf}
              activeOpacity={0.85}
            >
              {v.gerandoPdf ? (
                <>
                  <ActivityIndicator size="small" color="#FF6B00" />
                  <Text style={mStyles.btnNeonOutlineText}>Gerando Extrato...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={19} color="#FF6B00" />
                  <Text style={mStyles.btnNeonOutlineText}>Gerar Extrato PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={v.modalBaixaVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            {v.etapaBaixa === 1 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Registrar Pagamento</Text>
                  <TouchableOpacity onPress={() => v.setModalBaixaVisivel(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                {v.faturaSelecionada && (
                  <View style={styles.modalAlunoInfo}>
                    {v.faturaSelecionada.foto ? (
                      <Image source={{ uri: v.faturaSelecionada.foto }} style={styles.modalAvatar} />
                    ) : (
                      <View style={[styles.modalAvatar, { backgroundColor: "#222", justifyContent: "center", alignItems: "center" }]}>
                        <Ionicons name="person" size={18} color="#666" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.modalAlunoNome}>{v.faturaSelecionada.nome}</Text>
                      <Text style={styles.modalAlunoDetalhe}>Venc: {v.faturaSelecionada.dataExibicao}</Text>
                    </View>
                  </View>
                )}
                <Text style={styles.inputLabel}>Valor Recebido (R$)</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputPrefix}>R$</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={v.valorInput}
                    onChangeText={v.setValorInput}
                    cursorColor="#FF6B00"
                  />
                </View>
                <Text style={styles.inputLabel}>Forma de Pagamento</Text>
                <View style={styles.chipContainer}>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chipBtn, v.formaPgto === f && styles.chipBtnAtiva]}
                      onPress={() => v.setFormaPgto(f)}
                    >
                      <Text style={[styles.chipText, v.formaPgto === f && styles.chipTextAtiva]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Observações (Opcional)</Text>
                <View style={[styles.inputBox, { height: 80, paddingTop: 12 }]}>
                  <TextInput
                    style={[styles.input, { textAlignVertical: "top" }]}
                    multiline
                    value={v.observacao}
                    onChangeText={v.setObservacao}
                    cursorColor="#FF6B00"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.btnConfirmar, v.processando && { opacity: 0.7 }]}
                  onPress={v.confirmarBaixaManual}
                  disabled={v.processando}
                >
                  {v.processando ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginRight: 8 }} />
                      <Text style={styles.btnConfirmarText}>Confirmar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {v.etapaBaixa === 2 && (
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={{ color: "#FFF", fontSize: 22, fontFamily: theme.fonts.title, marginBottom: 18 }}>
                  Pagamento Confirmado!
                </Text>
                <View ref={reciboRef} collapsable={false} style={styles.reciboPremiumContainer}>
                  <LinearGradient colors={["#1A1A1A", "#0D0D0D"]} style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} />
                  <Ionicons name="shield-checkmark" size={150} color="rgba(255, 255, 255, 0.03)" style={styles.watermarkIcon} />
                  <View style={styles.reciboPremiumHeader}>
                    <View style={styles.iconSuccessBg}>
                      <Ionicons name="checkmark-sharp" size={28} color="#00E676" />
                    </View>
                    <Text style={styles.reciboPremiumTitle}>RECIBO DIGITAL</Text>
                    <Text style={styles.reciboPremiumSubtitle}>{new Date().toLocaleString("pt-BR")}</Text>
                  </View>
                  <View style={styles.dashedLine} />
                  <View style={styles.reciboPremiumBody}>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>De (Aluno)</Text>
                      <Text style={styles.reciboPremiumValue}>{v.faturaSelecionada?.nome}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Para</Text>
                      <Text style={styles.reciboPremiumValue}>{v.nomePersonal}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Método</Text>
                      <Text style={styles.reciboPremiumValue}>{v.formaPgto}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Vencimento</Text>
                      <Text style={styles.reciboPremiumValue}>{v.faturaSelecionada?.dataExibicao}</Text>
                    </View>
                  </View>
                  <View style={styles.dashedLine} />
                  <View style={styles.reciboPremiumFooter}>
                    <Text style={styles.reciboPremiumTotalLabel}>TOTAL PAGO</Text>
                    <Text style={styles.reciboPremiumTotalValue}>R$ {v.valorInput}</Text>
                  </View>
                  <View style={styles.reciboPremiumBottomBrand}>
                    <Ionicons name="flash" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.reciboPremiumBrandText}>Gerado por MatchTrainer</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.btnSharePremium}
                  onPress={() => v.compartilharReciboImage(reciboRef)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#0A84FF", "#0066CC"]} style={styles.btnShareGradient}>
                    <Ionicons name="share-social" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnShareText}>Compartilhar Recibo</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnVoltarRecibo} onPress={() => v.setModalBaixaVisivel(false)}>
                  <Text style={styles.btnVoltarReciboText}>Voltar ao Painel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={v.modalCongelarVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Congelar Contrato</Text>
              <TouchableOpacity onPress={() => v.setModalCongelarVisivel(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Buscar Aluno</Text>
            <View style={styles.searchBarBox}>
              <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="Digite o nome do aluno..."
                placeholderTextColor="#666"
                value={v.buscaAlunoCongelar}
                onChangeText={v.setBuscaAlunoCongelar}
              />
            </View>
            <ScrollView style={styles.listAlunosScroll} nestedScrollEnabled>
              {v.alunosCongelarFiltrados.length === 0 ? (
                <Text style={{ color: "#666", textAlign: "center", marginTop: 20 }}>Nenhum aluno ativo encontrado.</Text>
              ) : (
                v.alunosCongelarFiltrados.map((aluno: any) => (
                  <TouchableOpacity
                    key={aluno.id}
                    style={[
                      styles.alunoListItem,
                      v.alunoSelecionadoId === aluno.id && {
                        borderColor: "#0A84FF",
                        backgroundColor: "rgba(10,132,255,0.1)",
                      },
                    ]}
                    onPress={() => v.setAlunoSelecionadoId(aluno.id)}
                  >
                    {aluno.foto ? (
                      <Image source={{ uri: aluno.foto }} style={styles.alunoListAvatar} />
                    ) : (
                      <View style={[styles.alunoListAvatar, { justifyContent: "center", alignItems: "center" }]}>
                        <Ionicons name="person" size={16} color="#666" />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.alunoListNome,
                        v.alunoSelecionadoId === aluno.id && { color: "#0A84FF", fontWeight: "bold" },
                      ]}
                      numberOfLines={1}
                    >
                      {aluno.nome}
                    </Text>
                    {v.alunoSelecionadoId === aluno.id && <Ionicons name="checkmark-circle" size={20} color="#0A84FF" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={styles.inputLabel}>Motivo da Pausa</Text>
            <View style={styles.chipContainer}>
              {MOTIVOS_CONGELAMENTO.map((mot) => (
                <TouchableOpacity
                  key={mot}
                  style={[
                    styles.chipBtn,
                    v.motivoPausa === mot && { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.15)" },
                  ]}
                  onPress={() => v.setMotivoPausa(mot)}
                >
                  <Text style={[styles.chipText, v.motivoPausa === mot && { color: "#0A84FF" }]}>{mot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {v.motivoPausa === "Outro" && (
              <View style={[styles.inputBox, { height: 60, marginBottom: 20 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Descreva o motivo (Ex: Cirurgia)..."
                  placeholderTextColor="#666"
                  value={v.textoOutroMotivo}
                  onChangeText={v.setTextoOutroMotivo}
                  cursorColor="#0A84FF"
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Dias Pausados</Text>
                <View style={[styles.inputBox, { marginBottom: 0 }]}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={v.diasPausa}
                    onChangeText={v.setDiasPausa}
                    cursorColor="#0A84FF"
                  />
                  <Text style={styles.inputPrefix}>Dias</Text>
                </View>
              </View>
              <View style={mStyles.retornoBox}>
                <Text style={mStyles.retornoLabel}>Retorno em</Text>
                <Text style={mStyles.retornoValue}>{v.dataRetornoCalculada}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[mStyles.btnBlueOutline, v.processando && { opacity: 0.7 }]}
              onPress={v.confirmarCongelamento}
              disabled={v.processando}
              activeOpacity={0.85}
            >
              {v.processando ? (
                <ActivityIndicator color="#0A84FF" />
              ) : (
                <>
                  <Ionicons name="snow" size={19} color="#0A84FF" />
                  <Text style={mStyles.btnBlueOutlineText}>Congelar Plano</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={Boolean(v.modalCongelamentoSucesso.visivel)}
        transparent
        animationType="fade"
        onRequestClose={() => v.setModalCongelamentoSucesso((prev: any) => ({ ...prev, visivel: false }))}
      >
        <View style={mStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[mStyles.card, { borderColor: "rgba(10, 132, 255, 0.48)" }]}>
            <View
              style={[
                mStyles.iconRing,
                { backgroundColor: "rgba(10, 132, 255, 0.14)", borderColor: "rgba(10, 132, 255, 0.5)" },
              ]}
            >
              <Ionicons name="snow" size={32} color="#0A84FF" />
            </View>
            <Text style={[mStyles.kicker, { color: "#0A84FF" }]}>PLANO PAUSADO</Text>
            <Text style={mStyles.title}>Plano congelado!</Text>
            <Text style={mStyles.subtitle}>
              O contrato de <Text style={{ color: "#FFF", fontWeight: "800" }}>{v.modalCongelamentoSucesso.nomeAluno}</Text>{" "}
              ficará pausado somente no período escolhido e retorna ao normal nos meses seguintes.
            </Text>

            <View style={mStyles.summaryBox}>
              <View style={mStyles.summaryRow}>
                <Text style={mStyles.summaryLbl}>Período</Text>
                <Text style={mStyles.summaryVal}>{v.modalCongelamentoSucesso.dias} dias</Text>
              </View>
              <View style={mStyles.summaryDiv} />
              <View style={mStyles.summaryRow}>
                <Text style={mStyles.summaryLbl}>Retorno Automático</Text>
                <Text style={[mStyles.summaryVal, { color: "#0A84FF" }]}>{v.modalCongelamentoSucesso.dataRetorno}</Text>
              </View>
              <View style={mStyles.summaryDiv} />
              <View style={mStyles.summaryRow}>
                <Text style={mStyles.summaryLbl}>Motivo</Text>
                <Text style={mStyles.summaryVal}>{v.modalCongelamentoSucesso.motivo}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={mStyles.btnBlueOutline}
              onPress={() => v.setModalCongelamentoSucesso((prev: any) => ({ ...prev, visivel: false }))}
              activeOpacity={0.85}
            >
              <Text style={mStyles.btnBlueOutlineText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(v.feedbackModal.visivel)} transparent animationType="fade" onRequestClose={v.fecharFeedback}>
        <View style={mStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[mStyles.card, { borderColor: visualFeedback.border }]}>
            <View
              style={[
                mStyles.iconRing,
                { backgroundColor: visualFeedback.bg, borderColor: visualFeedback.border },
              ]}
            >
              <Ionicons name={visualFeedback.icone} size={34} color={visualFeedback.cor} />
            </View>
            <Text style={[mStyles.kicker, { color: visualFeedback.cor }]}>
              {v.feedbackModal.kicker || visualFeedback.kicker}
            </Text>
            <Text style={mStyles.title}>{v.feedbackModal.titulo}</Text>
            <Text style={mStyles.subtitle}>{v.feedbackModal.mensagem}</Text>

            <TouchableOpacity
              style={[
                mStyles.btnFeedback,
                { backgroundColor: visualFeedback.bg, borderColor: visualFeedback.cor },
              ]}
              onPress={v.fecharFeedback}
              activeOpacity={0.85}
            >
              <Text style={[mStyles.btnFeedbackText, { color: visualFeedback.cor }]}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(v.confirmModal.visivel)} transparent animationType="fade" onRequestClose={v.fecharConfirm}>
        <View style={mStyles.overlay}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          <View
            style={[
              mStyles.card,
              {
                borderColor: v.confirmModal.perigoso ? "rgba(255, 59, 48, 0.45)" : "rgba(0, 230, 118, 0.45)",
              },
            ]}
          >
            <View
              style={[
                mStyles.iconRing,
                v.confirmModal.perigoso
                  ? { backgroundColor: "rgba(255, 59, 48, 0.12)", borderColor: "rgba(255, 59, 48, 0.48)" }
                  : { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.48)" },
              ]}
            >
              <MaterialCommunityIcons
                name={v.confirmModal.perigoso ? "lock-alert-outline" : "lock-open-check-outline"}
                size={32}
                color={v.confirmModal.perigoso ? "#FF3B30" : "#00E676"}
              />
            </View>
            <Text style={[mStyles.kicker, { color: v.confirmModal.perigoso ? "#FF3B30" : "#00E676" }]}>
              CONTROLE DE ACESSO
            </Text>
            <Text style={mStyles.title}>{v.confirmModal.titulo}</Text>
            <Text style={mStyles.subtitle}>{v.confirmModal.mensagem}</Text>

            <View style={mStyles.confirmRow}>
              <TouchableOpacity style={mStyles.btnCancel} onPress={v.fecharConfirm} activeOpacity={0.8}>
                <Text style={mStyles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  mStyles.btnConfirmAction,
                  v.confirmModal.perigoso
                    ? { backgroundColor: "rgba(255, 59, 48, 0.14)", borderColor: "#FF3B30" }
                    : { backgroundColor: "rgba(0, 230, 118, 0.14)", borderColor: "#00E676" },
                ]}
                onPress={v.executarConfirm}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    mStyles.btnFeedbackText,
                    { color: v.confirmModal.perigoso ? "#FF3B30" : "#00E676" },
                  ]}
                  numberOfLines={1}
                >
                  {v.confirmModal.textoConfirmar}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const mStyles = StyleSheet.create({
  btnNeonOutline: {
    marginTop: 18,
    height: 52,
    borderRadius: 15,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderWidth: 1.5,
    borderColor: "#FF6B00",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  btnNeonOutlineText: {
    color: "#FF6B00",
    fontSize: 13.5,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  btnBlueOutline: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(10, 132, 255, 0.13)",
    borderWidth: 1.4,
    borderColor: "#0A84FF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  btnBlueOutlineText: {
    color: "#0A84FF",
    fontSize: 13.5,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  retornoBox: {
    flex: 1,
    backgroundColor: "#14141D",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.35)",
    height: 56,
    marginTop: 22,
    justifyContent: "center",
  },
  retornoLabel: { color: "#8E8E93", fontSize: 10, textTransform: "uppercase", fontWeight: "800" },
  retornoValue: { color: "#0A84FF", fontSize: 15, fontWeight: "900", marginTop: 2 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    backgroundColor: "#0B0B11",
    borderRadius: 26,
    padding: 24,
    borderWidth: 1.4,
    alignItems: "center",
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: theme.fonts.title,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 20,
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#12121B",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20202E",
    marginBottom: 20,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  summaryDiv: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.06)", marginVertical: 6 },
  summaryLbl: { color: "#8E8E93", fontSize: 12, fontWeight: "700" },
  summaryVal: { color: "#FFF", fontSize: 12.5, fontWeight: "800" },

  btnFeedback: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1.4,
    justifyContent: "center",
    alignItems: "center",
  },
  btnFeedbackText: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  confirmRow: { flexDirection: "row", width: "100%", gap: 10 },
  btnCancel: {
    flex: 0.85,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#14141D",
    borderWidth: 1,
    borderColor: "#262636",
    justifyContent: "center",
    alignItems: "center",
  },
  btnCancelText: { color: "#E4E4E7", fontSize: 13, fontWeight: "800" },
  btnConfirmAction: {
    flex: 1.15,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
});