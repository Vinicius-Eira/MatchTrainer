import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../../../../theme/theme";

import {
  DIAS_SEMANA,
  FORMAS_PAGAMENTO,
  MESES_NOME,
  MOTIVOS_CONGELAMENTO,
  PdfPreset,
  STATUS_FILTROS,
  StatusFiltro,
} from "./constants";
import { styles } from "./styles";
import { useRecebimentos } from "./useRecebimentos";

export function Recebimentos({ navigation }: any) {
  const {
    loading,
    refreshing,
    nomePersonal,
    modalDataVisivel,
    tempAno,
    tempMes,
    tempInicio,
    tempFim,
    modalPdfVisivel,
    pdfPreset,
    pdfAno,
    pdfMes,
    pdfInicio,
    pdfFim,
    gerandoPdf,
    modalidadeAtiva,
    statusAtivo,
    buscaAlunoCongelar,
    modalBaixaVisivel,
    faturaSelecionada,
    valorInput,
    formaPgto,
    observacao,
    processando,
    etapaBaixa,
    modalCongelarVisivel,
    alunoSelecionadoId,
    motivoPausa,
    textoOutroMotivo,
    diasPausa,
    dataRetornoCalculada,
    fabAberto,
    reciboRef,
    alunosFiltrados,
    alunosCongelarFiltrados,
    totalRecebido,
    totalPendente,
    totalAtrasado,
    totalGeral,
    percRecebido,
    percAReceber,
    percAtraso,
    hoje,
    modalidadesPersonal,
    formatDDMMYYYY,

    setModalidadeAtiva,
    setStatusAtivo,
    abrirCalendarioTopo,
    selecionarMesCalendario,
    selecionarDiaCalendario,
    aplicarFiltroCalendario,
    setaMudarMesRapido,
    abrirModalPdf,
    setModalPdfVisivel,
    selecionarPresetPdf,
    setPdfAno,
    selecionarMesPdf,
    selecionarDiaPdf,
    exportarPdfPeriodo,
    alternarBloqueioAluno,
    confirmarBaixaManual,
    confirmarCongelamento,
    compartilharReciboImage,
    abrirWhatsApp,
    abrirModalBaixa,
    setTempAno,
    setModalDataVisivel,
    setFabAberto,
    setModalBaixaVisivel,
    setValorInput,
    setFormaPgto,
    setObservacao,
    setAlunoSelecionadoId,
    setModalCongelarVisivel,
    setBuscaAlunoCongelar,
    setMotivoPausa,
    setTextoOutroMotivo,
    setDiasPausa,
    onRefresh,
    textoHeaderData,
  } = useRecebimentos(navigation);

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
        currentDate.getDate() === hoje.getDate() &&
        currentDate.getMonth() === hoje.getMonth() &&
        currentDate.getFullYear() === hoje.getFullYear();

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

  const exibirFiltroModalidade = modalidadesPersonal.length > 1;
  const listaModalidadesUi = ["Todos", "Consultoria", "Presencial"];

  const formatMoedaCurta = (valor: number) =>
    `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />

      <BlurView intensity={Platform.OS === "ios" ? 80 : 100} tint="dark" style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={18} color="#FFF" style={{ marginLeft: -1 }} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              FINANCEIRO
            </Text>
            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
              Recebimentos
            </Text>
          </View>
        </View>

        <View style={styles.monthSelectorCompact}>
          <TouchableOpacity
            style={styles.monthArrowSm}
            onPress={() => setaMudarMesRapido(-1)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 4 }}
          >
            <Ionicons name="chevron-back" size={14} color="#FF6B00" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.monthCenterSm} onPress={abrirCalendarioTopo} activeOpacity={0.75}>
            <Ionicons name="calendar-outline" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
            <Text style={styles.monthTextSm} numberOfLines={1}>
              {textoHeaderData()}
            </Text>
            <Ionicons name="chevron-down" size={11} color="#FF6B00" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthArrowSm}
            onPress={() => setaMudarMesRapido(1)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 6 }}
          >
            <Ionicons name="chevron-forward" size={14} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </BlurView>

      <View style={styles.stickyFilterContainer}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

        {exibirFiltroModalidade && (
          <View style={styles.modalidadeWrapper}>
            {listaModalidadesUi.map((mod) => (
              <TouchableOpacity
                key={mod}
                style={[styles.modalidadeBtn, modalidadeAtiva === mod && styles.modalidadeBtnAtiva]}
                onPress={() => setModalidadeAtiva(mod)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalidadeText, modalidadeAtiva === mod && styles.modalidadeTextAtiva]}>
                  {mod}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterScroll}>
          {STATUS_FILTROS.map((status) => {
            const isAtivo = statusAtivo === status.id;
            return (
              <TouchableOpacity
                key={status.id}
                style={[styles.statusChip, isAtivo && { backgroundColor: status.activeBg, borderColor: status.activeColor }]}
                onPress={() => setStatusAtivo(status.id as StatusFiltro)}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusText, isAtivo && { color: status.activeColor, fontWeight: "900" }]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
      >
        <View style={styles.sectionPadding}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={["rgba(255, 107, 0, 0.14)", "rgba(255, 107, 0, 0.02)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            />

            <View style={styles.heroHeader}>
              <View style={styles.heroTitleGroup}>
                <View style={styles.heroWalletBox}>
                  <Ionicons name="wallet-outline" size={16} color="#FF6B00" />
                </View>
                <View>
                  <Text style={styles.heroTitle}>Receita Filtrada</Text>
                  <Text style={styles.heroSubPeriod}>{textoHeaderData()}</Text>
                </View>
              </View>

              <View style={styles.heroCountBadge}>
                <Text style={styles.heroCountText}>
                  {alunosFiltrados.length} {alunosFiltrados.length === 1 ? "fatura" : "faturas"}
                </Text>
              </View>
            </View>

            <View style={styles.heroValueRow}>
              <Text style={styles.heroCurrency}>R$</Text>
              <Text style={styles.heroValue}>
                {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.stackedBarContainer}>
              {totalGeral === 0 ? (
                <View style={[styles.barSegment, { flex: 1, backgroundColor: "#1E1E26" }]} />
              ) : (
                <>
                  {percRecebido > 0 && (
                    <View style={[styles.barSegment, { flex: percRecebido, backgroundColor: "#00E676" }]} />
                  )}
                  {percAReceber > 0 && (
                    <View style={[styles.barSegment, { flex: percAReceber, backgroundColor: "#FFD700" }]} />
                  )}
                  {percAtraso > 0 && (
                    <View style={[styles.barSegment, { flex: percAtraso, backgroundColor: "#FF3B30" }]} />
                  )}
                </>
              )}
            </View>

            <View style={styles.heroMetricsGrid}>
              <View style={styles.heroMetricPill}>
                <View style={styles.heroMetricTop}>
                  <View style={[styles.legendDot, { backgroundColor: "#00E676" }]} />
                  <Text style={styles.heroMetricLabel}>Recebido</Text>
                </View>
                <Text style={[styles.heroMetricAmount, { color: "#00E676" }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoedaCurta(totalRecebido)}
                </Text>
                <Text style={styles.heroMetricPct}>{percRecebido.toFixed(0)}%</Text>
              </View>

              <View style={styles.heroMetricPill}>
                <View style={styles.heroMetricTop}>
                  <View style={[styles.legendDot, { backgroundColor: "#FFD700" }]} />
                  <Text style={styles.heroMetricLabel}>A Receber</Text>
                </View>
                <Text style={[styles.heroMetricAmount, { color: "#FFD700" }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoedaCurta(totalPendente)}
                </Text>
                <Text style={styles.heroMetricPct}>{percAReceber.toFixed(0)}%</Text>
              </View>

              <View style={styles.heroMetricPill}>
                <View style={styles.heroMetricTop}>
                  <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
                  <Text style={styles.heroMetricLabel}>Atraso</Text>
                </View>
                <Text style={[styles.heroMetricAmount, { color: "#FF3B30" }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoedaCurta(totalAtrasado)}
                </Text>
                <Text style={styles.heroMetricPct}>{percAtraso.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {alunosFiltrados.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconBg}>
                <Ionicons name="calendar-outline" size={42} color="#FF6B00" />
              </View>
              <Text style={styles.emptyStateTitle}>Sem Registros</Text>
              <Text style={styles.emptyStateDesc}>
                Nenhum faturamento encontrado para a combinação de filtros e datas selecionados.
              </Text>
            </View>
          ) : (
            alunosFiltrados.map((item) => {
              const isAtrasado = item.status === "atrasado";
              const isPendente = item.status === "proximo" || item.status === "pendente";
              const isPago = item.status === "pago";
              const isBloqueado = item.acesso_bloqueado;

              let accentColor = "#71717A";
              let badgeBg = "rgba(255, 255, 255, 0.06)";
              let badgeBorder = "rgba(255, 255, 255, 0.12)";
              let badgeIcon = "information-circle" as any;
              let cardBorderColor = "#1F1F28";
              let cardGlowTop = "rgba(255, 255, 255, 0.02)";

              if (isAtrasado) {
                accentColor = "#FF3B30";
                badgeBg = "rgba(255, 59, 48, 0.14)";
                badgeBorder = "rgba(255, 59, 48, 0.38)";
                badgeIcon = "alert-circle";
                cardBorderColor = "rgba(255, 59, 48, 0.38)";
                cardGlowTop = "rgba(255, 59, 48, 0.08)";
              } else if (isPendente) {
                accentColor = "#FFD700";
                badgeBg = "rgba(255, 215, 0, 0.12)";
                badgeBorder = "rgba(255, 215, 0, 0.35)";
                badgeIcon = "time";
                cardBorderColor = "rgba(255, 215, 0, 0.32)";
                cardGlowTop = "rgba(255, 215, 0, 0.06)";
              } else if (isPago) {
                accentColor = "#00E676";
                badgeBg = "rgba(0, 230, 118, 0.12)";
                badgeBorder = "rgba(0, 230, 118, 0.35)";
                badgeIcon = "checkmark-circle";
                cardBorderColor = "rgba(0, 230, 118, 0.32)";
                cardGlowTop = "rgba(0, 230, 118, 0.06)";
              } else if (item.status === "cancelada") {
                accentColor = "#FF3B30";
                badgeIcon = "close-circle";
              } else if (item.status === "isenta" || item.status === "congelada") {
                accentColor = "#0A84FF";
                badgeIcon = "snow";
                badgeBg = "rgba(10, 132, 255, 0.14)";
                badgeBorder = "rgba(10, 132, 255, 0.38)";
                cardBorderColor = "rgba(10, 132, 255, 0.35)";
                cardGlowTop = "rgba(10, 132, 255, 0.07)";
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.studentCard, { borderColor: cardBorderColor }]}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("VisaoAluno", {
                      conexaoId: item.conexao_id || item.plano_id,
                      aluno: item.aluno_dados,
                      statusAtual: "aluno_ativo",
                      personalInfo: { nome: nomePersonal },
                    })
                  }
                >
                  <LinearGradient
                    colors={[cardGlowTop, "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.cardMain}>
                    <View style={styles.avatarWrapper}>
                      {item.foto ? (
                        <Image source={{ uri: item.foto }} style={[styles.avatar, { borderColor: accentColor }]} />
                      ) : (
                        <View
                          style={[
                            styles.avatar,
                            { borderColor: accentColor, justifyContent: "center", alignItems: "center" },
                          ]}
                        >
                          <Ionicons name="person" size={20} color="#71717A" />
                        </View>
                      )}
                      <View style={[styles.avatarStatusDot, { backgroundColor: accentColor }]} />
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {item.nome}
                      </Text>

                      <View style={styles.modalityRow}>
                        <Ionicons name="fitness-outline" size={11} color="#71717A" style={{ marginRight: 4 }} />
                        <Text style={styles.studentTenure} numberOfLines={1}>
                          {item.modalidadeUi}
                        </Text>
                      </View>

                      <View style={styles.badgesRow}>
                        <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                          <Ionicons name={badgeIcon} size={11} color={accentColor} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusBadgeText, { color: accentColor }]}>{item.detalheStatus}</Text>
                        </View>

                        {isBloqueado && (
                          <View style={styles.blockedBadge}>
                            <Ionicons name="lock-closed" size={10} color="#FF3B30" style={{ marginRight: 3 }} />
                            <Text style={styles.blockedBadgeText}>Bloqueado</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.cardFinancial}>
                      <Text style={styles.studentValue}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>
                      <View style={styles.vencimentoPill}>
                        <Ionicons name="calendar-clear-outline" size={10} color="#A1A1AA" style={{ marginRight: 4 }} />
                        <Text style={styles.studentDate}>
                          Venc <Text style={{ color: "#FFF", fontWeight: "800" }}>{item.dataExibicao}</Text>
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!["cancelada", "congelada", "isenta"].includes(item.status) && (
                    <>
                      <View style={styles.cardDivider} />
                      <View style={styles.cardActions}>
                        {isPago ? (
                          <>
                            <View style={[styles.btnAction, styles.btnActionPaid]}>
                              <Ionicons name="checkmark-done-circle" size={16} color="#00E676" style={{ marginRight: 6 }} />
                              <Text style={[styles.btnActionText, { color: "#00E676" }]}>Pagamento Confirmado</Text>
                            </View>
                            {isBloqueado && (
                              <TouchableOpacity
                                style={[styles.btnActionSquare, styles.btnActionLockActive]}
                                onPress={() => alternarBloqueioAluno(item)}
                                activeOpacity={0.75}
                              >
                                <Ionicons name="lock-open-outline" size={18} color="#FF3B30" />
                              </TouchableOpacity>
                            )}
                          </>
                        ) : (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.btnAction,
                                isAtrasado ? styles.btnActionWhatsAppOutline : styles.btnActionWarningOutline,
                              ]}
                              onPress={() => abrirWhatsApp(item.telefone, item.nome, item.valor, item.status)}
                              activeOpacity={0.78}
                            >
                              <MaterialCommunityIcons
                                name="whatsapp"
                                size={18}
                                color={isAtrasado ? "#25D366" : "#FFD700"}
                                style={{ marginRight: 7 }}
                              />
                              <Text
                                style={[
                                  styles.btnActionText,
                                  { color: isAtrasado ? "#25D366" : "#FFD700" },
                                ]}
                              >
                                {isAtrasado ? "Cobrar" : "Lembrar"}
                              </Text>
                            </TouchableOpacity>

                            {(isAtrasado || isBloqueado) && (
                              <TouchableOpacity
                                style={[
                                  styles.btnActionSquare,
                                  isBloqueado ? styles.btnActionLockActive : styles.btnActionLockIdle,
                                ]}
                                onPress={() => alternarBloqueioAluno(item)}
                                activeOpacity={0.75}
                              >
                                <Ionicons
                                  name={isBloqueado ? "lock-closed" : "lock-open-outline"}
                                  size={18}
                                  color={isBloqueado ? "#FF3B30" : "#A1A1AA"}
                                />
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              style={[styles.btnActionSquare, styles.btnActionOutline]}
                              onPress={() => abrirModalBaixa(item)}
                              activeOpacity={0.75}
                            >
                              <Ionicons name="checkmark-circle-outline" size={20} color="#00E676" />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity style={styles.btnCentralPdf} onPress={abrirModalPdf} activeOpacity={0.85}>
            <LinearGradient colors={["#14141A", "#0D0D12"]} style={styles.btnPdfGradient}>
              <View style={styles.btnPdfIconBox}>
                <Ionicons name="document-text-outline" size={21} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.btnPdfTitle}>Baixar Relatório (PDF)</Text>
                <Text style={styles.btnPdfSubtitle}>Escolha uma data ou período para exportar o extrato</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalDataVisivel} animationType="fade" transparent>
        <View style={styles.modalDataOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalDataCard}>
            <View style={styles.modalDataHeader}>
              <TouchableOpacity onPress={() => setTempAno(tempAno - 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-back" size={22} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalDataAno}>{tempAno}</Text>
              <TouchableOpacity onPress={() => setTempAno(tempAno + 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-forward" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {MESES_NOME.map((mes, index) => {
                const isActive = tempMes === index;
                return (
                  <TouchableOpacity
                    key={mes}
                    style={[styles.modalDataMesBtn, isActive && styles.modalDataMesBtnAtivo]}
                    onPress={() => selecionarMesCalendario(index)}
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
              {renderizarGradeCalendario(tempAno, tempMes, tempInicio, tempFim, selecionarDiaCalendario)}
            </View>
            <Text style={{ color: "#71717A", fontSize: 11, textAlign: "center", marginTop: 14 }}>
              Toque em 1 dia específico ou selecione a data inicial e a data final.
            </Text>
            <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
              <TouchableOpacity style={[styles.modalDataCloseBtn, { flex: 1 }]} onPress={() => setModalDataVisivel(false)}>
                <Text style={styles.modalDataCloseText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDataCloseBtn, { flex: 1, backgroundColor: "#FF6B00", borderColor: "#FF6B00" }]}
                onPress={aplicarFiltroCalendario}
              >
                <Text style={[styles.modalDataCloseText, { color: "#000", fontWeight: "900" }]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalPdfVisivel} animationType="slide" transparent onRequestClose={() => setModalPdfVisivel(false)}>
        <View style={styles.modalDataOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalPdfCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.pdfModalSubTag}>EXTRATO FINANCEIRO</Text>
                <Text style={styles.modalTitle}>Exportar Relatório (PDF)</Text>
              </View>
              <TouchableOpacity onPress={() => setModalPdfVisivel(false)} style={styles.modalCloseBtn}>
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
                const active = pdfPreset === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.pdfPresetChip, active && styles.pdfPresetChipActive]}
                    onPress={() => selecionarPresetPdf(opt.id as PdfPreset)}
                  >
                    <Text style={[styles.pdfPresetChipText, active && styles.pdfPresetChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.pdfRangeSummary}>
              <View style={styles.pdfRangeBox}>
                <Text style={styles.pdfRangeLabel}>DATA INICIAL</Text>
                <Text style={styles.pdfRangeValue}>{formatDDMMYYYY(pdfInicio)}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#FF6B00" />
              <View style={styles.pdfRangeBox}>
                <Text style={styles.pdfRangeLabel}>DATA FINAL</Text>
                <Text style={styles.pdfRangeValue}>{formatDDMMYYYY(pdfFim || pdfInicio)}</Text>
              </View>
            </View>

            <View style={styles.modalDataHeader}>
              <TouchableOpacity onPress={() => setPdfAno(pdfAno - 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-back" size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalDataAno}>{pdfAno}</Text>
              <TouchableOpacity onPress={() => setPdfAno(pdfAno + 1)} style={styles.modalDataArrow}>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {MESES_NOME.map((mes, index) => {
                const isActive = pdfMes === index;
                return (
                  <TouchableOpacity
                    key={mes}
                    style={[styles.modalDataMesBtn, isActive && styles.modalDataMesBtnAtivo]}
                    onPress={() => selecionarMesPdf(index)}
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
              {renderizarGradeCalendario(pdfAno, pdfMes, pdfInicio, pdfFim, selecionarDiaPdf)}
            </View>

            <TouchableOpacity
              style={[styles.btnExportPdfConfirm, gerandoPdf && { opacity: 0.7 }]}
              onPress={exportarPdfPeriodo}
              disabled={gerandoPdf}
            >
              {gerandoPdf ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.btnConfirmarText}>GERAR EXTRATO PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {fabAberto && (
        <TouchableOpacity style={styles.fabOverlay} activeOpacity={1} onPress={() => setFabAberto(false)}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
      )}
      {fabAberto && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setFabAberto(false);
              navigation.navigate("AdicionarAluno");
            }}
          >
            <Text style={styles.fabMenuText}>Novo Contrato</Text>
            <View style={[styles.fabMenuIcon, { backgroundColor: "#0A84FF" }]}>
              <Ionicons name="person-add" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setFabAberto(false);
              setAlunoSelecionadoId(null);
              setBuscaAlunoCongelar("");
              setTextoOutroMotivo("");
              setModalCongelarVisivel(true);
            }}
          >
            <Text style={styles.fabMenuText}>Congelar Plano</Text>
            <View style={[styles.fabMenuIcon, { backgroundColor: "#00B4D8" }]}>
              <Ionicons name="snow" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fabPill} activeOpacity={0.88} onPress={() => setFabAberto(!fabAberto)}>
        <View style={[styles.fabPillIconCircle, fabAberto && { backgroundColor: "rgba(255, 59, 48, 0.2)" }]}>
          <MaterialCommunityIcons name={fabAberto ? "close" : "plus"} size={20} color={fabAberto ? "#FF3B30" : "#FF6B00"} />
        </View>
        <Text style={[styles.fabPillText, fabAberto && { color: "#FF3B30" }]}>{fabAberto ? "Fechar" : "Ações"}</Text>
      </TouchableOpacity>

      <Modal visible={modalBaixaVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            {etapaBaixa === 1 && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Registrar Pagamento</Text>
                  <TouchableOpacity onPress={() => setModalBaixaVisivel(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                {faturaSelecionada && (
                  <View style={styles.modalAlunoInfo}>
                    {faturaSelecionada.foto ? (
                      <Image source={{ uri: faturaSelecionada.foto }} style={styles.modalAvatar} />
                    ) : (
                      <View style={[styles.modalAvatar, { backgroundColor: "#222", justifyContent: "center", alignItems: "center" }]}>
                        <Ionicons name="person" size={18} color="#666" />
                      </View>
                    )}
                    <View>
                      <Text style={styles.modalAlunoNome}>{faturaSelecionada.nome}</Text>
                      <Text style={styles.modalAlunoDetalhe}>Venc: {faturaSelecionada.dataExibicao}</Text>
                    </View>
                  </View>
                )}
                <Text style={styles.inputLabel}>Valor Recebido (R$)</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputPrefix}>R$</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={valorInput} onChangeText={setValorInput} cursorColor="#FF6B00" />
                </View>
                <Text style={styles.inputLabel}>Forma de Pagamento</Text>
                <View style={styles.chipContainer}>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <TouchableOpacity key={f} style={[styles.chipBtn, formaPgto === f && styles.chipBtnAtiva]} onPress={() => setFormaPgto(f)}>
                      <Text style={[styles.chipText, formaPgto === f && styles.chipTextAtiva]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Observações (Opcional)</Text>
                <View style={[styles.inputBox, { height: 80, paddingTop: 12 }]}>
                  <TextInput style={[styles.input, { textAlignVertical: "top" }]} multiline value={observacao} onChangeText={setObservacao} cursorColor="#FF6B00" />
                </View>
                <TouchableOpacity style={[styles.btnConfirmar, processando && { opacity: 0.7 }]} onPress={confirmarBaixaManual} disabled={processando}>
                  {processando ? (
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
            {etapaBaixa === 2 && (
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={{ color: "#FFF", fontSize: 24, fontFamily: theme.fonts.title, marginBottom: 20 }}>Sucesso! 🎉</Text>
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
                      <Text style={styles.reciboPremiumValue}>{faturaSelecionada?.nome}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Para</Text>
                      <Text style={styles.reciboPremiumValue}>{nomePersonal}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Método</Text>
                      <Text style={styles.reciboPremiumValue}>{formaPgto}</Text>
                    </View>
                    <View style={styles.reciboPremiumRow}>
                      <Text style={styles.reciboPremiumLabel}>Vencimento</Text>
                      <Text style={styles.reciboPremiumValue}>{faturaSelecionada?.dataExibicao}</Text>
                    </View>
                  </View>
                  <View style={styles.dashedLine} />
                  <View style={styles.reciboPremiumFooter}>
                    <Text style={styles.reciboPremiumTotalLabel}>TOTAL PAGO</Text>
                    <Text style={styles.reciboPremiumTotalValue}>R$ {valorInput}</Text>
                  </View>
                  <View style={styles.reciboPremiumBottomBrand}>
                    <Ionicons name="flash" size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.reciboPremiumBrandText}>Gerado por MatchTrainer</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.btnSharePremium} onPress={compartilharReciboImage} activeOpacity={0.8}>
                  <LinearGradient colors={["#0A84FF", "#0066CC"]} style={styles.btnShareGradient}>
                    <Ionicons name="share-social" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnShareText}>Compartilhar Recibo</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnVoltarRecibo} onPress={() => setModalBaixaVisivel(false)}>
                  <Text style={styles.btnVoltarReciboText}>Voltar ao Painel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalCongelarVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Congelar Contrato</Text>
              <TouchableOpacity onPress={() => setModalCongelarVisivel(false)} style={styles.modalCloseBtn}>
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
                value={buscaAlunoCongelar}
                onChangeText={setBuscaAlunoCongelar}
              />
            </View>
            <ScrollView style={styles.listAlunosScroll} nestedScrollEnabled>
              {alunosCongelarFiltrados.length === 0 ? (
                <Text style={{ color: "#666", textAlign: "center", marginTop: 20 }}>Nenhum aluno encontrado.</Text>
              ) : (
                alunosCongelarFiltrados.map((aluno) => (
                  <TouchableOpacity
                    key={aluno.id}
                    style={[
                      styles.alunoListItem,
                      alunoSelecionadoId === aluno.id && { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.1)" },
                    ]}
                    onPress={() => setAlunoSelecionadoId(aluno.id)}
                  >
                    {aluno.foto ? (
                      <Image source={{ uri: aluno.foto }} style={styles.alunoListAvatar} />
                    ) : (
                      <View style={[styles.alunoListAvatar, { justifyContent: "center", alignItems: "center" }]}>
                        <Ionicons name="person" size={16} color="#666" />
                      </View>
                    )}
                    <Text
                      style={[styles.alunoListNome, alunoSelecionadoId === aluno.id && { color: "#0A84FF", fontWeight: "bold" }]}
                      numberOfLines={1}
                    >
                      {aluno.nome}
                    </Text>
                    {alunoSelecionadoId === aluno.id && <Ionicons name="checkmark-circle" size={20} color="#0A84FF" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Text style={styles.inputLabel}>Motivo da Pausa</Text>
            <View style={styles.chipContainer}>
              {MOTIVOS_CONGELAMENTO.map((mot) => (
                <TouchableOpacity
                  key={mot}
                  style={[styles.chipBtn, motivoPausa === mot && { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.15)" }]}
                  onPress={() => setMotivoPausa(mot)}
                >
                  <Text style={[styles.chipText, motivoPausa === mot && { color: "#0A84FF" }]}>{mot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {motivoPausa === "Outro" && (
              <View style={[styles.inputBox, { height: 60, marginBottom: 20 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Descreva o motivo (Ex: Cirurgia)..."
                  placeholderTextColor="#666"
                  value={textoOutroMotivo}
                  onChangeText={setTextoOutroMotivo}
                  cursorColor="#0A84FF"
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Dias Pausados</Text>
                <View style={[styles.inputBox, { marginBottom: 0 }]}>
                  <TextInput style={styles.input} keyboardType="numeric" value={diasPausa} onChangeText={setDiasPausa} cursorColor="#0A84FF" />
                  <Text style={styles.inputPrefix}>Dias</Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#1A1A1A",
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#333",
                  height: 56,
                  marginTop: 22,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#888", fontSize: 10, textTransform: "uppercase", fontWeight: "bold" }}>Retorno em</Text>
                <Text style={{ color: "#0A84FF", fontSize: 16, fontWeight: "bold" }}>{dataRetornoCalculada}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnConfirmar, { backgroundColor: "#0A84FF", shadowColor: "#0A84FF" }, processando && { opacity: 0.7 }]}
              onPress={confirmarCongelamento}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="snow" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={[styles.btnConfirmarText, { color: "#FFF" }]}>Congelar Plano</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}