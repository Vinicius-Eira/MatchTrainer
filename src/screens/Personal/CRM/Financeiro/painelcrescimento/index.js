import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Dimensions,
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
import { BarChart } from "react-native-gifted-charts";
import { styles } from "./PainelStyles";
import { usePainelCrescimento } from "./usePainelCrescimento";

const { width } = Dimensions.get("window");
const MESES_NOME_CURTO = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function PainelCrescimento({ navigation }) {
  const {
    loading,
    refreshing,
    kpis,
    onRefresh,
    modalMetaVisivel,
    setModalMetaVisivel,
    novaMetaValor,
    setNovaMetaValor,
    salvandoMeta,
    salvarNovaMeta,
    metricas,
    modalInfoVisivel,
    setModalInfoVisivel,
    infoDados,
    abrirInfo,
    insightIA,
  } = usePainelCrescimento();

  if (loading)
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );

  const { mrrAtual, mrrAnterior, crescimentoPct, valorMeta, diasParaMeta } =
    metricas;
  const progressoPct = valorMeta
    ? Math.min((mrrAtual / valorMeta) * 100, 100)
    : 0;

  const isPositivo = crescimentoPct >= 0;
  const growthColor = isPositivo ? "#00E676" : "#FF3B30";
  const growthBg = isPositivo
    ? "rgba(0, 230, 118, 0.15)"
    : "rgba(255, 59, 48, 0.15)";
  const growthIcon = isPositivo ? "trending-up" : "trending-down";

  const score = kpis?.score || 0;
  let scoreColor = "#FF3B30";
  let scoreText = "Risco de Evasão";
  let scoreDesc = "Sua conversão ou retenção precisam de atenção urgente.";
  if (score >= 80) {
    scoreColor = "#00E676";
    scoreText = "Nível Elite";
    scoreDesc = "Seu negócio está crescendo de forma extremamente saudável.";
  } else if (score >= 50) {
    scoreColor = "#FFD700";
    scoreText = "Em Crescimento";
    scoreDesc = "Bons números, mas há espaço para otimizar suas conversões.";
  }

  const totalContratos = kpis?.contratos_ativos || 0;
  const pctConsultoria =
    totalContratos > 0
      ? ((kpis?.distribuicao?.consultoria || 0) / totalContratos) * 100
      : 0;
  const pctPresencial =
    totalContratos > 0
      ? ((kpis?.distribuicao?.presencial || 0) / totalContratos) * 100
      : 0;
  const pctHibrido =
    totalContratos > 0
      ? ((kpis?.distribuicao?.hibrido || 0) / totalContratos) * 100
      : 0;

  const totalLeads = kpis?.funil?.leads || 0;
  const totalContatos = kpis?.funil?.em_contato || 0;
  const totalFechados = kpis?.funil?.fechados || 0;
  const taxaConversao =
    totalLeads > 0 ? ((totalFechados / totalLeads) * 100).toFixed(0) : 0;
  const tempoResposta = kpis?.funil?.tempo_resposta_horas || 0;
  const tempoFechamento = kpis?.funil?.tempo_fechamento_dias || 0;

  const perdaLeadContato = totalLeads - totalContatos;
  const perdaContatoCliente = totalContatos - totalFechados;
  let msgGargalo = "Nenhum dado suficiente.";
  if (totalLeads > 0) {
    if (perdaLeadContato > perdaContatoCliente)
      msgGargalo = "Você perde muitos Matches antes da conversa.";
    else msgGargalo = "Você perde alunos na etapa de Negociação.";
  }

  let chartData = [];
  let faturamentoMaximo = 0;
  let valorLinhaReferencia = valorMeta || 0;

  if (kpis?.historico && kpis.historico.length > 0) {
    faturamentoMaximo = Math.max(
      ...kpis.historico.map((d) => Number(d.faturamento)),
    );
    if (!valorMeta) valorLinhaReferencia = faturamentoMaximo;

    chartData = kpis.historico.map((item) => {
      const dataObj = new Date(item.mes_ref);
      const val = Number(item.faturamento);
      const isRecord = val === faturamentoMaximo && val > 0;
      return {
        value: val,
        label: MESES_NOME_CURTO[dataObj.getMonth()],
        frontColor: isRecord ? "#00E676" : "rgba(10, 132, 255, 0.8)",
        gradientColor: isRecord ? "#00C853" : "#0066CC",
        topLabelComponent: isRecord
          ? () => (
              <Ionicons
                name="trophy"
                size={16}
                color="#00E676"
                style={{ marginBottom: 4 }}
              />
            )
          : null,
        labelTextStyle: {
          color: isRecord ? "#FFF" : "#888",
          fontSize: 11,
          fontWeight: isRecord ? "bold" : "normal",
        },
      };
    });
  }
  const maxValueY = Math.max(faturamentoMaximo, valorLinhaReferencia) * 1.2;

  const txtMRR =
    "MRR significa Monthly Recurring Revenue (Receita Recorrente Mensal).\n\nEle é o coração da sua empresa. É a soma de todos os seus contratos e mensalidades ativas. Não entram aqui vendas avulsas, pois o MRR mostra apenas o dinheiro 'garantido' que entra todo mês se ninguém cancelar.";
  const dicaMRR =
    "O segredo para ficar rico não é fazer mais dinheiro em um mês, é aumentar o seu MRR mês após mês construindo uma base fiel.";
  const txtSaude =
    "Acompanhe exatamente a situação do seu caixa no mês atual:\n\n• Previsto: Soma de tudo que vence neste mês.\n• Recebido: Faturas que os alunos já pagaram.\n• Pendente: O que ainda vai vencer nos próximos dias.\n• Em Atraso: Faturas que já passaram do vencimento.";
  const dicaSaude =
    "Mantenha seu nível de Inadimplência abaixo de 5%. Use a tela de Recebimentos para lembrar os alunos de pagar com um clique.";
  const txtDist =
    "Este painel mostra de qual formato de treino vem a maior parte do seu faturamento.\n\nAlunos de consultoria online tendem a tomar menos do seu tempo físico em comparação aos alunos presenciais.";
  const dicaDist =
    "Se você quiser escalar a sua empresa (ganhar mais sem ter que trabalhar mais horas), foque em vender mais Contratos Online (Barra Azul).";
  const txtFunil =
    "O Funil de Vendas revela onde você está perdendo dinheiro.\n\nEle acompanha cada etapa: desde a curtida (Match), passando pelo envio do link de pagamento (Contatos), até a pessoa se tornar um Aluno Ativo (Cliente).";
  const dicaFunil =
    "Treinadores que respondem a novos Matches no aplicativo em menos de 10 minutos possuem uma Taxa de Conversão 40% maior!";
  const txtScore =
    "O Score é uma inteligência matemática exclusiva do MatchTrainer.\n\nNós damos uma nota de 0 a 100 para o seu negócio analisando a sua Taxa de Conversão, o nível de Inadimplência e o crescimento do seu Faturamento.";
  const dicaScore =
    "Para atingir o Nível Elite, foque em fechar mais contratos com os leads (Matches) e não deixar faturas atrasarem.";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        tint="dark"
        style={styles.header}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.btnVoltar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color="#FFF"
              style={{ marginLeft: -2 }}
            />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerSubtitle}>Central de Crescimento</Text>
            <Text style={styles.headerTitle}>MatchBusiness</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.btnInfo}
          onPress={() =>
            abrirInfo(
              "Como usar o Painel?",
              "O MatchBusiness é o seu consultor financeiro automático.\n\nNós não mostramos apenas números, nós cruzamos os dados da sua operação inteira (vendas, alunos, recebimentos) para que você saiba exatamente o que fazer para faturar mais no próximo mês.",
              "Role a tela e clique nos ícones ( i ) ao lado das métricas para entender como cada uma funciona!",
            )
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#0A84FF"
          />
        </TouchableOpacity>
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0A84FF"
          />
        }
      >
        {insightIA && (
          <View
            style={[
              styles.aiCardContainer,
              {
                backgroundColor: `${insightIA.cor}15`,
                borderColor: `${insightIA.cor}40`,
                shadowColor: insightIA.cor,
              },
            ]}
          >
            <View style={styles.aiHeaderRow}>
              <Ionicons
                name="sparkles"
                size={16}
                color="#A020F0"
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.aiTitle,
                  {
                    color: insightIA.cor,
                    fontSize: 13,
                    textTransform: "uppercase",
                  },
                ]}
              >
                Insights MatchTrainer
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View
                style={{
                  backgroundColor: `${insightIA.cor}20`,
                  padding: 10,
                  borderRadius: 12,
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={insightIA.icone}
                  size={24}
                  color={insightIA.cor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#FFF",
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {insightIA.titulo}
                </Text>
                <Text style={styles.aiText}>{insightIA.texto}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.scoreCard}>
          <View style={styles.scoreMainRow}>
            <View
              style={[
                styles.scoreCircle,
                { borderColor: scoreColor, shadowColor: scoreColor },
              ]}
            >
              <Text style={styles.scoreNumber}>{score}</Text>
            </View>
            <View style={styles.scoreTextContainer}>
              <View style={styles.scoreLabelRow}>
                <Text style={styles.scoreLabel}>Score do Negócio</Text>
                <TouchableOpacity
                  style={styles.btnInfo}
                  onPress={() =>
                    abrirInfo("Score do Negócio", txtScore, dicaScore)
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.scoreStatusTitle, { color: scoreColor }]}>
                {scoreText}
              </Text>
              <Text style={styles.scoreDesc}>{scoreDesc}</Text>
            </View>
          </View>

          {kpis?.score_motivos && kpis.score_motivos.length > 0 && (
            <View style={styles.scoreRaioXContainer}>
              {kpis.score_motivos.map((motivo, index) => (
                <View key={index} style={styles.scoreRaioXItem}>
                  <Ionicons
                    name={
                      motivo.tipo === "positivo"
                        ? "checkmark-circle"
                        : "warning"
                    }
                    size={14}
                    color={motivo.tipo === "positivo" ? "#00E676" : "#FFD700"}
                  />
                  <Text style={styles.scoreRaioXText}>{motivo.texto}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionTitleRow}>
          <Ionicons name="analytics" size={18} color="#0A84FF" />
          <Text style={styles.sectionTitle}>Evolução Financeira (6 meses)</Text>
        </View>
        <View
          style={[
            styles.mrrCard,
            { paddingHorizontal: 15, paddingVertical: 20 },
          ]}
        >
          {faturamentoMaximo > 0 ? (
            <BarChart
              data={chartData}
              width={width - 90}
              height={180}
              maxValue={maxValueY}
              barWidth={28}
              spacing={20}
              roundedTop
              isAnimated
              animationDuration={1000}
              yAxisColor="#333"
              xAxisColor="#333"
              yAxisThickness={1}
              xAxisThickness={1}
              yAxisTextStyle={{ color: "#888", fontSize: 10 }}
              noOfSections={4}
              showGradient
              showReferenceLine1
              referenceLine1Position={valorLinhaReferencia}
              referenceLine1Config={{
                color: valorMeta ? "#FFD700" : "#00E676",
                dashWidth: 4,
                dashGap: 4,
                thickness: 2,
              }}
              formatYLabel={(label) => {
                const val = Number(label);
                return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
              }}
              renderTooltip={(item) => {
                const faltam = valorLinhaReferencia - item.value;
                return (
                  <View
                    style={{
                      backgroundColor: "#1A1A1A",
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: "#333",
                      shadowColor: "#000",
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      width: 140,
                      marginLeft: -55,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 14,
                        fontWeight: "900",
                        marginBottom: 4,
                      }}
                    >
                      R$ {item.value}
                    </Text>
                    {faltam > 0 ? (
                      <Text
                        style={{
                          color: "#FFD700",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        📉 Faltam R$ {faltam}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: "#00E676",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        🏆 Meta Batida!
                      </Text>
                    )}
                  </View>
                );
              }}
            />
          ) : (
            <View
              style={{
                height: 180,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="stats-chart-outline"
                size={40}
                color="#333"
                style={{ marginBottom: 10 }}
              />
              <Text
                style={{ color: "#888", fontSize: 12, textAlign: "center" }}
              >
                Ainda não há dados suficientes.
              </Text>
            </View>
          )}
          {faturamentoMaximo > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 15,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: valorMeta ? "#FFD700" : "#00E676",
                  borderStyle: "dashed",
                  marginRight: 8,
                }}
              />
              <Text style={{ color: "#888", fontSize: 11, fontWeight: "bold" }}>
                {valorMeta
                  ? `Linha de Meta: R$ ${valorMeta}`
                  : `Recorde Atual: R$ ${faturamentoMaximo}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mrrCard}>
          <LinearGradient
            colors={["rgba(10, 132, 255, 0.12)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.mrrHeader}>
            <View style={styles.mrrLabelRow}>
              <Text style={styles.mrrLabel}>MRR Atual</Text>
              <TouchableOpacity
                style={styles.btnInfo}
                onPress={() =>
                  abrirInfo("MRR (Receita Recorrente)", txtMRR, dicaMRR)
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setModalMetaVisivel(true)}>
              <Ionicons name="pencil" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.mrrValueRow}>
            <Text style={styles.mrrValue}>
              R${" "}
              {mrrAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
            <View
              style={[
                styles.badgeGrowth,
                { backgroundColor: growthBg, borderColor: `${growthColor}40` },
              ]}
            >
              <Ionicons
                name={growthIcon}
                size={14}
                color={growthColor}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.badgeGrowthText, { color: growthColor }]}>
                {isPositivo ? "+" : ""}
                {crescimentoPct.toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={styles.mrrHistoryRow}>
            <View style={styles.mrrHistoryItem}>
              <Text style={styles.mrrHistoryLabel}>Mês Anterior</Text>
              <Text style={styles.mrrHistoryValue}>
                R${" "}
                {mrrAnterior.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={[styles.mrrHistoryItem, { alignItems: "flex-end" }]}>
              <Text style={styles.mrrHistoryLabel}>Crescimento Fixo</Text>
              <Text style={[styles.mrrHistoryValue, { color: growthColor }]}>
                R${" "}
                {Math.abs(mrrAtual - mrrAnterior).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {valorMeta ? (
            <View style={styles.metaProgressoContainer}>
              <View style={styles.metaProgressoHeader}>
                <Text style={styles.metaProgressoLabel}>Sua Grande Meta</Text>
                <Text style={styles.metaProgressoValue}>
                  {progressoPct.toFixed(0)}% (R${" "}
                  {valorMeta.toLocaleString("pt-BR")})
                </Text>
              </View>
              <View style={styles.metaBarBg}>
                <View
                  style={[styles.metaBarFill, { width: `${progressoPct}%` }]}
                />
              </View>
              {progressoPct < 100 && diasParaMeta !== null && (
                <View style={styles.insightPredicaoBox}>
                  <Ionicons name="sparkles" size={18} color="#0A84FF" />
                  <Text style={styles.insightPredicaoText}>
                    Você precisa crescer R$ {valorMeta - mrrAtual}. Mantendo o
                    ritmo atual, faltam{" "}
                    <Text style={{ color: "#FFF" }}>{diasParaMeta} dias</Text>.
                  </Text>
                </View>
              )}
              {progressoPct >= 100 && (
                <View
                  style={[
                    styles.insightPredicaoBox,
                    {
                      backgroundColor: "rgba(0, 230, 118, 0.15)",
                      borderColor: "rgba(0, 230, 118, 0.4)",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: 20,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="trophy" size={24} color="#00E676" />
                    <Text
                      style={{
                        color: "#00E676",
                        fontSize: 16,
                        fontWeight: "900",
                        marginLeft: 10,
                        textTransform: "uppercase",
                      }}
                    >
                      Meta Superada!
                    </Text>
                  </View>
                  <Text style={{ color: "#FFF", fontSize: 13, lineHeight: 18 }}>
                    Parabéns, você é a elite! O seu selo de Conquista já está
                    desbloqueado no seu perfil público. Defina uma meta maior
                    para o próximo mês.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setModalMetaVisivel(true)}
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                padding: 12,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#333",
                borderStyle: "dashed",
              }}
            >
              <Text style={{ color: "#AAA", fontWeight: "bold", fontSize: 12 }}>
                + Definir Meta Mensal
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionTitleRow}>
          <Ionicons name="grid" size={18} color="#FFF" />
          <Text style={styles.sectionTitle}>Saúde do Negócio (Mês Atual)</Text>
          <TouchableOpacity
            style={styles.btnInfo}
            onPress={() => abrirInfo("Saúde do Negócio", txtSaude, dicaSaude)}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(10, 132, 255, 0.15)" },
              ]}
            >
              <Ionicons name="bar-chart" size={16} color="#0A84FF" />
            </View>
            <Text style={styles.kpiLabel}>Receita Prevista</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.receita_total?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(0, 230, 118, 0.15)" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={16} color="#00E676" />
            </View>
            <Text style={styles.kpiLabel}>Receita Recebida</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.receita_recebida?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(255, 215, 0, 0.15)" },
              ]}
            >
              <Ionicons name="time" size={16} color="#FFD700" />
            </View>
            <Text style={styles.kpiLabel}>Receita Pendente</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.receita_pendente?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(255, 59, 48, 0.15)" },
              ]}
            >
              <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            </View>
            <Text style={styles.kpiLabel}>Em Atraso</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: kpis?.receita_atraso > 0 ? "#FF3B30" : "#FFF" },
              ]}
            >
              R${" "}
              {kpis?.receita_atraso?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(255, 107, 0, 0.15)" },
              ]}
            >
              <Ionicons name="pricetag" size={16} color="#FF6B00" />
            </View>
            <Text style={styles.kpiLabel}>Ticket Médio</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.ticket_medio?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.kpiBox}>
            <View
              style={[
                styles.kpiIconBg,
                { backgroundColor: "rgba(10, 132, 255, 0.15)" },
              ]}
            >
              <Ionicons name="people" size={16} color="#0A84FF" />
            </View>
            <Text style={styles.kpiLabel}>Alunos / Contratos</Text>
            <Text style={styles.kpiValue}>
              {kpis?.alunos_ativos} / {kpis?.contratos_ativos}
            </Text>
          </View>
        </View>

        {kpis?.receita_atraso > 0 && (
          <View
            style={{
              backgroundColor: "rgba(255, 59, 48, 0.1)",
              padding: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(255, 59, 48, 0.3)",
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="alert-circle"
              size={24}
              color="#FF3B30"
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#FF3B30",
                  fontWeight: "bold",
                  fontSize: 13,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Saúde Financeira em Risco
              </Text>
              <Text style={{ color: "#FFF", fontSize: 12 }}>
                Cerca de{" "}
                {((kpis?.receita_atraso / kpis?.receita_total) * 100).toFixed(
                  1,
                )}
                % da sua receita prevista está atrasada.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionTitleRow}>
          <Ionicons name="pie-chart" size={18} color="#00E676" />
          <Text style={styles.sectionTitle}>Distribuição da Receita</Text>
          <TouchableOpacity
            style={styles.btnInfo}
            onPress={() =>
              abrirInfo("Distribuição da Receita", txtDist, dicaDist)
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.distContainer}>
          {totalContratos === 0 ? (
            <Text style={{ color: "#888", textAlign: "center", fontSize: 12 }}>
              Nenhum contrato ativo para gerar distribuição.
            </Text>
          ) : (
            <>
              <View style={styles.stackedBar}>
                {pctConsultoria > 0 && (
                  <View
                    style={{
                      width: `${pctConsultoria}%`,
                      backgroundColor: "#0A84FF",
                    }}
                  />
                )}
                {pctPresencial > 0 && (
                  <View
                    style={{
                      width: `${pctPresencial}%`,
                      backgroundColor: "#00E676",
                    }}
                  />
                )}
                {pctHibrido > 0 && (
                  <View
                    style={{
                      width: `${pctHibrido}%`,
                      backgroundColor: "#FF6B00",
                    }}
                  />
                )}
              </View>
              <View style={styles.distLegendContainer}>
                <View style={styles.distLegendItem}>
                  <View style={styles.distLegendLeft}>
                    <View
                      style={[styles.distDot, { backgroundColor: "#0A84FF" }]}
                    />
                    <Text style={styles.distLabel}>Online (Consultoria)</Text>
                  </View>
                  <Text style={styles.distValue}>
                    {pctConsultoria.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.distLegendItem}>
                  <View style={styles.distLegendLeft}>
                    <View
                      style={[styles.distDot, { backgroundColor: "#00E676" }]}
                    />
                    <Text style={styles.distLabel}>Presencial</Text>
                  </View>
                  <Text style={styles.distValue}>
                    {pctPresencial.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.distLegendItem}>
                  <View style={styles.distLegendLeft}>
                    <View
                      style={[styles.distDot, { backgroundColor: "#FF6B00" }]}
                    />
                    <Text style={styles.distLabel}>Híbrido / </Text>
                  </View>
                  <Text style={styles.distValue}>{pctHibrido.toFixed(0)}%</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionTitleRow}>
          <FontAwesome5 name="filter" size={16} color="#0A84FF" />
          <Text style={styles.sectionTitle}>Funil Comercial</Text>
          <TouchableOpacity
            style={styles.btnInfo}
            onPress={() => abrirInfo("Funil de Vendas", txtFunil, dicaFunil)}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.funilContainer}>
          <View style={styles.funilEtapa}>
            <Text style={styles.funilEtapaLabel}>1. Matches</Text>
            <View style={styles.funilBarBg}>
              <LinearGradient
                colors={["#333", "#444"]}
                style={[styles.funilBarFill, { width: "100%" }]}
              />
              <Text style={[styles.funilEtapaValue, { color: "#FFF" }]}>
                {totalLeads}
              </Text>
            </View>
          </View>
          <View style={styles.funilEtapa}>
            <Text style={styles.funilEtapaLabel}>2. Contatos</Text>
            <View style={styles.funilBarBg}>
              <LinearGradient
                colors={["#0A84FF", "#0066CC"]}
                style={[
                  styles.funilBarFill,
                  {
                    width:
                      totalLeads > 0
                        ? `${(totalContatos / totalLeads) * 100}%`
                        : "0%",
                  },
                ]}
              />
              <Text style={styles.funilEtapaValue}>{totalContatos}</Text>
            </View>
          </View>
          <View style={styles.funilEtapa}>
            <Text style={styles.funilEtapaLabel}>3. Clientes</Text>
            <View style={styles.funilBarBg}>
              <LinearGradient
                colors={["#00E676", "#00C853"]}
                style={[
                  styles.funilBarFill,
                  {
                    width:
                      totalLeads > 0
                        ? `${(totalFechados / totalLeads) * 100}%`
                        : "0%",
                  },
                ]}
              />
              <Text style={styles.funilEtapaValue}>{totalFechados}</Text>
            </View>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#222",
              marginTop: 10,
              paddingTop: 15,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#888", fontSize: 12, fontWeight: "bold" }}>
              TAXA DE CONVERSÃO
            </Text>
            <Text style={{ color: "#00E676", fontSize: 18, fontWeight: "900" }}>
              {taxaConversao}%
            </Text>
          </View>

          <View style={styles.funilTempoRow}>
            <View style={styles.funilTempoBox}>
              <Text style={styles.funilTempoLabel}>Tempo Resposta</Text>
              <Text style={styles.funilTempoValue}>
                {tempoResposta > 0 ? `${tempoResposta}h` : "--"}
              </Text>
            </View>
            <View style={styles.funilTempoBox}>
              <Text style={styles.funilTempoLabel}>Tempo Fechar</Text>
              <Text style={styles.funilTempoValue}>
                {tempoFechamento > 0 ? `${tempoFechamento}d` : "--"}
              </Text>
            </View>
            <View
              style={[
                styles.funilTempoBox,
                {
                  backgroundColor: "rgba(255, 215, 0, 0.05)",
                  borderColor: "rgba(255, 215, 0, 0.2)",
                },
              ]}
            >
              <Text style={[styles.funilTempoLabel, { color: "#FFD700" }]}>
                Principal Gargalo
              </Text>
              <Text
                style={[
                  styles.funilTempoValue,
                  { fontSize: 10, lineHeight: 12, textAlign: "center" },
                ]}
              >
                {msgGargalo}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalInfoVisivel} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{infoDados.titulo}</Text>
              <TouchableOpacity
                onPress={() => setModalInfoVisivel(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center" }}>
              <View style={styles.infoModalIconBox}>
                <Ionicons name="book" size={28} color="#0A84FF" />
              </View>
            </View>
            <Text style={styles.infoModalText}>{infoDados.texto}</Text>
            <View style={styles.infoModalDicaBox}>
              <Ionicons name="bulb" size={24} color="#FFD700" />
              <Text style={styles.infoModalDicaText}>{infoDados.dica}</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalMetaVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Definir Meta de MRR</Text>
              <TouchableOpacity
                onPress={() => setModalMetaVisivel(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
              Defina quanto você deseja atingir de Faturamento Mensal. O
              MatchTrainer vai te ajudar com micro-passos.
            </Text>
            <Text style={styles.inputLabel}>Valor Alvo (R$)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputPrefix}>R$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={novaMetaValor}
                onChangeText={setNovaMetaValor}
                cursorColor="#0A84FF"
                placeholder="Ex: 5000,00"
                placeholderTextColor="#555"
              />
            </View>
            <TouchableOpacity
              style={[styles.btnConfirmar, salvandoMeta && { opacity: 0.7 }]}
              onPress={salvarNovaMeta}
              disabled={salvandoMeta}
            >
              {salvandoMeta ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnConfirmarText}>Salvar Meta</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
