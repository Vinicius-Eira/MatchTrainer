import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
import { AlunoRiscoItem, BusinessKPIs, formatarMoeda, InsightBusiness } from "../usePainelCrescimento";
import { styles } from "./styles";

const { width } = Dimensions.get("window");
const MESES_NOME_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface AbaNegocioCaixaProps {
  kpis: BusinessKPIs | null;
  metricas: {
    mrrAtual: number;
    mrrAnterior: number;
    ticketMedio: number;
    ticketReferencia: number;
    crescimentoPct: number;
    valorMeta: number | null;
    faltamReais: number;
    alunosParaMeta: number;
    diasParaMeta: number | null;
  };
  insightAtual: InsightBusiness | null;
  onExecutarInsight: (rota?: string) => void;
  onAbrirModalMeta: () => void;
  onAbrirInfo: (titulo: string, texto: string, dica: string) => void;
  navigation: any;
}

export function NegocioCaixa({
  kpis,
  metricas,
  insightAtual,
  onExecutarInsight,
  onAbrirModalMeta,
  onAbrirInfo,
  navigation,
}: AbaNegocioCaixaProps) {
  const {
    mrrAtual,
    mrrAnterior,
    ticketMedio,
    ticketReferencia,
    crescimentoPct,
    valorMeta,
    faltamReais,
    alunosParaMeta,
    diasParaMeta,
  } = metricas;

  const progressoPct = valorMeta && valorMeta > 0 ? Math.min((mrrAtual / valorMeta) * 100, 100) : 0;
  const isPositivo = crescimentoPct >= 0;
  const growthColor = isPositivo ? "#00E676" : "#FF3B30";
  const growthBg = isPositivo ? "rgba(0, 230, 118, 0.14)" : "rgba(255, 59, 48, 0.14)";
  const growthIcon = isPositivo ? "trending-up" : "trending-down";

  const score = kpis?.score || 0;
  let scoreColor = "#FF3B30";
  let scoreText = "Atenção Urgente";
  let scoreDesc = "Inadimplência ou conversão estão segurando seu crescimento.";
  if (score >= 80) {
    scoreColor = "#00E676";
    scoreText = "Operação Elite";
    scoreDesc = "Caixa saudável e base consistente para escalar.";
  } else if (score >= 55) {
    scoreColor = "#FF6B00";
    scoreText = "Em Evolução";
    scoreDesc = "Boa base, mas existem ajustes rápidos para ganhar margem.";
  }

  const qtdConsultoria = kpis?.distribuicao?.consultoria || 0;
  const qtdPresencial = kpis?.distribuicao?.presencial || 0;
  const receitaConsultoria = Number(kpis?.distribuicao?.receita_consultoria || 0);
  const receitaPresencial = Number(kpis?.distribuicao?.receita_presencial || 0);
  const totalDist = qtdConsultoria + qtdPresencial;
  const pctConsultoria = totalDist > 0 ? (qtdConsultoria / totalDist) * 100 : 0;
  const pctPresencial = totalDist > 0 ? (qtdPresencial / totalDist) * 100 : 0;

  const historico = kpis?.historico || [];
  const faturamentoMaximo = historico.length > 0 ? Math.max(...historico.map((d) => Number(d.faturamento || 0))) : 0;
  const valorLinhaReferencia = valorMeta || faturamentoMaximo;

  const chartData = historico.map((item) => {
    const mesIndex =
      typeof item.mes_num === "number"
        ? item.mes_num - 1
        : Math.max(0, Math.min(11, parseInt(String(item.mes_ref || "2026-01").split("-")[1] || "1", 10) - 1));
    const val = Number(item.faturamento || 0);
    const isRecord = val === faturamentoMaximo && val > 0;

    return {
      value: val,
      label: MESES_NOME_CURTO[mesIndex] || "",
      frontColor: isRecord ? "#00E676" : "#FF6B00",
      gradientColor: isRecord ? "#00B248" : "#B84700",
      topLabelComponent: isRecord
        ? () => <Ionicons name="trophy" size={14} color="#00E676" style={{ marginBottom: 4 }} />
        : undefined,
      labelTextStyle: {
        color: isRecord ? "#FFF" : "#888",
        fontSize: 11,
        fontWeight: (isRecord ? "bold" : "normal") as "bold" | "normal",
      },
    };
  });

  const maxValueY = Math.max(faturamentoMaximo, valorLinhaReferencia, 100) * 1.2;
  const alunosRisco = kpis?.alunos_risco || [];

  const getCorPrioridade = (prioridade: AlunoRiscoItem["prioridade"]) => {
    if (prioridade === "alta") return "#FF3B30";
    if (prioridade === "media") return "#FF6B00";
    return "#A1A1AA";
  };

  return (
    <View>
      {insightAtual && (
        <View style={styles.aiCardContainer}>
          <View style={styles.aiHeaderRow}>
            <Ionicons name="flash" size={15} color="#FF6B00" />
            <Text style={styles.aiTitle}>PRIORIDADE DO DIA</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={styles.aiIconBox}>
              <Ionicons name={insightAtual.icone} size={22} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiHeadline}>{insightAtual.titulo}</Text>
              <Text style={styles.aiText}>{insightAtual.texto}</Text>
            </View>
          </View>
          {insightAtual.ctaLabel && (
            <TouchableOpacity
              style={styles.aiActionBtn}
              onPress={() => onExecutarInsight(insightAtual.ctaRota)}
              activeOpacity={0.8}
            >
              <Text style={styles.aiActionBtnText}>{insightAtual.ctaLabel}</Text>
              <Ionicons name="arrow-forward" size={14} color="#FF6B00" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.mrrCard}>
        <LinearGradient colors={["rgba(255, 107, 0, 0.12)", "transparent"]} style={StyleSheet.absoluteFill} />
        <View style={styles.mrrHeader}>
          <View style={styles.mrrLabelRow}>
            <Text style={styles.mrrLabel}>MRR (Receita Recorrente)</Text>
            <TouchableOpacity
              style={styles.btnInfo}
              onPress={() =>
                onAbrirInfo(
                  "MRR (Receita Recorrente)",
                  "É a soma mensal de todos os seus contratos recorrentes ativos (desconsiderando vendas avulsas). Representa a previsibilidade real do seu negócio.",
                  "Subir seu ticket médio em R$ 30 ou reter 2 alunos por trimestre faz mais diferença no ano do que picos isolados."
                )
              }
            >
              <Ionicons name="information-circle-outline" size={16} color="#888" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btnEditarMetaPill} onPress={onAbrirModalMeta} activeOpacity={0.75}>
            <Ionicons name="pencil" size={13} color="#FF6B00" />
            <Text style={styles.btnEditarMetaText}>{valorMeta ? "Editar Meta" : "Definir Meta"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mrrValueRow}>
          <Text style={styles.mrrValue}>{formatarMoeda(mrrAtual)}</Text>
          <View style={[styles.badgeGrowth, { backgroundColor: growthBg, borderColor: `${growthColor}40` }]}>
            <Ionicons name={growthIcon} size={13} color={growthColor} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeGrowthText, { color: growthColor }]}>
              {isPositivo ? "+" : ""}
              {crescimentoPct.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.mrrHistoryRow}>
          <View style={styles.mrrHistoryItem}>
            <Text style={styles.mrrHistoryLabel}>Mês Anterior</Text>
            <Text style={styles.mrrHistoryValue}>{formatarMoeda(mrrAnterior)}</Text>
          </View>
          <View style={[styles.mrrHistoryItem, { alignItems: "flex-end" }]}>
            <Text style={styles.mrrHistoryLabel}>Ticket Médio</Text>
            <Text style={[styles.mrrHistoryValue, { color: "#FF6B00" }]}>{formatarMoeda(ticketMedio)}</Text>
          </View>
        </View>

        {valorMeta ? (
          <View style={styles.metaProgressoContainer}>
            <View style={styles.metaProgressoHeader}>
              <Text style={styles.metaProgressoLabel}>Meta Mensal</Text>
              <Text style={styles.metaProgressoValue}>
                {progressoPct.toFixed(0)}% ({formatarMoeda(valorMeta)})
              </Text>
            </View>
            <View style={styles.metaBarBg}>
              <View
                style={[
                  styles.metaBarFill,
                  { width: `${progressoPct}%`, backgroundColor: progressoPct >= 100 ? "#00E676" : "#FF6B00" },
                ]}
              />
            </View>

            {faltamReais > 0 ? (
              <View style={styles.insightPredicaoBox}>
                <Ionicons name="calculator-outline" size={18} color="#FF6B00" />
                <Text style={styles.insightPredicaoText}>
                  Faltam <Text style={{ color: "#FFF" }}>{formatarMoeda(faltamReais)}</Text> — ou cerca de{" "}
                  <Text style={{ color: "#FFF" }}>
                    {alunosParaMeta} {alunosParaMeta === 1 ? "novo aluno" : "novos alunos"}
                  </Text>{" "}
                  a {formatarMoeda(ticketReferencia)}
                  {diasParaMeta !== null ? ` (~${diasParaMeta} dias no ritmo atual).` : "."}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.insightPredicaoBox,
                  { backgroundColor: "rgba(0, 230, 118, 0.12)", borderColor: "rgba(0, 230, 118, 0.35)" },
                ]}
              >
                <Ionicons name="trophy" size={18} color="#00E676" />
                <Text style={[styles.insightPredicaoText, { color: "#00E676" }]}>
                  Meta mensal batida! Eleve o alvo para continuar acelerando seu faturamento.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={onAbrirModalMeta} style={styles.btnMetaVazia} activeOpacity={0.75}>
            <Ionicons name="flag-outline" size={16} color="#FF6B00" style={{ marginRight: 8 }} />
            <Text style={styles.btnMetaVaziaText}>Definir Meta de Faturamento Mensal</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreMainRow}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor, shadowColor: scoreColor }]}>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <View style={styles.scoreTextContainer}>
            <View style={styles.scoreLabelRow}>
              <Text style={styles.scoreLabel}>Score Operacional</Text>
              <TouchableOpacity
                style={styles.btnInfo}
                onPress={() =>
                  onAbrirInfo(
                    "Score Operacional",
                    "Nota de 0 a 100 calculada automaticamente a partir da sua taxa de conversão, inadimplência, tempo de resposta aos leads e retenção de alunos nos últimos 30 dias.",
                    "Mantenha a inadimplência abaixo de 5% e responda novos Matches rápido para atingir o nível Elite (80+)."
                  )
                }
              >
                <Ionicons name="information-circle-outline" size={14} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.scoreStatusTitle, { color: scoreColor }]}>{scoreText}</Text>
            <Text style={styles.scoreDesc}>{scoreDesc}</Text>
          </View>
        </View>

        {kpis?.score_motivos && kpis.score_motivos.length > 0 && (
          <View style={styles.scoreRaioXContainer}>
            {kpis.score_motivos.map((motivo, index) => (
              <View key={index} style={styles.scoreRaioXItem}>
                <Ionicons
                  name={motivo.tipo === "positivo" ? "checkmark-circle" : "warning"}
                  size={14}
                  color={motivo.tipo === "positivo" ? "#00E676" : "#FF6B00"}
                />
                <Text style={styles.scoreRaioXText}>{motivo.texto}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="wallet-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Caixa do Mês Atual</Text>
        <TouchableOpacity style={styles.sectionActionLink} onPress={() => navigation.navigate("Recebimentos")}>
          <Text style={styles.sectionActionLinkText}>Recebimentos</Text>
          <Ionicons name="chevron-forward" size={14} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <View style={styles.kpiGrid}>
        <TouchableOpacity style={styles.kpiBox} onPress={() => navigation.navigate("Recebimentos")} activeOpacity={0.8}>
          <View style={[styles.kpiIconBg, { backgroundColor: "rgba(255, 107, 0, 0.14)" }]}>
            <Ionicons name="bar-chart" size={16} color="#FF6B00" />
          </View>
          <Text style={styles.kpiLabel}>Previsto</Text>
          <Text style={styles.kpiValue}>{formatarMoeda(kpis?.receita_total)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.kpiBox} onPress={() => navigation.navigate("Recebimentos")} activeOpacity={0.8}>
          <View style={[styles.kpiIconBg, { backgroundColor: "rgba(0, 230, 118, 0.14)" }]}>
            <Ionicons name="checkmark-circle" size={16} color="#00E676" />
          </View>
          <Text style={styles.kpiLabel}>Recebido</Text>
          <Text style={[styles.kpiValue, { color: "#00E676" }]}>{formatarMoeda(kpis?.receita_recebida)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.kpiBox} onPress={() => navigation.navigate("Recebimentos")} activeOpacity={0.8}>
          <View style={[styles.kpiIconBg, { backgroundColor: "rgba(255, 255, 255, 0.08)" }]}>
            <Ionicons name="time" size={16} color="#E4E4E7" />
          </View>
          <Text style={styles.kpiLabel}>A Vencer</Text>
          <Text style={styles.kpiValue}>{formatarMoeda(kpis?.receita_pendente)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiBox, (kpis?.receita_atraso || 0) > 0 && { borderColor: "rgba(255, 59, 48, 0.45)" }]}
          onPress={() => navigation.navigate("Recebimentos")}
          activeOpacity={0.8}
        >
          <View style={[styles.kpiIconBg, { backgroundColor: "rgba(255, 59, 48, 0.14)" }]}>
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          </View>
          <Text style={styles.kpiLabel}>Em Atraso</Text>
          <Text style={[styles.kpiValue, { color: (kpis?.receita_atraso || 0) > 0 ? "#FF3B30" : "#FFF" }]}>
            {formatarMoeda(kpis?.receita_atraso)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="analytics" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Evolução Recebida (6 meses)</Text>
      </View>
      <View style={[styles.mrrCard, { paddingHorizontal: 14, paddingVertical: 20 }]}>
        {faturamentoMaximo > 0 ? (
          <>
            <BarChart
              data={chartData}
              width={width - 88}
              height={175}
              maxValue={maxValueY}
              barWidth={26}
              spacing={18}
              roundedTop
              isAnimated
              animationDuration={850}
              yAxisColor="#2A2A2E"
              xAxisColor="#2A2A2E"
              yAxisThickness={1}
              xAxisThickness={1}
              yAxisTextStyle={{ color: "#888", fontSize: 10 }}
              noOfSections={4}
              showGradient
              showReferenceLine1={valorLinhaReferencia > 0}
              referenceLine1Position={valorLinhaReferencia}
              referenceLine1Config={{
                color: valorMeta ? "#FF6B00" : "#00E676",
                dashWidth: 4,
                dashGap: 4,
                thickness: 2,
              }}
              formatYLabel={(label) => {
                const val = Number(label);
                return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0);
              }}
              renderTooltip={(item: any) => {
                const faltam = Math.max(0, valorLinhaReferencia - Number(item.value || 0));
                return (
                  <View style={styles.chartTooltip}>
                    <Text style={styles.chartTooltipVal}>{formatarMoeda(item.value)}</Text>
                    <Text style={{ color: faltam > 0 ? "#FF6B00" : "#00E676", fontSize: 10, fontWeight: "800" }}>
                      {faltam > 0 ? `Faltam ${formatarMoeda(faltam)}` : "Meta batida!"}
                    </Text>
                  </View>
                );
              }}
            />
            <View style={styles.chartLegendRow}>
              <View style={[styles.chartLegendLine, { backgroundColor: valorMeta ? "#FF6B00" : "#00E676" }]} />
              <Text style={styles.chartLegendText}>
                {valorMeta ? `Linha de Meta: ${formatarMoeda(valorMeta)}` : `Recorde Atual: ${formatarMoeda(faturamentoMaximo)}`}
              </Text>
            </View>
          </>
        ) : (
          <View style={{ height: 150, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="stats-chart-outline" size={38} color="#333" style={{ marginBottom: 10 }} />
            <Text style={{ color: "#888", fontSize: 12, textAlign: "center" }}>
              Os pagamentos confirmados nos últimos 6 meses aparecerão aqui automaticamente.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="pie-chart" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Mix de Receita (Escala)</Text>
      </View>
      <View style={styles.distContainer}>
        {totalDist === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", fontSize: 12 }}>
            Nenhum contrato ativo ainda para calcular o mix de modalidades.
          </Text>
        ) : (
          <>
            <View style={styles.stackedBar}>
              {pctConsultoria > 0 && <View style={{ width: `${pctConsultoria}%`, backgroundColor: "#FF6B00" }} />}
              {pctPresencial > 0 && <View style={{ width: `${pctPresencial}%`, backgroundColor: "#00E676" }} />}
            </View>
            <View style={styles.distLegendContainer}>
              <View style={styles.distLegendItem}>
                <View style={styles.distLegendLeft}>
                  <View style={[styles.distDot, { backgroundColor: "#FF6B00" }]} />
                  <Text style={styles.distLabel}>Consultoria Online ({qtdConsultoria})</Text>
                </View>
                <Text style={styles.distValue}>
                  {formatarMoeda(receitaConsultoria)} • {pctConsultoria.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.distLegendItem}>
                <View style={styles.distLegendLeft}>
                  <View style={[styles.distDot, { backgroundColor: "#00E676" }]} />
                  <Text style={styles.distLabel}>Presencial ({qtdPresencial})</Text>
                </View>
                <Text style={styles.distValue}>
                  {formatarMoeda(receitaPresencial)} • {pctPresencial.toFixed(0)}%
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.sectionTitleRow}>
        <Ionicons name="shield-half-outline" size={18} color="#FF6B00" />
        <Text style={styles.sectionTitle}>Radar de Retenção</Text>
      </View>
      <View style={styles.cardPadrao}>
        {alunosRisco.length === 0 ? (
          <View style={styles.emptyInlineBox}>
            <Ionicons name="checkmark-done-circle" size={24} color="#00E676" />
            <Text style={styles.emptyInlineText}>
              Nenhum aluno em risco de evasão detectado no momento. Excelente acompanhamento!
            </Text>
          </View>
        ) : (
          alunosRisco.map((item, idx) => {
            const cor = getCorPrioridade(item.prioridade);
            return (
              <TouchableOpacity
                key={`${item.conexao_id}-${idx}`}
                style={[styles.riscoRow, idx === alunosRisco.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}
                onPress={() =>
                  navigation.navigate("VisaoAluno", {
                    alunoId: item.aluno_id,
                    conexaoId: item.conexao_id,
                    nomeAluno: item.nome,
                  })
                }
                activeOpacity={0.75}
              >
                <View style={[styles.riscoDot, { backgroundColor: cor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.riscoNome} numberOfLines={1}>
                    {item.nome}
                  </Text>
                  <Text style={[styles.riscoMotivo, { color: cor }]}>{item.motivo}</Text>
                </View>
                <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                  <Text style={styles.riscoValor}>{formatarMoeda(item.valor_mensal)}</Text>
                  <Text style={styles.riscoAcaoHint}>Abrir ficha ›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}