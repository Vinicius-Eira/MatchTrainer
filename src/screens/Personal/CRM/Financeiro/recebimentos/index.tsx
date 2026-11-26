import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { RecebimentosModals } from "./components/RecebimentosModals";
import { STATUS_FILTROS, StatusFiltro } from "./constants";
import { styles } from "./styles";
import { useRecebimentos } from "./useRecebimentos";

export function Recebimentos({ navigation }: any) {
  const v = useRecebimentos(navigation);

  const exibirFiltroModalidade = v.modalidadesPersonal.length > 1;
  const listaModalidadesUi = ["Todos", "Consultoria", "Presencial"];

  const formatMoedaCurta = (valor: number) =>
    `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (v.loading && !v.refreshing) {
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
            onPress={() => v.setaMudarMesRapido(-1)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 4 }}
          >
            <Ionicons name="chevron-back" size={14} color="#FF6B00" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.monthCenterSm} onPress={v.abrirCalendarioTopo} activeOpacity={0.75}>
            <Ionicons name="calendar-outline" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
            <Text style={styles.monthTextSm} numberOfLines={1}>
              {v.textoHeaderData()}
            </Text>
            <Ionicons name="chevron-down" size={11} color="#FF6B00" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthArrowSm}
            onPress={() => v.setaMudarMesRapido(1)}
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
                style={[styles.modalidadeBtn, v.modalidadeAtiva === mod && styles.modalidadeBtnAtiva]}
                onPress={() => v.setModalidadeAtiva(mod)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalidadeText, v.modalidadeAtiva === mod && styles.modalidadeTextAtiva]}>
                  {mod}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterScroll}>
          {STATUS_FILTROS.map((status) => {
            const isAtivo = v.statusAtivo === status.id;
            return (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusChip,
                  isAtivo && { backgroundColor: status.activeBg, borderColor: status.activeColor },
                ]}
                onPress={() => v.setStatusAtivo(status.id as StatusFiltro)}
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
        refreshControl={<RefreshControl refreshing={v.refreshing} onRefresh={v.onRefresh} tintColor="#FF6B00" />}
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
                  <Text style={styles.heroSubPeriod}>{v.textoHeaderData()}</Text>
                </View>
              </View>

              <View style={styles.heroCountBadge}>
                <Text style={styles.heroCountText}>
                  {v.alunosFiltrados.length} {v.alunosFiltrados.length === 1 ? "fatura" : "faturas"}
                </Text>
              </View>
            </View>

            <View style={styles.heroValueRow}>
              <Text style={styles.heroCurrency}>R$</Text>
              <Text style={styles.heroValue}>
                {v.totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.stackedBarContainer}>
              {v.totalGeral === 0 ? (
                <View style={[styles.barSegment, { flex: 1, backgroundColor: "#1E1E26" }]} />
              ) : (
                <>
                  {v.percRecebido > 0 && (
                    <View style={[styles.barSegment, { flex: v.percRecebido, backgroundColor: "#00E676" }]} />
                  )}
                  {v.percAReceber > 0 && (
                    <View style={[styles.barSegment, { flex: v.percAReceber, backgroundColor: "#FFD700" }]} />
                  )}
                  {v.percAtraso > 0 && (
                    <View style={[styles.barSegment, { flex: v.percAtraso, backgroundColor: "#FF3B30" }]} />
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
                  {formatMoedaCurta(v.totalRecebido)}
                </Text>
                <Text style={styles.heroMetricPct}>{v.percRecebido.toFixed(0)}%</Text>
              </View>

              <View style={styles.heroMetricPill}>
                <View style={styles.heroMetricTop}>
                  <View style={[styles.legendDot, { backgroundColor: "#FFD700" }]} />
                  <Text style={styles.heroMetricLabel}>A Receber</Text>
                </View>
                <Text style={[styles.heroMetricAmount, { color: "#FFD700" }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoedaCurta(v.totalPendente)}
                </Text>
                <Text style={styles.heroMetricPct}>{v.percAReceber.toFixed(0)}%</Text>
              </View>

              <View style={styles.heroMetricPill}>
                <View style={styles.heroMetricTop}>
                  <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
                  <Text style={styles.heroMetricLabel}>Atraso</Text>
                </View>
                <Text style={[styles.heroMetricAmount, { color: "#FF3B30" }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoedaCurta(v.totalAtrasado)}
                </Text>
                <Text style={styles.heroMetricPct}>{v.percAtraso.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {v.alunosFiltrados.length === 0 ? (
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
            v.alunosFiltrados.map((item) => {
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
                      personalInfo: { nome: v.nomePersonal },
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
                                onPress={() => v.alternarBloqueioAluno(item)}
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
                              onPress={() => v.abrirWhatsApp(item.telefone, item.nome, item.valor, item.status)}
                              activeOpacity={0.78}
                            >
                              <MaterialCommunityIcons
                                name="whatsapp"
                                size={18}
                                color={isAtrasado ? "#25D366" : "#FFD700"}
                                style={{ marginRight: 7 }}
                              />
                              <Text style={[styles.btnActionText, { color: isAtrasado ? "#25D366" : "#FFD700" }]}>
                                {isAtrasado ? "Cobrar" : "Lembrar"}
                              </Text>
                            </TouchableOpacity>

                            {(isAtrasado || isBloqueado) && (
                              <TouchableOpacity
                                style={[
                                  styles.btnActionSquare,
                                  isBloqueado ? styles.btnActionLockActive : styles.btnActionLockIdle,
                                ]}
                                onPress={() => v.alternarBloqueioAluno(item)}
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
                              onPress={() => v.abrirModalBaixa(item)}
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

          <TouchableOpacity style={styles.pdfExportCard} onPress={v.abrirModalPdf} activeOpacity={0.82}>
            <View style={styles.pdfExportIconBox}>
              <Ionicons name="document-text-outline" size={21} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pdfExportTitle}>Exportar Relatório (PDF)</Text>
              <Text style={styles.pdfExportSubtitle}>Escolha uma data ou período para baixar o extrato</Text>
            </View>
            <View style={styles.pdfExportArrowPill}>
              <Ionicons name="download-outline" size={16} color="#FF6B00" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {v.fabAberto && (
        <TouchableOpacity style={styles.fabOverlay} activeOpacity={1} onPress={() => v.setFabAberto(false)}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
      )}
      {v.fabAberto && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              v.setFabAberto(false);
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
              v.setFabAberto(false);
              v.setAlunoSelecionadoId(null);
              v.setBuscaAlunoCongelar("");
              v.setTextoOutroMotivo("");
              v.setModalCongelarVisivel(true);
            }}
          >
            <Text style={styles.fabMenuText}>Congelar Plano</Text>
            <View style={[styles.fabMenuIcon, { backgroundColor: "#00B4D8" }]}>
              <Ionicons name="snow" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fabPill} activeOpacity={0.88} onPress={() => v.setFabAberto(!v.fabAberto)}>
        <View style={[styles.fabPillIconCircle, v.fabAberto && { backgroundColor: "rgba(255, 59, 48, 0.2)" }]}>
          <MaterialCommunityIcons
            name={v.fabAberto ? "close" : "plus"}
            size={20}
            color={v.fabAberto ? "#FF3B30" : "#FF6B00"}
          />
        </View>
        <Text style={[styles.fabPillText, v.fabAberto && { color: "#FF3B30" }]}>
          {v.fabAberto ? "Fechar" : "Ações"}
        </Text>
      </TouchableOpacity>

      {v.gerandoPdf && (
        <View style={styles.pdfLoadingOverlay}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.pdfLoadingCard}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.pdfLoadingTitle}>Gerando Extrato PDF</Text>
            <Text style={styles.pdfLoadingSub}>
              {v.etapaPdfTexto || "Preparando arquivo para salvar no aparelho..."}
            </Text>
          </View>
        </View>
      )}

      <RecebimentosModals v={v} />
    </View>
  );
}